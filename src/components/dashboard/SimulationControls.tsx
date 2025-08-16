import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Square, 
  AlertTriangle, 
  Route, 
  Activity, 
  Settings,
  Zap
} from 'lucide-react';
import { useVehicleStore } from '@/store/useVehicleStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/hooks/use-toast';

export default function SimulationControls() {
  const { vehicles, addAlert, updateVehicle } = useVehicleStore();
  const { user } = useAuthStore();
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const scenarios = [
    {
      id: 'theft',
      name: 'Fuel Theft',
      description: 'Simulate tilt + rapid fuel loss + drain valve',
      severity: 'critical' as const,
      icon: AlertTriangle,
      color: 'destructive'
    },
    {
      id: 'route_violation', 
      name: 'Route Violation',
      description: 'Vehicle deviates outside geofence',
      severity: 'warning' as const,
      icon: Route,
      color: 'warning'
    },
    {
      id: 'sensor_degradation',
      name: 'Sensor Health',
      description: 'Fuel probe stops responding',
      severity: 'info' as const,
      icon: Activity,
      color: 'secondary'
    },
    {
      id: 'normal_delivery',
      name: 'Normal Delivery',
      description: 'Standard fuel consumption pattern',
      severity: 'info' as const,
      icon: Play,
      color: 'success'
    }
  ];

  const triggerScenario = async (scenarioId: string) => {
    if (!selectedVehicle) {
      toast({
        title: "Select Vehicle",
        description: "Please select a vehicle first",
        variant: "destructive"
      });
      return;
    }

    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    if (!vehicle) return;

    setIsSimulating(true);
    setActiveScenario(scenarioId);

    const scenario = scenarios.find(s => s.id === scenarioId);
    
    toast({
      title: `Simulation Started`,
      description: `Triggering ${scenario?.name} for ${vehicle.vehicleId}`,
    });

    switch (scenarioId) {
      case 'theft':
        setTimeout(() => {
          const alert = {
            id: `alert-${Date.now()}`,
            vehicleId: vehicle.id,
            type: 'theft' as const,
            severity: 'critical' as const,
            title: 'CRITICAL: Fuel Theft Detected',
            message: `Unusual tilt (35°) and rapid fuel loss (-15L) detected on ${vehicle.vehicleId}. Drain valve appears compromised.`,
            timestamp: new Date().toISOString(),
            acknowledged: false,
            ruleId: 'theft-rule-001',
            snapshot: {
              tiltAngle: 35,
              fuelLoss: 15,
              drainStatus: true,
              location: vehicle.sensorData.gps
            }
          };
          
          addAlert(alert);
          
          updateVehicle(vehicle.id, {
            sensorData: {
              ...vehicle.sensorData,
              tilt: { ...vehicle.sensorData.tilt, pitch: 35 },
              valve: { ...vehicle.sensorData.valve, drainOpen: true, drainComplete: true },
              fuel: { 
                ...vehicle.sensorData.fuel, 
                totalFuel: Math.max(0, vehicle.sensorData.fuel.totalFuel - 1500),
                flowRate: -12.5
              }
            }
          });

          toast({
            title: "🚨 THEFT ALERT",
            description: `Critical theft detected on ${vehicle.vehicleId}!`,
            variant: "destructive"
          });
        }, 2000);
        break;

      case 'route_violation':
        setTimeout(() => {
          const alert = {
            id: `alert-${Date.now()}`,
            vehicleId: vehicle.id,
            type: 'route_violation' as const,
            severity: 'warning' as const,
            title: 'Route Violation Detected',
            message: `${vehicle.vehicleId} has deviated from authorized route by 800m for >90 seconds.`,
            timestamp: new Date().toISOString(),
            acknowledged: false,
            ruleId: 'route-rule-001',
            snapshot: {
              deviation: 800,
              duration: 95,
              location: vehicle.sensorData.gps
            }
          };
          
          addAlert(alert);
          
          toast({
            title: "⚠️ Route Violation",
            description: `${vehicle.vehicleId} outside geofence`,
            variant: "destructive"
          });
        }, 1500);
        break;

      case 'sensor_degradation':
        setTimeout(() => {
          const alert = {
            id: `alert-${Date.now()}`,
            vehicleId: vehicle.id,
            type: 'sensor_health' as const,
            severity: 'info' as const,
            title: 'Sensor Health Warning',
            message: `Fuel probe on ${vehicle.vehicleId} has stopped responding. Last reading: 65 seconds ago.`,
            timestamp: new Date().toISOString(),
            acknowledged: false,
            ruleId: 'sensor-rule-001'
          };
          
          addAlert(alert);
          
          toast({
            title: "📡 Sensor Issue",
            description: `${vehicle.vehicleId} fuel probe offline`,
          });
        }, 1000);
        break;

      case 'normal_delivery':
        toast({
          title: "✅ Normal Operation",
          description: `${vehicle.vehicleId} resumed normal delivery pattern`,
          variant: "default"
        });
        
        updateVehicle(vehicle.id, {
          sensorData: {
            ...vehicle.sensorData,
            tilt: { ...vehicle.sensorData.tilt, pitch: 2 },
            valve: { ...vehicle.sensorData.valve, drainOpen: false, drainComplete: false },
            fuel: { 
              ...vehicle.sensorData.fuel, 
              flowRate: -0.2
            }
          }
        });
        break;
    }

    setTimeout(() => {
      setIsSimulating(false);
      setActiveScenario(null);
    }, 5000);
  };

  return (
    <Card className="fuel-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <span>
            {user?.role === 'driver' 
              ? 'Vehicle Simulation Controls' 
              : 'Simulation Controls'}
          </span>
          <Badge variant="secondary" className="text-xs">
            <Zap className="mr-1 h-3 w-3" />
            {user?.role === 'driver' ? 'My Vehicle' : 'Live'}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Vehicle Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Vehicle</label>
          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a vehicle for simulation" />
            </SelectTrigger>
            <SelectContent>
              {vehicles
                .filter(vehicle => 
                  !user?.assignedVehicleIds.length || 
                  user.assignedVehicleIds.includes(vehicle.id)
                )
                .map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{vehicle.vehicleId}</span>
                    <span className="text-muted-foreground">- {vehicle.company}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Scenario Buttons */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Demo Scenarios</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scenarios.map((scenario) => (
              <Button
                key={scenario.id}
                variant={activeScenario === scenario.id ? 'default' : 'outline'}
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => triggerScenario(scenario.id)}
                disabled={isSimulating && activeScenario !== scenario.id}
              >
                <div className="flex items-center gap-2 w-full">
                  <scenario.icon className="h-4 w-4" />
                  <span className="font-medium">{scenario.name}</span>
                  {activeScenario === scenario.id && (
                    <Badge variant="success" className="ml-auto text-xs">
                      Running
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  {scenario.description}
                </p>
              </Button>
            ))}
          </div>
        </div>

        {/* Status */}
        {isSimulating && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium">Simulation Active</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Running {scenarios.find(s => s.id === activeScenario)?.name} scenario...
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
          <p><strong> Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Select a vehicle and trigger scenarios to see real-time alerts</li>
            <li>Theft scenario shows critical alert + sensor changes</li>
            <li>Route violation demonstrates geofence monitoring</li>
            <li>Use "Normal Delivery" to reset vehicle state</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
