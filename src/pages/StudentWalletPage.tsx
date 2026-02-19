import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, Filter, Download, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore, useWalletStore } from '@/stores';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export function StudentWalletPage() {
  const navigate = useNavigate();
  const { currentStudent, isStudentLoggedIn } = useAuthStore();
  const { wallets, transactions, loadWallets, loadTransactions, isLoading } = useWalletStore();
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (!isStudentLoggedIn || !currentStudent) {
      navigate('/login');
      return;
    }
    loadWallets();
    loadTransactions();
  }, [isStudentLoggedIn, currentStudent, navigate, loadWallets, loadTransactions]);

  if (isLoading || !currentStudent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const wallet = wallets.find((w) => w.studentId === currentStudent.id);
  const walletTransactions = wallet
    ? transactions
      .filter((t) => t.walletId === wallet.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const filteredTransactions =
    filterType === 'all'
      ? walletTransactions
      : walletTransactions.filter((t) => t.type === filterType);

  const totalCredits = walletTransactions
    .filter((t) => t.type !== 'WITHDRAWAL')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = walletTransactions
    .filter((t) => t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + t.amount, 0);

  const transactionTypeLabels: Record<string, string> = {
    CENTER_REWARD: 'Center Code Reward',
    SCHOLARSHIP_CREDIT: 'Scholarship Award',
    ADMIN_ADJUSTMENT: 'Admin Adjustment',
    WITHDRAWAL: 'Withdrawal',
  };

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">My Wallet</h1>
          <p className="text-muted-foreground">Manage your rewards and scholarship earnings</p>
        </div>

        {/* Balance Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="size-8" />
                <span className="text-sm opacity-90">Current Balance</span>
              </div>
              <p className="text-4xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <ArrowDownCircle className="size-6 text-green-600" />
                <span className="text-sm text-muted-foreground">Total Credits</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCredits)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <ArrowUpCircle className="size-6 text-red-600" />
                <span className="text-sm text-muted-foreground">Total Debits</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebits)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5" />
                Transaction History
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="size-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="CENTER_REWARD">Center Rewards</SelectItem>
                    <SelectItem value="SCHOLARSHIP_CREDIT">Scholarships</SelectItem>
                    <SelectItem value="ADMIN_ADJUSTMENT">Adjustments</SelectItem>
                    <SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="size-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="size-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your wallet transactions will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`size-10 rounded-full flex items-center justify-center ${transaction.type === 'WITHDRAWAL'
                            ? 'bg-red-100'
                            : 'bg-green-100'
                          }`}
                      >
                        {transaction.type === 'WITHDRAWAL' ? (
                          <ArrowUpCircle className="size-5 text-red-600" />
                        ) : (
                          <ArrowDownCircle className="size-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {transactionTypeLabels[transaction.type] || transaction.type}
                        </p>
                        <p className="text-sm text-muted-foreground">{transaction.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${transaction.type === 'WITHDRAWAL'
                            ? 'text-red-600'
                            : 'text-green-600'
                          }`}
                      >
                        {transaction.type === 'WITHDRAWAL' ? '-' : '+'}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Withdrawal Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ArrowUpCircle className="size-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Withdrawal Information</p>
                <p className="text-sm text-blue-700 mt-1">
                  Withdrawal feature will be available once the minimum balance threshold (₹500) is reached.
                  All withdrawals are processed within 5-7 business days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
