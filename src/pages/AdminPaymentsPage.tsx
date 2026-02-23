import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Filter, Download, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, usePaymentStore, useStudentStore } from '@/stores';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function AdminPaymentsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentAdmin, isAdminLoggedIn } = useAuthStore();
  const { payments, loadPayments, approvePayment } = usePaymentStore();
  const { students, loadStudents } = useStudentStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn || !currentAdmin) {
      navigate('/admin/login');
      return;
    }
    loadPayments();
    loadStudents();
  }, [isAdminLoggedIn, currentAdmin, navigate, loadPayments, loadStudents]);

  const filteredPayments = payments
    .filter((p) => filterStatus === 'all' || p.status === filterStatus)
    .filter((p) => {
      if (!searchQuery) return true;
      const student = students.find((s) => s.id === p.studentId);
      return (
        student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.razorpayOrderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.razorpayPaymentId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPayments = payments.length;
  const successfulPayments = payments.filter((p) => p.status === 'SUCCESS');
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter((p) => p.status === 'PENDING').length;
  const failedPayments = payments.filter((p) => p.status === 'FAILED').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="size-4 text-green-600" />;
      case 'FAILED':
        return <XCircle className="size-4 text-red-600" />;
      case 'PENDING':
        return <Clock className="size-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      SUCCESS: 'default',
      PENDING: 'secondary',
      FAILED: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'outline'} className="gap-1">
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  const handleExport = () => {
    const csv = [
      ['Payment ID', 'Student Name', 'Email', 'Class', 'Amount', 'Status', 'Order ID', 'Payment ID', 'Date'].join(','),
      ...filteredPayments.map((payment) => {
        const student = students.find((s) => s.id === payment.studentId);
        return [
          payment.id,
          student?.name || 'Unknown',
          student?.email || '',
          student?.class || '',
          payment.amount,
          payment.status,
          payment.razorpayOrderId,
          payment.razorpayPaymentId || '',
          formatDateTime(payment.paidAt || payment.createdAt),
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleApprove = async (paymentId: string, studentName: string) => {
    if (confirm(`Are you sure you want to manually approve the payment for ${studentName}?`)) {
      try {
        await approvePayment(paymentId);
        toast({
          title: "Payment Approved",
          description: `Payment for ${studentName} has been successfully approved.`
        });
      } catch (error) {
        toast({
          title: "Approval Failed",
          description: "Failed to approve payment. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard className="size-6" />
            Payment History
          </h1>
          <p className="text-muted-foreground">Manage and monitor all payment transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { loadPayments(); loadStudents(); }} className="gap-2">
            <Clock className="size-4" />
            Refresh Data
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Payments</p>
            <p className="text-2xl font-bold">{totalPayments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingPayments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Failed</p>
            <p className="text-2xl font-bold text-red-600">{failedPayments}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, email, or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="size-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="size-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="bg-green-50 text-green-800 font-black">APPROVAL ACTION</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const student = students.find((s) => s.id === payment.studentId);
                    return (
                      <TableRow key={payment.id} className={payment.status === 'PENDING' ? 'bg-yellow-50/30' : ''}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{student?.email || 'No email'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="bg-green-50/50">
                          {payment.status === 'PENDING' ? (
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700 text-white h-9 px-4 gap-2 font-black shadow-lg border-2 border-white ring-2 ring-green-600 animate-bounce"
                              onClick={() => handleApprove(payment.id, student?.name || 'Unknown')}
                            >
                              <CheckCircle className="size-4" />
                              APPROVE NOW
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1 text-green-600 font-bold text-xs">
                              <CheckCircle className="size-3" />
                              VERIFIED
                            </div>
                          )}
                        </TableCell>
                        <TableCell>Class {student?.class || 'N/A'}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{payment.razorpayOrderId}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {payment.razorpayPaymentId || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDateTime(payment.paidAt || payment.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
