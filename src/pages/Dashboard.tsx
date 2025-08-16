import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useSimulation } from '@/hooks/useSimulation';
import Header from '@/components/dashboard/Header';
import MetricsCards from '@/components/dashboard/MetricsCards';
import VehicleMap from '@/components/dashboard/VehicleMap';
import AlertsFeed from '@/components/dashboard/AlertsFeed';
import SimulationControls from '@/components/dashboard/SimulationControls';
import FleetStatus from '@/components/dashboard/FleetStatus';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import SystemSettings from '@/components/settings/SystemSettings';

export default function Dashboard() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  
  // Start simulation
  useSimulation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-shadow-glow">
            Welcome back, {user.name}
          </h1>
          <p className="text-muted-foreground">
            {user.role === 'manager' 
              ? 'Monitor your entire fleet and security operations'
              : user.role === 'operator'
              ? 'Monitor assigned vehicles and manage alerts'
              : 'View your assigned vehicle status and route information'
            }
          </p>
        </div>

        {/* Metrics Overview */}
        <MetricsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Map */}
          <div className="xl:col-span-2 space-y-6">
            <VehicleMap />
            
            {/* Simulation Controls - Available for all roles */}
            <SimulationControls />
          </div>
          
          {/* Right Column - Fleet Status & Alerts */}
          <div className="xl:col-span-2 space-y-6">
            <FleetStatus />
            <AlertsFeed />
          </div>
        </div>

        {/* Analytics Section - Manager Only */}
        {user.role === 'manager' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Analytics & Reports</h2>
            <AnalyticsDashboard />
          </div>
        )}

        {/* Settings Section - Manager Only */}
        {user.role === 'manager' && (
          <div className="space-y-6">
            <SystemSettings />
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center text-xs text-muted-foreground pt-8 border-t border-border">
          <p>© 2025 Gautam Mahli </p>
          <p className="mt-1 text-sm">
  Contact:{" "}
  <a
    href="mailto:mahligautam83@gmail.com"
    className="font-medium underline underline-offset-2 hover:no-underline"
  >
    mahligautam83@gmail.com
  </a>
  <span className="mx-2">||</span>
  Ping-me On:{" "}
  <a
    href="https://www.linkedin.com/in/gautam-mahli-b33108200/"
    target="_blank"
    rel="noreferrer"
    className="font-medium underline underline-offset-2 hover:no-underline"
  >
    Gautam Mahli
  </a>
</p>
        </div>
      </main>
    </div>
  );
}