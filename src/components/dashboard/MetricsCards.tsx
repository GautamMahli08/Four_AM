import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  Fuel, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Shield
} from 'lucide-react';
import { useVehicleStore } from '@/store/useVehicleStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function MetricsCards() {
  const { vehicles, alerts } = useVehicleStore();
  const { user } = useAuthStore();
  
  const accessibleVehicles = user?.role === 'manager' 
    ? vehicles 
    : vehicles.filter(v => user?.assignedVehicleIds.includes(v.id));

  const activeVehicles = accessibleVehicles.filter(v => v.status === 'active').length;
  const totalFuel = accessibleVehicles.reduce((sum, v) => 
    sum + v.sensorData.fuel.totalFuel, 0
  );
  const todayAlerts = alerts.filter(a => {
    const today = new Date().toDateString();
    const alertDate = new Date(a.timestamp).toDateString();
    return today === alertDate;
  });
  const criticalAlertsToday = todayAlerts.filter(a => a.severity === 'critical').length;
  
  const avgEfficiency = accessibleVehicles.length > 0 
    ? (accessibleVehicles.reduce((sum, v) => sum + (v.route?.progress || 0), 0) / accessibleVehicles.length).toFixed(1)
    : '0';

  const metrics = [
    {
      title: 'Active Vehicles',
      value: activeVehicles,
      total: accessibleVehicles.length,
      icon: Truck,
      trend: '+2 from yesterday',
      status: 'success' as const
    },
    {
      title: 'Total Fuel',
      value: `${(totalFuel / 1000).toFixed(1)}K`,
      unit: 'Litres',
      icon: Fuel,
      trend: '-0.8% from yesterday',
      status: 'neutral' as const
    },
    {
      title: 'Critical Alerts',
      value: criticalAlertsToday,
      unit: 'Today',
      icon: AlertTriangle,
      trend: criticalAlertsToday > 0 ? 'Requires attention' : 'All clear',
      status: criticalAlertsToday > 0 ? 'critical' : 'success' as const
    },
    {
      title: 'Avg Efficiency',
      value: `${avgEfficiency}%`,
      unit: 'Route Progress',
      icon: TrendingUp,
      trend: '+2.1% from last week',
      status: 'success' as const
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-success';
      case 'critical': return 'text-destructive';
      case 'warning': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'destructive': return 'destructive';
      case 'critical': return 'destructive';
      case 'warning': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title} className="metric-card transition-transform duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className={`h-5 w-5 ${getStatusColor(metric.status)}`} />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-shadow-glow">
                  {metric.value}
                </div>
                {metric.unit && (
                  <span className="text-sm text-muted-foreground">
                    {metric.unit}
                  </span>
                )}
                {('total' in metric) && metric.total !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    / {metric.total}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {metric.trend}
                </p>
                <Badge variant={getStatusBadge(metric.status)} className="text-xs">
                  <Activity className="mr-1 h-3 w-3" />
                  Live
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Security Status Card */}
      <Card className="metric-card md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-success" />
            <span>Security Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">99.8%</div>
              <p className="text-sm text-muted-foreground">Security Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0.2%</div>
              <p className="text-sm text-muted-foreground">Theft Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                ₹{((totalFuel * 95 * 0.002) / 100000).toFixed(1)}L
              </div>
              <p className="text-sm text-muted-foreground">Monthly Savings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
