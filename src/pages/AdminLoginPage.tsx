import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Shield, LogIn, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores';
import { APP_CONFIG } from '@/constants/config';
import { isValidEmail } from '@/lib/utils';

// Secret access key required in URL to even see the login form
const ADMIN_ACCESS_KEY = 'gphdm2026secure';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [hasAccess, setHasAccess] = useState(false);
  const [accessKeyInput, setAccessKeyInput] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginAdmin, isAdminLoggedIn } = useAuthStore();

  useEffect(() => {
    if (isAdminLoggedIn) {
      navigate('/admin/dashboard');
    }
  }, [isAdminLoggedIn, navigate]);

  // Check if secret key is in URL
  useEffect(() => {
    const key = searchParams.get('key');
    if (key === ADMIN_ACCESS_KEY) {
      setHasAccess(true);
    }
  }, [searchParams]);

  const handleAccessKeySubmit = () => {
    if (accessKeyInput.trim() === ADMIN_ACCESS_KEY) {
      setHasAccess(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'Invalid access key. Contact Super Admin for access.',
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    try {
      const admin = await loginAdmin(email.toLowerCase().trim(), password);
      if (admin) {
        toast({
          title: 'Login Successful',
          description: `Welcome, ${admin.name}!`,
        });
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Invalid credentials. Please check and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If no access key, show access gate
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4">
        <Card className="w-full max-w-sm border-red-900/30 bg-gray-900/80 text-white shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto size-16 rounded-full bg-red-600/20 flex items-center justify-center mb-4">
              <Lock className="size-8 text-red-500" />
            </div>
            <CardTitle className="text-xl text-red-400">Restricted Area</CardTitle>
            <CardDescription className="text-gray-400">
              This section is restricted to authorized administrators only.
              Enter your access key to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessKey" className="text-gray-300">Access Key</Label>
              <Input
                id="accessKey"
                type="password"
                value={accessKeyInput}
                onChange={(e) => setAccessKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAccessKeySubmit()}
                placeholder="Enter secret access key"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <Button
              onClick={handleAccessKeySubmit}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <Shield className="size-4 mr-2" />
              Verify Access
            </Button>
            <div className="text-center pt-2">
              <Link to="/" className="text-xs text-gray-500 hover:text-gray-300">
                ← Back to main site
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin login form (only shown after access key verification)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      <Card className="w-full max-w-md border-red-900/30 bg-gray-900/80 text-white shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 text-red-500 mb-4">
            <Shield className="size-8" />
            <span className="font-serif text-xl font-bold">{APP_CONFIG.shortName}</span>
          </div>
          <CardTitle className="font-serif text-2xl text-white">Super Admin Portal</CardTitle>
          <CardDescription className="text-gray-400">
            Authorized personnel only. All login attempts are logged.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="admin@example.com"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              {errors.email && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="size-3" /> {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              {errors.password && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="size-3" /> {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Verifying...
                </>
              ) : (
                <>
                  <LogIn className="size-4 mr-2" />
                  Login to Admin Panel
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-red-950/30 rounded-lg border border-red-900/30">
            <p className="text-[10px] text-red-400/80 text-center">
              ⚠️ Warning: All login attempts are monitored. Unauthorized access is prohibited and may result in legal action.
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-300">
              ← Back to main site
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
