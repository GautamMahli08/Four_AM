import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  Shield, 
  CheckCircle,
  Clock,
  Filter,
  Eye
} from 'lucide-react';
import { useVehicleStore, Alert } from '@/store/useVehicleStore';
import { cn } from '@/lib/utils';

export default function AlertsFeed() {
  const { alerts, acknowledgeAlert } = useVehicleStore();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  const filteredAlerts = alerts
    .filter(alert => {
      if (filter === 'all') return true;
      return alert.severity === filter;
    })
    .filter(alert => {
      if (showAcknowledged) return true;
      return !alert.acknowledged;
    })
    .slice(0, 50);

  const getAlertIcon = (type: string, severity: string) => {
    switch (type) {
      case 'theft':
        return severity === 'critical' ? AlertTriangle : Shield;
      case 'route_violation':
        return AlertTriangle;
      case 'sensor_health':
        return Info;
      case 'maintenance':
        return Info;
      default:
        return Bell;
    }
  };

  const getAlertVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive' as const;
      case 'warning':
        return 'warning' as const;
      case 'info':
        return 'secondary' as const;
      default:
        return 'secondary' as const;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;

  return (
    <Card className="fuel-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <span>Live Alerts</span>
            {unacknowledgedCount > 0 && (
              <Badge variant={criticalCount > 0 ? 'destructive' : 'warning'} className="ml-1">
                {unacknowledgedCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={showAcknowledged ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowAcknowledged(!showAcknowledged)}
            >
              <Eye className="mr-1 h-3 w-3" />
              {showAcknowledged ? 'Hide' : 'Show'} Resolved
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'critical', 'warning', 'info'] as const).map((severity) => (
            <Button
              key={severity}
              variant={filter === severity ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(severity)}
              className="capitalize"
            >
              <Filter className="mr-1 h-3 w-3" />
              {severity}
            </Button>
          ))}
        </div>

        {/* Alerts List */}
        <ScrollArea className="h-[48vh] md:h-[56vh]">
          <div className="space-y-3 pr-1">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-12 w-12 text-success mb-4" />
                <h3 className="text-lg font-medium">All Clear</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? 'No active alerts at this time'
                    : `No ${filter} alerts found`
                  }
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const Icon = getAlertIcon(alert.type, alert.severity);
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      'p-4 rounded-lg border transition-all',
                      alert.acknowledged 
                        ? 'border-border bg-muted/30 opacity-60' 
                        : alert.severity === 'critical'
                        ? 'border-destructive/30 bg-destructive/5 shadow-sm'
                        : alert.severity === 'warning'
                        ? 'border-warning/30 bg-warning/5'
                        : 'border-border bg-card'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'p-2 rounded-full',
                        alert.severity === 'critical' ? 'bg-destructive/10' :
                        alert.severity === 'warning' ? 'bg-warning/10' :
                        'bg-secondary/10'
                      )}>
                        <Icon className={cn(
                          'h-4 w-4',
                          alert.severity === 'critical' ? 'text-destructive' :
                          alert.severity === 'warning' ? 'text-warning' :
                          'text-muted-foreground'
                        )} />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{alert.title}</h4>
                            <Badge variant={getAlertVariant(alert.severity)} className="text-xs">
                              {alert.severity}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(alert.timestamp)}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="text-xs text-muted-foreground">
                            Vehicle: <span className="font-medium">{alert.vehicleId}</span>
                          </div>
                          
                          {!alert.acknowledged && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="h-7 text-xs"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Acknowledge
                            </Button>
                          )}
                          
                          {alert.acknowledged && (
                            <Badge variant="success" className="text-xs">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Summary Footer */}
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-medium text-destructive">{criticalCount}</div>
              <div className="text-muted-foreground">Critical</div>
            </div>
            <div>
              <div className="font-medium text-warning">
                {alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length}
              </div>
              <div className="text-muted-foreground">Warning</div>
            </div>
            <div>
              <div className="font-medium text-success">
                {alerts.filter(a => a.acknowledged).length}
              </div>
              <div className="text-muted-foreground">Resolved</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
