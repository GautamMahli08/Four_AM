import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Map, 
  Search, 
  Filter, 
  Layers, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useVehicleStore, Vehicle } from '@/store/useVehicleStore';
import { useAuthStore } from '@/store/useAuthStore';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function VehicleMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  
  const { vehicles, selectVehicle, selectedVehicleId } = useVehicleStore();
  const { user } = useAuthStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'normal'>('all');

  const accessibleVehicles = (user?.role === 'manager' 
    ? vehicles 
    : vehicles.filter(v => user?.assignedVehicleIds.includes(v.id))
  ).filter(v => 
    v.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVehicles = filterSeverity === 'all' 
    ? accessibleVehicles
    : accessibleVehicles.filter(v => {
        const hasAlerts = v.alerts.some(a => !a.acknowledged);
        const hasCritical = v.alerts.some(a => a.severity === 'critical' && !a.acknowledged);
        const hasWarning = v.alerts.some(a => a.severity === 'warning' && !a.acknowledged);
        
        switch (filterSeverity) {
          case 'critical': return hasCritical;
          case 'warning': return hasWarning && !hasCritical;
          case 'normal': return !hasAlerts;
          default: return true;
        }
      });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([23.0225, 72.5714], 10);
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    
    Object.values(markersRef.current).forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    filteredVehicles.forEach(vehicle => {
      const { lat, lng } = vehicle.sensorData.gps;
      
      const hasAlerts = vehicle.alerts.some(a => !a.acknowledged);
      const hasCritical = vehicle.alerts.some(a => a.severity === 'critical' && !a.acknowledged);
      const hasWarning = vehicle.alerts.some(a => a.severity === 'warning' && !a.acknowledged);
      
      let markerColor = '#10b981';
      if (hasCritical) markerColor = '#ef4444';
      else if (hasWarning) markerColor = '#f59e0b';
      else if (vehicle.status === 'offline') markerColor = '#6b7280';

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background-color: ${markerColor};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background-color: white;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([lat, lng], { icon: customIcon })
        .bindPopup(`
          <div class="p-2 min-w-[200px]">
            <h3 class="font-bold text-sm">${vehicle.vehicleId}</h3>
            <p class="text-xs text-gray-600">${vehicle.company}</p>
            <p class="text-xs">Driver: ${vehicle.driverName}</p>
            <p class="text-xs">Status: <span style="color: ${markerColor}">${vehicle.status}</span></p>
            <p class="text-xs">Speed: ${vehicle.sensorData.gps.speed} km/h</p>
            <p class="text-xs">Fuel: ${(vehicle.sensorData.fuel.totalFuel / 1000).toFixed(1)}K L</p>
            ${hasAlerts ? `<p class="text-xs text-red-600 font-medium">⚠ ${vehicle.alerts.filter(a => !a.acknowledged).length} active alerts</p>` : ''}
          </div>
        `)
        .on('click', () => {
          selectVehicle(vehicle.id);
        })
        .addTo(map);

      markersRef.current[vehicle.id] = marker;
    });

    if (filteredVehicles.length > 0) {
      const group = new L.FeatureGroup(Object.values(markersRef.current));
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [filteredVehicles, selectVehicle]);

  const getVehicleStatusBadge = (vehicle: Vehicle) => {
    const hasAlerts = vehicle.alerts.some(a => !a.acknowledged);
    const hasCritical = vehicle.alerts.some(a => a.severity === 'critical' && !a.acknowledged);
    const hasWarning = vehicle.alerts.some(a => a.severity === 'warning' && !a.acknowledged);
    
    if (hasCritical) return { variant: 'destructive' as const, text: 'Critical', icon: AlertTriangle };
    if (hasWarning) return { variant: 'warning' as const, text: 'Warning', icon: AlertTriangle };
    if (vehicle.status === 'offline') return { variant: 'secondary' as const, text: 'Offline', icon: Clock };
    return { variant: 'success' as const, text: 'Normal', icon: CheckCircle };
  };

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <Card className="fuel-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              <span>Live Vehicle Tracking</span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-xs">
                <div className="w-2 h-2 bg-success rounded-full mr-1 animate-pulse" />
                Live
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles, companies, drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'critical', 'warning', 'normal'] as const).map((severity) => (
                <Button
                  key={severity}
                  variant={filterSeverity === severity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterSeverity(severity)}
                  className="capitalize"
                >
                  <Filter className="mr-1 h-3 w-3" />
                  {severity}
                </Button>
              ))}
            </div>
          </div>

          {/* Map Container */}
          <div className="relative">
            <div ref={mapRef} className="h-[48vh] md:h-[55vh] w-full rounded-lg border border-border" />
            
            {/* Map Overlay Info */}
            <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-md border border-border/50">
              <div className="text-sm font-medium mb-2">Vehicle Status</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span>Normal ({filteredVehicles.filter(v => !v.alerts.some(a => !a.acknowledged)).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <span>Warning ({filteredVehicles.filter(v => v.alerts.some(a => a.severity === 'warning' && !a.acknowledged)).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <span>Critical ({filteredVehicles.filter(v => v.alerts.some(a => a.severity === 'critical' && !a.acknowledged)).length})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[28vh] overflow-y-auto pr-1">
            {filteredVehicles.map((vehicle) => {
              const statusBadge = getVehicleStatusBadge(vehicle);
              return (
                <div
                  key={vehicle.id}
                  className={`p-3 rounded-lg border bg-card cursor-pointer transition-all hover:border-primary/60 hover:shadow-sm ${
                    selectedVehicleId === vehicle.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                  onClick={() => selectVehicle(vehicle.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{vehicle.vehicleId}</h4>
                    <Badge variant={statusBadge.variant} className="text-xs">
                      <statusBadge.icon className="mr-1 h-3 w-3" />
                      {statusBadge.text}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>{vehicle.company}</p>
                    <p>Driver: {vehicle.driverName}</p>
                    <p>Speed: {vehicle.sensorData.gps.speed} km/h</p>
                    <p>Fuel: {(vehicle.sensorData.fuel.totalFuel / 1000).toFixed(1)}K L</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
