import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CreditCard,
  Award,
  FileCheck,
  TrendingUp,
  DollarSign,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart,
  Share2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useAuthStore,
  useStudentStore,
  usePaymentStore,
  useExamStore,
  useScholarshipStore,
  useCertificateStore,
} from '@/stores';
import { formatCurrency } from '@/lib/utils';
import { CLASSES } from '@/constants/config';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#a855f7'];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { currentAdmin, isAdminLoggedIn } = useAuthStore();
  const { students, loadStudents } = useStudentStore();
  const { payments, loadPayments } = usePaymentStore();
  const { results, loadExamData } = useExamStore();
  const { scholarships, loadScholarships } = useScholarshipStore();
  const { certificates, loadCertificates } = useCertificateStore();

  useEffect(() => {
    if (!isAdminLoggedIn || !currentAdmin) {
      navigate('/admin/login');
      return;
    }
    loadStudents();
    loadPayments();
    loadExamData();
    loadScholarships();
    loadCertificates();
  }, [isAdminLoggedIn, currentAdmin, navigate, loadStudents, loadPayments, loadExamData, loadScholarships, loadCertificates]);

  const activeStudents = students.filter((s) => s.status === 'ACTIVE').length;
  const successfulPayments = payments.filter((p) => p.status === 'SUCCESS');
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingScholarships = scholarships.filter((s) => s.approvalStatus === 'PENDING').length;
  const publishedResults = results.filter((r) => r.resultStatus === 'PUBLISHED').length;

  // Referral data
  const referralCodes = JSON.parse(localStorage.getItem('gphdm_referral_codes') || '[]');
  const referralLogs = JSON.parse(localStorage.getItem('gphdm_referral_logs') || '[]');
  const totalReferralEarnings = referralLogs.filter((r: any) => r.status === 'CREDITED').reduce((sum: number, r: any) => sum + r.amount, 0);

  // Registration trends (last 7 days)
  const registrationTrends = useMemo(() => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayStudents = students.filter(s => s.createdAt.split('T')[0] === dateStr);
      data.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        registrations: dayStudents.length,
        revenue: dayStudents.length * 300, // Avg fee
      });
    }
    return data;
  }, [students]);

  // Revenue trends (last 7 days)
  const revenueTrends = useMemo(() => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayPayments = successfulPayments.filter(p => p.paidAt?.split('T')[0] === dateStr || p.createdAt.split('T')[0] === dateStr);
      const dayRevenue = dayPayments.reduce((sum, p) => sum + p.amount, 0);
      data.push({
        date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
      });
    }
    return data;
  }, [successfulPayments]);

  // Class-wise distribution
  const classWiseData = useMemo(() => {
    return CLASSES.map(cls => ({
      name: `Class ${cls}`,
      students: students.filter(s => s.class === cls).length,
      exams: results.filter(r => r.class === cls).length,
    })).filter(d => d.students > 0 || d.exams > 0);
  }, [students, results]);

  // Referral stats
  const referralStats = useMemo(() => {
    const adminReferrals = referralLogs.filter((r: any) => r.referrerRole === 'ADMIN').length;
    const centerReferrals = referralLogs.filter((r: any) => r.referrerRole === 'CENTER').length;
    return [
      { name: 'Admin Referrals', value: adminReferrals, color: '#3b82f6' },
      { name: 'Center Referrals', value: centerReferrals, color: '#10b981' },
      { name: 'Direct', value: students.length - adminReferrals - centerReferrals, color: '#f59e0b' },
    ].filter(d => d.value > 0);
  }, [referralLogs, students]);

  // Exam performance distribution
  const performanceData = useMemo(() => {
    const ranges = [
      { name: '0-40%', min: 0, max: 40 },
      { name: '40-60%', min: 40, max: 60 },
      { name: '60-80%', min: 60, max: 80 },
      { name: '80-100%', min: 80, max: 100 },
    ];
    const maxScore = 240; // 60 questions * 4 marks
    return ranges.map(range => ({
      name: range.name,
      count: results.filter(r => {
        const percent = (r.totalScore / maxScore) * 100;
        return percent >= range.min && percent < range.max;
      }).length,
    }));
  }, [results]);

  const stats = [
    {
      title: 'Total Students',
      value: students.length,
      subtitle: `${activeStudents} active`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      subtitle: `${successfulPayments.length} payments`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Exams Completed',
      value: results.length,
      subtitle: `${publishedResults} published`,
      icon: FileCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Pending Approvals',
      value: pendingScholarships,
      subtitle: 'scholarships',
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    {
      title: 'Referral Earnings',
      value: formatCurrency(totalReferralEarnings),
      subtitle: `${referralLogs.length} referrals`,
      icon: Share2,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Certificates Issued',
      value: certificates.length,
      subtitle: 'total',
      icon: Award,
      color: 'text-teal-600',
      bg: 'bg-teal-100',
    },
  ];

  const recentPayments = payments
    .filter((p) => p.status === 'SUCCESS')
    .sort((a, b) => new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of scholarship examination system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`size-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-blue-600" />
              Registration Trends (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationTrends}>
                  <defs>
                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value: number) => [value, 'Registrations']}
                  />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="size-5 text-green-600" />
              Revenue Trends (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrends}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Class-wise Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-purple-600" />
              Class-wise Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classWiseData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" fontSize={12} tickLine={false} />
                  <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} width={60} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="students" fill="#3b82f6" name="Students" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="exams" fill="#10b981" name="Exams" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Referral Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="size-5 text-orange-600" />
              Referral Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {referralStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartPieChart>
                    <Pie
                      data={referralStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {referralStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                  </RechartPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No referral data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exam Performance & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Exam Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-5 text-indigo-600" />
              Exam Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value: number) => [value, 'Students']}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No payments yet</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => {
                  const student = students.find((s) => s.id === payment.studentId);
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{student?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">Class {student?.class}</p>
                      </div>
                      <p className="font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="size-5" />
            Pending Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingScholarships > 0 && (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Award className="size-8 text-yellow-600" />
                <div>
                  <p className="font-medium text-sm">Scholarship Approvals</p>
                  <p className="text-2xl font-bold text-yellow-700">{pendingScholarships}</p>
                </div>
              </div>
            )}
            {results.filter((r) => r.resultStatus === 'PENDING').length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <TrendingUp className="size-8 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Results to Publish</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {results.filter((r) => r.resultStatus === 'PENDING').length}
                  </p>
                </div>
              </div>
            )}
            {(() => {
              const pendingCenters = JSON.parse(localStorage.getItem('gphdm_centers') || '[]').filter((c: any) => c.status === 'PENDING').length;
              return pendingCenters > 0 ? (
                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <Share2 className="size-8 text-orange-600" />
                  <div>
                    <p className="font-medium text-sm">Center Approvals</p>
                    <p className="text-2xl font-bold text-orange-700">{pendingCenters}</p>
                  </div>
                </div>
              ) : null;
            })()}
            {pendingScholarships === 0 && results.filter((r) => r.resultStatus === 'PENDING').length === 0 && (
              <p className="text-muted-foreground text-sm col-span-full text-center py-4">No pending actions</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
