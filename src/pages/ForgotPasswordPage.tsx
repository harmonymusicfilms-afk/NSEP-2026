import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { client as backend } from '@/lib/backend';
import { isValidEmail } from '@/lib/utils';
import { APP_CONFIG } from '@/constants/config';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.trim() || !isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await backend.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) throw error;

            setIsSubmitted(true);
            toast({
                title: 'Email Sent',
                description: 'Check your email for the password reset link.',
            });
        } catch (err: any) {
            console.error('Password reset error:', err);
            // For security reasons, don't always reveal if email exists, but for UX lets show generic error or specific if safe
            setError(err.message || 'Failed to send reset email. Please try again.');
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to send reset email.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] px-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto size-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                            <CheckCircle className="size-8 text-green-600" />
                        </div>
                        <CardTitle className="font-serif text-2xl">Check Your Email</CardTitle>
                        <CardDescription>
                            We have sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Click the link in the email to reset your password. The link will expire in 1 hour.
                        </p>
                        <div className="pt-2">
                            <Button asChild variant="outline" className="w-full">
                                <Link to="/login">
                                    <ArrowLeft className="size-4 mr-2" />
                                    Back to Login
                                </Link>
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            Didn't receive the email? Check your spam folder or{' '}
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="text-primary hover:underline font-medium"
                            >
                                try again
                            </button>
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Link to="/" className="inline-flex items-center justify-center gap-2 text-primary mb-4">
                        <span className="font-serif text-xl font-bold">{APP_CONFIG.shortName}</span>
                    </Link>
                    <CardTitle className="font-serif text-2xl">Forgot Password?</CardTitle>
                    <CardDescription>
                        Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="your.email@example.com"
                                    className={`pl-9 ${error ? 'border-destructive' : ''}`}
                                    autoFocus
                                />
                            </div>
                            {error && (
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    <Loader2 className="size-3" /> {error}
                                </p>
                            )}
                        </div>

                        <Button type="submit" className="w-full institutional-gradient" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="size-4 mr-2 animate-spin" />
                                    Sending Link...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <Link to="/login" className="text-muted-foreground hover:text-foreground inline-flex items-center">
                            <ArrowLeft className="size-4 mr-1" />
                            Back to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
