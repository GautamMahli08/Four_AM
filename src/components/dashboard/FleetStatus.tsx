import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Truck, 
  Gauge, 
  Droplets, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { useVehicleStore } from '@/store/useVehicleStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function FleetStatus() {
  const { vehicles } = useVehicleStore();
  const { user } = useAuthStore();

  const accessibleVehicles = user?.role === 'manager' 
    ? vehicles 
    : vehicles.filter(v => user?.assignedVehicleIds.includes(v.id));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'idle': return <Clock className="h-4 w-4" />;
      case 'maintenance': return <AlertTriangle className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'idle': return 'warning';
      case 'maintenance': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="fuel-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          <span>Fleet Status</span>
          <Badge variant="outline" className="ml-auto">
            {accessibleVehicles.length} Vehicles
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accessibleVehicles.map((vehicle) => {
            const totalFuel = vehicle.sensorData.fuel.totalFuel;
            const totalCapacity = vehicle.compartments.reduce((sum, comp) => sum + comp.capacity, 0);
            const fuelPercentage = (totalFuel / totalCapacity) * 100;
            const hasAlerts = vehicle.alerts.some(a => !a.acknowledged);

            return (
              <div key={vehicle.id} className="border border-border rounded-lg p-4 space-y-3 bg-card">
                {/* Vehicle Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(vehicle.status)}
                      <span className="font-medium text-sm">{vehicle.vehicleId}</span>
                    </div>
                    <Badge variant={getStatusColor(vehicle.status) as any} className="text-xs">
                      {vehicle.status}
                    </Badge>
                    {hasAlerts && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {vehicle.alerts.filter(a => !a.acknowledged).length}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Gauge className="h-3 w-3" />
                    <span>{vehicle.sensorData.gps.speed} km/h</span>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>{vehicle.company}</div>
                  <div className="flex items-center gap-1 justify-end md:justify-start">
                    <MapPin className="h-3 w-3" />
                    <span>{vehicle.driverName}</span>
                  </div>
                </div>

                {/* Fuel Overview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Droplets className="h-3 w-3" />
                      <span>Total Fuel</span>
                    </span>
                    <span className="font-medium">
                      {(totalFuel / 1000).toFixed(1)}K / {(totalCapacity / 1000).toFixed(0)}K L
                    </span>
                  </div>
                  <Progress value={fuelPercentage} className="h-2" />
                </div>

                {/* 4 Compartments */}
                <div className="grid grid-cols-4 gap-2">
                  {vehicle.compartments.map((compartment, index) => (
                    <div key={compartment.id} className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">C{index + 1}</div>
                      <div className="relative">
                        <div className="w-full h-12 bg-muted rounded border overflow-hidden">
                          <div 
                            className="bg-primary rounded transition-all duration-300"
                            style={{
                              height: `${compartment.percentage}%`,
                              marginTop: `${100 - compartment.percentage}%`
                            }}
                          />
                        </div>
                        <div className="text-xs font-medium mt-1">
                          {Math.round(compartment.percentage)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Route Info */}
                {vehicle.route && (
                  <div className="text-xs text-muted-foreground border-t border-border pt-2">
                    <div className="flex justify-between items-center">
                      <span>{vehicle.route.origin} → {vehicle.route.destination}</span>
                      <span>{vehicle.route.progress}% complete</span>
                    </div>
                    <Progress value={vehicle.route.progress} className="h-1 mt-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
