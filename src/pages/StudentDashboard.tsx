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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

export function StudentDashboard() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { currentStudent } = useAuthStore();
  const { payments, loadPayments, hasSuccessfulPayment } = usePaymentStore();
  const { results, loadExamData, hasCompletedExam } = useExamStore();
  const { wallets, loadWallets, getWalletByStudent } = useWalletStore();
  const { rewards, loadRewards, getRewardsByOwner } = useCenterRewardStore();

  useEffect(() => {
    loadPayments();
    loadExamData();
    loadWallets();
    loadRewards();
  }, [loadPayments, loadExamData, loadWallets, loadRewards]);

  if (!currentStudent) return null;

  const hasPaid = hasSuccessfulPayment(currentStudent.id);
  const examCompleted = hasCompletedExam(currentStudent.id);
  const examResult = results.find((r) => r.studentId === currentStudent.id);
  const wallet = getWalletByStudent(currentStudent.id);
  const myRewards = getRewardsByOwner(currentStudent.id);
  const examFee = getExamFee(currentStudent.class);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentStudent.centerCode);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Center code copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const getNextStep = () => {
    if (!hasPaid) return { action: 'Pay Fee', link: '/dashboard/exam', urgent: true };
    if (!examCompleted) return { action: 'Take Exam', link: '/dashboard/exam', urgent: false };
    if (examResult?.resultStatus === 'PENDING') return { action: 'Results Pending', link: '/dashboard/results', urgent: false };
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
              <div className={`size-10 rounded-lg flex items-center justify-center ${
                hasPaid ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                <CreditCard className={`size-5 ${hasPaid ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <p className={`font-semibold ${hasPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                  {hasPaid ? 'Verified' : 'Pending'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-lg flex items-center justify-center ${
                examCompleted ? 'bg-green-100' : 'bg-muted'
              }`}>
                <ClipboardList className={`size-5 ${examCompleted ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exam Status</p>
                <p className={`font-semibold ${examCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
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
        {/* Center Code Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="size-5 text-primary" />
              Your Center Code
            </CardTitle>
            <CardDescription>
              Share this code with friends. Earn ₹50 for each successful referral!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-xl tracking-wider">
                {currentStudent.centerCode}
              </div>
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                {copied ? <CheckCircle className="size-5 text-green-600" /> : <Copy className="size-5" />}
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Referrals:</span>
                <span className="font-semibold">{myRewards.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Earned:</span>
                <span className="font-semibold text-accent">
                  {formatCurrency(myRewards.length * 50)}
                </span>
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
            {!hasPaid && (
              <Link to="/dashboard/exam" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <CreditCard className="size-4" />
                  Pay Exam Fee ({formatCurrency(examFee)})
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
            <Link to="/dashboard/certificate" className="block">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Award className="size-4" />
                View Certificate
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {!hasPaid && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">Payment Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Complete your exam fee payment of {formatCurrency(examFee)} to unlock the examination.
                  Payment is verified through secure Razorpay gateway.
                </p>
                <Link to="/dashboard/exam">
                  <Button size="sm" className="mt-3 bg-yellow-600 hover:bg-yellow-700">
                    Pay Now
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}
