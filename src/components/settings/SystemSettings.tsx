import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Globe,
  Users,
  AlertTriangle,
  CheckCircle,
  Zap,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    alerts: {
      realTimeNotifications: true,
      emailAlerts: true,
      smsAlerts: false,
      criticalThreshold: 15, // seconds
      warningThreshold: 60
    },
    security: {
      autoLogout: 30, // minutes
      passwordComplexity: true,
      twoFactorAuth: false,
      sessionTimeout: 4 // hours
    },
    monitoring: {
      updateInterval: 1000, // ms
      dataRetention: 30, // days
      backupFrequency: 24, // hours
      geoFencing: true
    },
    thresholds: {
      fuelTheftLimit: 10, // liters
      tiltAngleLimit: 20, // degrees
      routeDeviationLimit: 500, // meters
      sensorTimeoutLimit: 120 // seconds
    }
  });

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    
    toast({
      title: "Setting Updated",
      description: `${setting} has been updated successfully.`,
    });
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `fsaas-config-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Configuration Exported",
      description: "System configuration has been exported successfully.",
    });
  };

  const resetToDefaults = () => {
    // Reset logic here
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">System Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure FSaaS monitoring, security, and alert parameters
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportConfig}>
            <Download className="mr-2 h-4 w-4" />
            Export Config
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Config
          </Button>
        </div>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Alert Settings */}
        <TabsContent value="alerts" className="space-y-6">
          <Card className="fuel-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Alert Configuration</span>
                <Badge variant="secondary">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="realtime">Real-time Notifications</Label>
                    <Switch
                      id="realtime"
                      checked={settings.alerts.realTimeNotifications}
                      onCheckedChange={(checked) => 
                        handleSettingChange('alerts', 'realTimeNotifications', checked)
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email">Email Alerts</Label>
                    <Switch
                      id="email"
                      checked={settings.alerts.emailAlerts}
                      onCheckedChange={(checked) => 
                        handleSettingChange('alerts', 'emailAlerts', checked)
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms">SMS Alerts</Label>
                    <Switch
                      id="sms"
                      checked={settings.alerts.smsAlerts}
                      onCheckedChange={(checked) => 
                        handleSettingChange('alerts', 'smsAlerts', checked)
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="critical-threshold">Critical Alert Threshold (seconds)</Label>
                    <Input
                      id="critical-threshold"
                      type="number"
                      value={settings.alerts.criticalThreshold}
                      onChange={(e) => 
                        handleSettingChange('alerts', 'criticalThreshold', parseInt(e.target.value))
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="warning-threshold">Warning Alert Threshold (seconds)</Label>
                    <Input
                      id="warning-threshold"
                      type="number"
                      value={settings.alerts.warningThreshold}
                      onChange={(e) => 
                        handleSettingChange('alerts', 'warningThreshold', parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="fuel-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Configuration</span>
                <Badge variant="warning">Critical</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="auto-logout">Auto Logout (minutes)</Label>
                    <Input
                      id="auto-logout"
                      type="number"
                      value={settings.security.autoLogout}
                      onChange={(e) => 
                        handleSettingChange('security', 'autoLogout', parseInt(e.target.value))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-complexity">Password Complexity</Label>
                    <Switch
                      id="password-complexity"
                      checked={settings.security.passwordComplexity}
                      onCheckedChange={(checked) => 
                        handleSettingChange('security', 'passwordComplexity', checked)
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => 
                        handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <Switch
                      id="two-factor"
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange={(checked) => 
                        handleSettingChange('security', 'twoFactorAuth', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Settings */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card className="fuel-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Monitoring Configuration</span>
                <Badge variant="secondary">Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="update-interval">Update Interval (ms)</Label>
                    <Input
                      id="update-interval"
                      type="number"
                      value={settings.monitoring.updateInterval}
                      onChange={(e) => 
                        handleSettingChange('monitoring', 'updateInterval', parseInt(e.target.value))
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="data-retention">Data Retention (days)</Label>
                    <Input
                      id="data-retention"
                      type="number"
                      value={settings.monitoring.dataRetention}
                      onChange={(e) => 
                        handleSettingChange('monitoring', 'dataRetention', parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="backup-frequency">Backup Frequency (hours)</Label>
                    <Input
                      id="backup-frequency"
                      type="number"
                      value={settings.monitoring.backupFrequency}
                      onChange={(e) => 
                        handleSettingChange('monitoring', 'backupFrequency', parseInt(e.target.value))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="geo-fencing">Geo-fencing</Label>
                    <Switch
                      id="geo-fencing"
                      checked={settings.monitoring.geoFencing}
                      onCheckedChange={(checked) => 
                        handleSettingChange('monitoring', 'geoFencing', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threshold Settings */}
        <TabsContent value="thresholds" className="space-y-6">
          <Card className="fuel-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Alert Thresholds</span>
                <Badge variant="destructive">Sensitive</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fuel-theft">Fuel Theft Limit (liters)</Label>
                    <Input
                      id="fuel-theft"
                      type="number"
                      value={settings.thresholds.fuelTheftLimit}
                      onChange={(e) => 
                        handleSettingChange('thresholds', 'fuelTheftLimit', parseInt(e.target.value))
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tilt-angle">Tilt Angle Limit (degrees)</Label>
                    <Input
                      id="tilt-angle"
                      type="number"
                      value={settings.thresholds.tiltAngleLimit}
                      onChange={(e) => 
                        handleSettingChange('thresholds', 'tiltAngleLimit', parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="route-deviation">Route Deviation Limit (meters)</Label>
                    <Input
                      id="route-deviation"
                      type="number"
                      value={settings.thresholds.routeDeviationLimit}
                      onChange={(e) => 
                        handleSettingChange('thresholds', 'routeDeviationLimit', parseInt(e.target.value))
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sensor-timeout">Sensor Timeout Limit (seconds)</Label>
                    <Input
                      id="sensor-timeout"
                      type="number"
                      value={settings.thresholds.sensorTimeoutLimit}
                      onChange={(e) => 
                        handleSettingChange('thresholds', 'sensorTimeoutLimit', parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="fuel-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>System Status</span>
                  <Badge variant="success">Operational</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Connection</span>
                  <Badge variant="success">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Redis Cache</span>
                  <Badge variant="success">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">WebSocket</span>
                  <Badge variant="success">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Simulation</span>
                  <Badge variant="warning">
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Running
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="fuel-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>System Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Restart Services
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  Clear Cache
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="mr-2 h-4 w-4" />
                  Test Connectivity
                </Button>
                <Separator />
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={resetToDefaults}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Reset to Defaults
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}