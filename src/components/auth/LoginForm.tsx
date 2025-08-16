import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, Shield, Fuel } from 'lucide-react';

export default function LoginForm() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(credentials);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Manager', email: 'manager-gautam@demo.com', password: 'mahli@123' },
    { role: 'Operator', email: 'operator@demo.com', password: 'Demo@123' },
    { role: 'Driver', email: 'driver@demo.com', password: 'Demo@123' }
  ];

  const quickLogin = (email: string, password: string) => {
    setCredentials({ email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding and Image */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary/10 to-background flex-col justify-center items-center p-8">
        <img
          src="/src/components/auth/anp.png"
          alt="ANP Logo"
          className="w-48 h-48 mb-6 object-contain"
        />
        <h1 className="text-4xl font-bold text-primary text-shadow-glow mb-4">IOT Fuel Monitoring</h1>
        <p className="text-lg text-muted-foreground text-center max-w-md">
          Fuel Security-as-a-Service Platform<br />
          Real-time fuel monitoring & theft prevention
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4 lg:hidden">
              <div className="w-12 h-12 gradient-fuel rounded-xl flex items-center justify-center">
                <Fuel className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Access the fuel monitoring system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full gradient-fuel hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Sign in
                  </>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3 text-center">Hit on any account</p>
              <div className="grid grid-cols-1 gap-2">
                {demoCredentials.map((demo) => (
                  <Button
                    key={demo.role}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => quickLogin(demo.email, demo.password)}
                  >
                    <span className="font-medium">{demo.role}:</span>
                    <span className="ml-2 text-muted-foreground">{demo.email}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}