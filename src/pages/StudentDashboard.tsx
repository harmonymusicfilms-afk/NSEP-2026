import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  ClipboardList,
  Award,
  Wallet,
  Copy,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Gift,
  Loader2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  useAuthStore,
  usePaymentStore,
  useExamStore,
  useWalletStore,
  useCenterRewardStore,
} from '@/stores';
import { getExamFee, APP_CONFIG } from '@/constants/config';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function StudentDashboard() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { isLoading: authLoading, currentStudent } = useAuthStore();
  const { payments, loadPayments, hasSuccessfulPayment, isLoading: paymentsLoading } = usePaymentStore();
  const { results, loadExamData, hasCompletedExam, isLoading: examsLoading } = useExamStore();
  const { loadWallets, getWalletByStudent, isLoading: walletsLoading } = useWalletStore();
  const { loadRewards, getRewardsByOwner, isLoading: rewardsLoading } = useCenterRewardStore();

  useEffect(() => {
    if (currentStudent) {
      loadPayments();
      loadExamData();
      loadWallets();
      loadRewards();
    }
  }, [currentStudent, loadPayments, loadExamData, loadWallets, loadRewards]);

  const isLoading = authLoading || paymentsLoading || examsLoading || walletsLoading || rewardsLoading;

  if (isLoading || !currentStudent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasPaid = hasSuccessfulPayment(currentStudent.id);
  const examCompleted = hasCompletedExam(currentStudent.id);
  const examResult = results.find((r) => r.studentId === currentStudent.id);
  const wallet = getWalletByStudent(currentStudent.id);
  const myRewards = getRewardsByOwner(currentStudent.id);
  const examFee = getExamFee(currentStudent.class);

  const getNextStep = () => {
    if (currentStudent.status === 'PENDING') {
      if (hasPaid) return { action: 'Finish Profile', link: '/register', urgent: true };
      return { action: 'Complete Registration', link: '/register', urgent: true };
    }
    return { action: 'View Results', link: '/dashboard/results', urgent: false };
  };

  const nextStep = getNextStep();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Welcome, {currentStudent.name}!
          </h1>
          <p className="text-muted-foreground">
            Class {currentStudent.class} • {currentStudent.schoolName}
          </p>
        </div>
        <Link to={nextStep.link}>
          <Button className={nextStep.urgent ? 'institutional-gradient' : ''}>
            {nextStep.action}
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Status Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("size-10 rounded-lg flex items-center justify-center", hasPaid ? 'bg-green-100' : 'bg-yellow-100')}>
                <CreditCard className={cn("size-5", hasPaid ? 'text-green-600' : 'text-yellow-600')} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <div className="flex items-center gap-2">
                  <p className={cn("font-semibold", hasPaid ? 'text-green-600' : 'text-yellow-600')}>
                    {hasPaid ? 'Verified' : 'Pending'}
                  </p>
                  {!hasPaid && useAuthStore.getState().isAdminLoggedIn && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-green-600 border-green-200 hover:bg-green-50 font-bold border-2 ml-2"
                      onClick={async () => {
                        const pendingPayment = payments.find(p => p.studentId === currentStudent.id && p.status === 'PENDING');
                        if (pendingPayment) {
                          if (confirm(`Approve payment for ${currentStudent.name}?`)) {
                            await usePaymentStore.getState().approvePayment(pendingPayment.id);
                            toast({ title: "Approved", description: "Payment approved successfully." });
                          }
                        } else {
                          toast({ title: "No Pending Payment", description: "No pending payment found to approve.", variant: "default" });
                        }
                      }}
                    >
                      <CheckCircle className="size-3 mr-1" />
                      ADMIN APPROVE
                    </Button>
                  )}
                  {hasPaid && useAuthStore.getState().isAdminLoggedIn && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-yellow-600 border-yellow-200 hover:bg-yellow-50 font-bold border-2 ml-2"
                      onClick={async () => {
                        const successPayment = payments.find(p => p.studentId === currentStudent.id && p.status === 'SUCCESS');
                        if (successPayment) {
                          if (confirm(`Mark payment as pending for ${currentStudent.name}?`)) {
                            await usePaymentStore.getState().markPaymentPending(successPayment.id);
                            toast({ title: "Marked Pending", description: "Payment status set to pending." });
                          }
                        } else {
                          toast({ title: "No Success Payment", description: "No successful payment found to mark as pending.", variant: "default" });
                        }
                      }}
                    >
                      <AlertTriangle className="size-3 mr-1" />
                      ADMIN PENDING
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("size-10 rounded-lg flex items-center justify-center", examCompleted ? 'bg-green-100' : 'bg-muted')}>
                <ClipboardList className={cn("size-5", examCompleted ? 'text-green-600' : 'text-muted-foreground')} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exam Status</p>
                <p className={cn("font-semibold", examCompleted ? 'text-green-600' : 'text-muted-foreground')}>
                  {examCompleted ? 'Completed' : hasPaid ? 'Ready' : 'Locked'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="font-semibold text-primary">
                  {examResult?.rank ? `#${examResult.rank}` : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Wallet className="size-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="font-semibold text-accent">
                  {formatCurrency(wallet?.balance || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Referral Section */}
        <Card className="lg:col-span-2 overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5 shadow-xl">
          <CardHeader className="bg-primary/5 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                  <Gift className="size-6 text-primary animate-pulse" />
                  Your Exclusive Referral Link
                </CardTitle>
                <CardDescription className="text-base text-primary/70 font-medium">
                  Registration is currently referral-only. Help your friends join {APP_CONFIG.shortName} 2026!
                </CardDescription>
              </div>
              <div className="hidden sm:flex bg-primary/10 px-4 py-2 rounded-full items-center gap-2">
                <Users className="size-4 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Referral Program Active</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-8">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Shareable Registration Link</Label>
                <div className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">₹25 REWARD PER JOINING</div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-2 bg-muted/30 rounded-xl border-2 border-dashed border-primary/20">
                <div className="flex-1 px-4 py-3 font-mono text-sm text-primary font-semibold break-all overflow-hidden select-all bg-white/50 rounded-lg">
                  {typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${currentStudent.referralCode || currentStudent.centerCode}` : ''}
                </div>
                <Button
                  className="institutional-gradient px-8 h-12 gap-2 shadow-lg shrink-0"
                  onClick={() => {
                    const link = `${window.location.origin}/register?ref=${currentStudent.referralCode || currentStudent.centerCode}`;
                    navigator.clipboard.writeText(link);
                    setCopied(true);
                    toast({ title: "Link Copied! 📋", description: "Share it with your friends to earn rewards." });
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <CheckCircle className="size-5" /> : <Copy className="size-5" />}
                  {copied ? 'Copied' : 'Copy Link'}
                </Button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/40 rounded-xl border border-primary/10 flex flex-col justify-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Your Referral Code</p>
                <p className="text-xl font-mono font-bold text-primary tracking-widest">
                  {currentStudent.referralCode || currentStudent.centerCode}
                </p>
              </div>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-4">
                <div className="size-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <Gift className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Earn ₹25 Rewards</p>
                  <p className="text-xs text-muted-foreground">For every student who registers using your link.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentStudent.status === 'PENDING' && (
              <Link to="/register" className="block">
                <Button className="w-full justify-start gap-2 institutional-gradient">
                  <ArrowRight className="size-4" />
                  {hasPaid ? 'Finish Profile' : 'Complete Registration'}
                </Button>
              </Link>
            )}
            {hasPaid && !examCompleted && (
              <Link to="/dashboard/exam" className="block">
                <Button className="w-full justify-start gap-2 institutional-gradient">
                  <ClipboardList className="size-4" />
                  Start Examination
                </Button>
              </Link>
            )}
            <Link to="/dashboard/wallet" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Wallet className="size-4" />
                View Wallet
              </Button>
            </Link>
            <Link to="/dashboard/certificates" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Award className="size-4" />
                View Certificate
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {currentStudent.status === 'PENDING' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Loader2 className="size-5 text-blue-600 mt-0.5 animate-spin" />
              <div>
                <h3 className="font-semibold text-blue-800">Registration Incomplete</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {hasPaid
                    ? "You've successfully paid the exam donation! Please complete your profile details (address, school, etc.) to activate your account."
                    : "Please complete your registration and pay the exam donation to access the scholarship examination."}
                </p>
                <Link to="/register">
                  <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700">
                    {hasPaid ? 'Finish Profile' : 'Complete Registration'}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
          {/* Exam Info */}
          <Card>
            <CardHeader>
              <CardTitle>Examination Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Total Questions</p>
                  <p className="font-semibold text-lg">60</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Time per Question</p>
                  <p className="font-semibold text-lg">5 seconds</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Correct Answer</p>
                  <p className="font-semibold text-lg text-green-600">+4 marks</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Wrong Answer</p>
                  <p className="font-semibold text-lg text-red-600">-4 marks</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Demo mode uses 10 questions. Auto-progression with no back navigation.
              </p>
            </CardContent>
          </Card>
        </Card>
      )}
    </div>
  );
}
