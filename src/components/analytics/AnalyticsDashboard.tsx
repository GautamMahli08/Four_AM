import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Fuel, 
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { useVehicleStore } from '@/store/useVehicleStore';

export default function AnalyticsDashboard() {
  const { vehicles, alerts } = useVehicleStore();

  // Analytics calculations
  const analytics = useMemo(() => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fuel consumption trends (simulated hourly data)
    const fuelTrends = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      const baseConsumption = 150 + Math.sin(i * Math.PI / 12) * 50;
      const variation = Math.random() * 30 - 15;
      return {
        hour: hour.getHours(),
        time: hour.toISOString(),
        consumption: Math.round(baseConsumption + variation),
        efficiency: Math.round((85 + Math.random() * 10) * 100) / 100
      };
    });

    // Alert patterns by hour
    const alertPatterns = Array.from({ length: 24 }, (_, i) => {
      const riskFactors = [0.2, 0.1, 0.1, 0.1, 0.3, 0.5, 0.8, 1.2, 1.0, 0.8, 0.6, 0.5, 
                          0.7, 0.9, 1.1, 1.3, 1.5, 1.8, 1.2, 0.9, 0.7, 0.5, 0.4, 0.3];
      const baseAlerts = riskFactors[i] * 3;
      return {
        hour: i,
        critical: Math.round(baseAlerts * 0.3 + Math.random()),
        warning: Math.round(baseAlerts * 0.5 + Math.random() * 2),
        info: Math.round(baseAlerts * 0.2 + Math.random())
      };
    });

    // Fleet efficiency by vehicle
    const fleetEfficiency = vehicles.map(vehicle => ({
      vehicleId: vehicle.vehicleId,
      efficiency: Math.round((88 + Math.random() * 8) * 100) / 100,
      fuelSaved: Math.round((Math.random() * 500 + 200) * 100) / 100,
      status: vehicle.status
    }));

    // ROI calculation
    const totalFuelCost = 650000; // Monthly baseline
    const currentTheftRate = 0.8; // 0.8% vs 5% baseline
    const baselineTheftRate = 5.0;
    const monthlySavings = totalFuelCost * (baselineTheftRate - currentTheftRate) / 100;
    const annualSavings = monthlySavings * 12;

    return {
      fuelTrends,
      alertPatterns,
      fleetEfficiency,
      roi: {
        monthlySavings: Math.round(monthlySavings),
        annualSavings: Math.round(annualSavings),
        currentTheftRate,
        baselineTheftRate,
        paybackPeriod: 8.5 // months
      }
    };
  }, [vehicles, alerts]);

  const COLORS = ['hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      {/* ROI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="fuel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ₹{analytics.roi.monthlySavings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              vs ₹{(650000 * 0.05).toLocaleString()} baseline
            </p>
          </CardContent>
        </Card>

        <Card className="fuel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Theft Reduction</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {analytics.roi.baselineTheftRate - analytics.roi.currentTheftRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              From {analytics.roi.baselineTheftRate}% to {analytics.roi.currentTheftRate}%
            </p>
          </CardContent>
        </Card>

        <Card className="fuel-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {analytics.roi.paybackPeriod}mo
            </div>
            <p className="text-xs text-muted-foreground">
              Payback period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Consumption Trends */}
        <Card className="fuel-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Fuel className="h-5 w-5" />
              <span>24h Fuel Consumption</span>
              <Badge variant="secondary" className="ml-auto">Live</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.fuelTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(hour) => `Time: ${hour}:00`}
                  formatter={(value, name) => [
                    name === 'consumption' ? `${value}L` : `${value}%`,
                    name === 'consumption' ? 'Fuel Used' : 'Efficiency'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.2)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alert Patterns */}
        <Card className="fuel-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Alert Patterns (24h)</span>
              <Badge variant="warning" className="ml-auto">Analysis</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.alertPatterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(hour) => `Time: ${hour}:00`}
                />
                <Bar dataKey="critical" stackId="a" fill="hsl(var(--destructive))" />
                <Bar dataKey="warning" stackId="a" fill="hsl(var(--warning))" />
                <Bar dataKey="info" stackId="a" fill="hsl(var(--muted))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fleet Efficiency */}
        <Card className="fuel-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Fleet Efficiency</span>
              <Badge variant="success" className="ml-auto">Optimized</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.fleetEfficiency} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[80, 100]} />
                <YAxis dataKey="vehicleId" type="category" width={80} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'efficiency' ? `${value}%` : `₹${value}`,
                    name === 'efficiency' ? 'Efficiency' : 'Fuel Saved'
                  ]}
                />
                <Bar dataKey="efficiency" fill="hsl(var(--success))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="fuel-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Performance Summary</span>
              <Badge variant="secondary" className="ml-auto">Real-time</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-success">98.5%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">5</div>
                <div className="text-sm text-muted-foreground">Active Vehicles</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Theft Prevention</span>
                <Badge variant="success">Excellent</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Route Compliance</span>
                <Badge variant="success">94%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sensor Health</span>
                <Badge variant="warning">1 Alert</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Fuel Efficiency</span>
                <Badge variant="success">+12%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}