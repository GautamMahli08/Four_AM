import { Bell, Settings, User, LogOut, Fuel, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/useAuthStore';
import { useVehicleStore } from '@/store/useVehicleStore';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { alerts, isConnected } = useVehicleStore();
  
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(a => a.severity === 'critical');

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'manager': return 'Fleet Manager';
      case 'operator': return 'Control Operator';
      case 'driver': return 'Driver';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'manager': return 'default';
      case 'operator': return 'secondary';
      case 'driver': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <header className="fuel-card border-b border-border/50 px-4 md:px-6 py-3 sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 gradient-fuel rounded-xl flex items-center justify-center shrink-0">
              <Fuel className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-shadow-glow leading-6">Fuel Monitoring</h1>
              <p className="text-xs md:text-sm text-muted-foreground leading-4">Fuel Security Monitoring</p>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="hidden sm:flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">Disconnected</span>
                </>
              )}
            </div>

            {/* Alerts */}
            <Button variant="outline" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              {unacknowledgedAlerts.length > 0 && (
                <Badge 
                  variant={criticalAlerts.length > 0 ? "destructive" : "secondary"} 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {unacknowledgedAlerts.length}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} />
                    <AvatarFallback>{user?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-tight">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{getRoleDisplayName(user?.role || '')}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="space-y-1">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <Badge variant={getRoleBadgeVariant(user?.role || '')} className="text-xs">
                      {getRoleDisplayName(user?.role || '')}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
