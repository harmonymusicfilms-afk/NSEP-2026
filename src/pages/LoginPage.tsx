import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore, useStudentStore } from '@/stores';
import { APP_CONFIG } from '@/constants/config';
import { isValidEmail, isValidMobile } from '@/lib/utils';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState<{ email?: string; mobile?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginStudent, isStudentLoggedIn } = useAuthStore();
  const { loadStudents } = useStudentStore();

  useEffect(() => {
    loadStudents();
    if (isStudentLoggedIn) {
      navigate('/dashboard');
    }
  }, [isStudentLoggedIn, navigate, loadStudents]);

  const validate = (): boolean => {
    const newErrors: { email?: string; mobile?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!isValidMobile(mobile)) {
      newErrors.mobile = 'Invalid mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const student = loginStudent(email.toLowerCase().trim(), mobile.trim());

    if (student) {
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${student.name}!`,
      });
      navigate('/dashboard');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid credentials or account blocked. Please check and try again.',
      });
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link to="/" className="inline-flex items-center justify-center gap-2 text-primary mb-4">
          <GraduationCap className="size-8" />
          <span className="font-serif text-xl font-bold">{APP_CONFIG.shortName}</span>
        </Link>
        <CardTitle className="font-serif text-2xl">Student Login</CardTitle>
        <CardDescription>
          Enter your registered email and mobile number
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="your.email@example.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" /> {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, ''));
                if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: undefined }));
              }}
              placeholder="10-digit mobile number"
              maxLength={10}
              className={errors.mobile ? 'border-destructive' : ''}
            />
            {errors.mobile && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" /> {errors.mobile}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full institutional-gradient" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="size-4 mr-2" />
                Login
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Register now
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground text-center mb-2">
            Demo credentials (for testing):
          </p>
          <div className="text-xs space-y-1">
            <p><strong>Email:</strong> aarav.sharma@email.com</p>
            <p><strong>Mobile:</strong> 9876543210</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
