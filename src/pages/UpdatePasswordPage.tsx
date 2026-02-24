import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { client as backend } from '@/lib/backend';
import { APP_CONFIG } from '@/constants/config';

export function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();

    const [isSessionValid, setIsSessionValid] = useState(false);

    useEffect(() => {
        // Handle password reset flow
        const handlePasswordReset = async () => {
            // Check if we have a session (user clicked email link)
            const { data: { session } } = await backend.auth.getSession();

            if (session) {
                setIsSessionValid(true);
            } else {
                // Check if we just landed here from a recovery link
                backend.auth.onAuthStateChange(async (event, session) => {
                    if (event === "PASSWORD_RECOVERY") {
                        setIsSessionValid(true);
                    } else if (session) {
                        setIsSessionValid(true);
                    }
                });
            }
        };

        handlePasswordReset();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isSessionValid) {
            setError('Invalid or expired reset link. Please try requesting a new one.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await backend.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setIsSuccess(true);
            toast({
                title: 'Password Updated',
                description: 'Your password has been changed successfully.',
            });

            // Optional: Redirect after delay
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err: any) {
            console.error('Password update error:', err);
            setError(err.message || 'Failed to update password.');
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to update password.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] px-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto size-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <CheckCircle className="size-8 text-green-600" />
                        </div>
                        <CardTitle className="font-serif text-2xl">Password Updated!</CardTitle>
                        <CardDescription>
                            Your password has been successfully changed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full institutional-gradient">
                            <Link to="/login">
                                Go to Login
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isSessionValid && !error) {
        // Show loading initally while we check session
        // But given useEffect runs fast, we might want to default to showing form but disabled or showing a distinct "Verifying link..." state
        // For simplicity, let's just let the form render but show an alert if session is invalid after a timeout or just rely on the validation in handleSubmit
        // Better: Show a "Verifying..." state
        /* 
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        ) 
        */
        // Actually, let's stick to the form but display a warning if session is confirmed invalid. 
        // For now, let's just return the form.
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Link to="/" className="inline-flex items-center justify-center gap-2 text-primary mb-4">
                        <span className="font-serif text-xl font-bold">{APP_CONFIG.shortName}</span>
                    </Link>
                    <CardTitle className="font-serif text-2xl">Set New Password</CardTitle>
                    <CardDescription>
                        Please enter your new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="Minimum 6 characters"
                                    className="pl-9"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="Re-enter password"
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                                <AlertCircle className="size-3" /> {error}
                            </p>
                        )}

                        <Button type="submit" className="w-full institutional-gradient" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
