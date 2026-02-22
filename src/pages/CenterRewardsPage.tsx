import { useState, useEffect } from 'react';
import {
    Gift,
    TrendingUp,
    Wallet,
    ArrowUpRight,
    History,
    Search,
    CheckCircle,
    Loader2,
    Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { useAuthStore } from '@/stores';
import { formatCurrency, formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export function CenterRewardsPage() {
    const { currentCenter } = useAuthStore();
    const [rewards, setRewards] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'rewards' | 'history'>('rewards');

    useEffect(() => {
        if (currentCenter) {
            loadRewardData();
        }
    }, [currentCenter]);

    const loadRewardData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch individual student referral rewards
            const { data: rewardData, error: rewardError } = await supabase
                .from('center_rewards')
                .select(`
          *,
          new_student:students!new_student_id(name, email, mobile)
        `)
                .eq('center_owner_student_id', currentCenter?.id)
                .order('created_at', { ascending: false });

            if (rewardError) throw rewardError;
            setRewards(rewardData || []);

            // 2. Fetch wallet transactions for the center owner
            const { data: walletData } = await supabase
                .from('wallets')
                .select('id')
                .eq('student_id', currentCenter?.id)
                .single();

            if (walletData) {
                const { data: transData, error: transError } = await supabase
                    .from('wallet_transactions')
                    .select('*')
                    .eq('wallet_id', walletData.id)
                    .order('created_at', { ascending: false });

                if (transError) throw transError;
                setTransactions(transData || []);
            }
        } catch (err) {
            console.error('Error loading center rewards:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const stats = [
        {
            label: 'Balance',
            value: formatCurrency(currentCenter?.totalEarnings || 0),
            icon: Wallet,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            label: 'Pending Payout',
            value: formatCurrency(0),
            icon: TrendingUp,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
        },
        {
            label: 'Total Earned',
            value: formatCurrency(currentCenter?.totalEarnings || 0),
            icon: Gift,
            color: 'text-amber-600',
            bg: 'bg-amber-100'
        },
        {
            label: 'Active Referrals',
            value: rewards.length,
            icon: CheckCircle,
            color: 'text-purple-600',
            bg: 'bg-purple-100'
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground font-title">Rewards & Earnings</h1>
                    <p className="text-muted-foreground">Track your referral income and payouts</p>
                </div>
                <Button className="bg-amber-600 hover:bg-amber-700">
                    Apply for Withdrawal
                    <ArrowUpRight className="ml-2 size-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-none shadow-sm">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={`size-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`size-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                                <h3 className="text-lg font-bold">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="shadow-md overflow-hidden">
                <CardHeader className="p-0 border-b">
                    <div className="flex">
                        <button
                            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'rewards' ? 'border-amber-600 text-amber-600 bg-amber-50/50' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
                            onClick={() => setActiveTab('rewards')}
                        >
                            Direct Rewards
                        </button>
                        <button
                            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'history' ? 'border-amber-600 text-amber-600 bg-amber-50/50' : 'border-transparent text-muted-foreground hover:bg-muted/50'}`}
                            onClick={() => setActiveTab('history')}
                        >
                            Transaction History
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="size-8 animate-spin text-amber-600 mb-2" />
                            <p className="text-sm text-muted-foreground">Loading financial records...</p>
                        </div>
                    ) : activeTab === 'rewards' ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead>Student Details</TableHead>
                                        <TableHead>Reward Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rewards.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                                                <Gift className="size-12 mx-auto mb-4 opacity-10" />
                                                <p>No rewards earned yet.</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rewards.map((reward) => (
                                            <TableRow key={reward.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-semibold text-sm">{reward.new_student?.name}</p>
                                                        <p className="text-[10px] text-muted-foreground">{reward.new_student?.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-green-600">
                                                    + {formatCurrency(reward.reward_amount)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        {reward.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {formatDate(reward.created_at)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead>Type</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                                                <History className="size-12 mx-auto mb-4 opacity-10" />
                                                <p>No transactions found.</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        transactions.map((trans) => (
                                            <TableRow key={trans.id}>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[10px] uppercase">
                                                        {trans.type.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    {trans.reason}
                                                </TableCell>
                                                <TableCell className={`font-bold ${trans.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {trans.amount > 0 ? '+' : ''} {formatCurrency(trans.amount)}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {formatDate(trans.created_at)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
