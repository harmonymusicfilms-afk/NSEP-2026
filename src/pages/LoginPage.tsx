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

import { supabase } from '@/lib/supabase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginStudent, isStudentLoggedIn } = useAuthStore();
  const { loadStudents, addStudent } = useStudentStore();

  useEffect(() => {
    loadStudents();
    if (isStudentLoggedIn) {
      navigate('/dashboard');
    }
  }, [isStudentLoggedIn, navigate, loadStudents]);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user found');

      // Fetch student details to sync with local store (Legacy)
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (studentData) {
        // Attempt to login to local store
        let loggedIn = await loginStudent(email.toLowerCase().trim(), studentData.mobile);

        if (!loggedIn) {
          // Hydrate local store from Supabase data
          await addStudent({
            name: studentData.name,
            fatherName: studentData.father_name,
            class: studentData.class || studentData.class_level,
            mobile: studentData.mobile,
            email: studentData.email,
            schoolName: studentData.school_name,
            schoolContact: studentData.school_contact,
            addressVillage: studentData.address_village,
            addressBlock: studentData.address_block,
            addressTahsil: studentData.address_tahsil,
            addressDistrict: studentData.address_district,
            addressState: studentData.address_state,
            referredByCenter: studentData.referred_by_center || undefined,
            referredByStudent: studentData.referred_by_student || undefined
          }, data.user.id);

          // Try login again
          loggedIn = await loginStudent(studentData.email, studentData.mobile);
        }

        if (!loggedIn) {
          console.warn('Student not found in local store even after hydration.');
        }

        toast({
          title: 'Login Successful',
          description: `Welcome back, ${studentData.name}!`,
        });
        navigate('/dashboard');
      } else {
        throw new Error('Student profile not found');
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Invalid credentials.',
      });
    } finally {
      setIsLoading(false);
    }
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Enter your password"
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="size-3" /> {errors.password}
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

      </CardContent>
    </Card>
  );
}
