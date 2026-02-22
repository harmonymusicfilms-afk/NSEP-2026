import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Copy,
  Ban,
  CheckCircle,
  Search,
  Download,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Shield,
  Building,
  UserPlus,
  Eye,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore, useReferralStore } from '@/stores';
import { REFERRAL_CONFIG, STORAGE_KEYS, APP_CONFIG } from '@/constants/config';
import { generateId, formatCurrency, formatDateTime } from '@/lib/utils';
import type { ReferralCode, ReferralLog, Center } from '@/types';

export function AdminReferralsPage() {
  const navigate = useNavigate();
  const { currentAdmin, isAdminLoggedIn } = useAuthStore();
  const { toast } = useToast();

  const {
    referralCodes,
    referralLogs,
    centers,
    isLoading,
    loadReferralData,
    createReferralCode,
    approveCenter,
    toggleCodeStatus,
  } = useReferralStore();

  const [activeTab, setActiveTab] = useState<'codes' | 'centers' | 'logs'>('codes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Dialog states
  const [showCreateAdminCode, setShowCreateAdminCode] = useState(false);
  const [showViewLogs, setShowViewLogs] = useState(false);
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);

  // Form states
  const [adminCodeForm, setAdminCodeForm] = useState({ adminName: '' });

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate('/admin/login');
      return;
    }
    loadReferralData();
  }, [isAdminLoggedIn, navigate, loadReferralData]);

  // Stats calculations
  const stats = {
    totalCodes: referralCodes.length,
    activeCodes: referralCodes.filter(c => c.isActive).length,
    totalReferrals: referralLogs.length,
    successfulReferrals: referralLogs.filter(l => l.status === 'CREDITED').length,
    totalEarnings: referralLogs.filter(l => l.status === 'CREDITED').reduce((sum, l) => sum + l.amount, 0),
    pendingCenters: centers.filter(c => c.status === 'PENDING').length,
    adminCodes: referralCodes.filter(c => c.type === 'ADMIN_CENTER').length,
    centerCodes: referralCodes.filter(c => c.type === 'CENTER_CODE').length,
  };

  // Create Admin Referral Code (Admin & Super Admin)
  const handleCreateAdminCode = async () => {
    if (currentAdmin?.role !== 'SUPER_ADMIN' && currentAdmin?.role !== 'ADMIN') {
      toast({
        title: 'Permission Denied',
        description: 'Only Admins can create Admin Center Codes.',
        variant: 'destructive',
      });
      return;
    }

    if (!adminCodeForm.adminName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Admin name is required.',
        variant: 'destructive',
      });
      return;
    }

    const code = await createReferralCode(
      adminCodeForm.adminName.trim(),
      'ADMIN_CENTER',
      currentAdmin.id,
      REFERRAL_CONFIG.adminCenterReward
    );

    if (code) {
      setShowCreateAdminCode(false);
      setAdminCodeForm({ adminName: '' });
      toast({
        title: 'Admin Code Created',
        description: `Code ${code.code} created successfully.`,
      });
    }
  };

  // Approve Center and Generate Center Code
  const handleApproveCenter = async (centerId: string) => {
    if (currentAdmin?.role !== 'SUPER_ADMIN' && currentAdmin?.role !== 'ADMIN') {
      toast({
        title: 'Permission Denied',
        description: 'Only Admins can approve centers.',
        variant: 'destructive',
      });
      return;
    }

    await approveCenter(centerId, currentAdmin.id);

    toast({
      title: 'Center Approved',
      description: 'Center has been approved and referral code generated.',
    });
  };

  // Toggle code status
  const handleToggleCodeStatus = async (codeId: string) => {
    await toggleCodeStatus(codeId);
    toast({
      title: 'Status Updated',
      description: 'Referral code status has been updated.',
    });
  };

  // Copy code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied!',
      description: `Code ${code} copied to clipboard.`,
    });
  };

  // View logs for specific code
  const handleViewLogs = (codeId: string) => {
    setSelectedCodeId(codeId);
    setShowViewLogs(true);
  };

  // Filter data
  const filteredCodes = referralCodes.filter(code => {
    const matchesSearch =
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || code.type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredCenters = centers.filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCodeLogs = selectedCodeId
    ? referralLogs.filter(log => log.referralCodeId === selectedCodeId)
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CenterCode Referral System</h1>
          <p className="text-muted-foreground">Manage referral codes and track earnings</p>
        </div>
        {(currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'ADMIN') && (
          <Button onClick={() => setShowCreateAdminCode(true)} className="gap-2">
            <Plus className="size-4" />
            Create Admin Code
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.adminCodes}</p>
                <p className="text-xs text-muted-foreground">Admin Codes (₹{REFERRAL_CONFIG.adminCenterReward}/ref)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
                <Building className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.centerCodes}</p>
                <p className="text-xs text-muted-foreground">Center Codes (₹{REFERRAL_CONFIG.centerCodeReward}/ref)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center">
                <UserPlus className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.successfulReferrals}</p>
                <p className="text-xs text-muted-foreground">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-orange-100 flex items-center justify-center">
                <IndianRupee className="size-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
                <p className="text-xs text-muted-foreground">Total Earnings Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'codes' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('codes')}
        >
          Referral Codes
        </Button>
        <Button
          variant={activeTab === 'centers' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('centers')}
          className="relative"
        >
          Centers
          {stats.pendingCenters > 0 && (
            <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {stats.pendingCenters}
            </span>
          )}
        </Button>
        <Button
          variant={activeTab === 'logs' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('logs')}
        >
          Activity Logs
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search codes or names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {activeTab === 'codes' && (
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ADMIN_CENTER">Admin Codes</SelectItem>
              <SelectItem value="CENTER_CODE">Center Codes</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Referral Codes Tab */}
      {activeTab === 'codes' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No referral codes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-primary">{code.code}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            onClick={() => handleCopyCode(code.code)}
                          >
                            <Copy className="size-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={code.type === 'ADMIN_CENTER' ? 'default' : 'secondary'}>
                          {code.type === 'ADMIN_CENTER' ? 'Admin' : 'Center'}
                        </Badge>
                      </TableCell>
                      <TableCell>{code.ownerName}</TableCell>
                      <TableCell>{formatCurrency(code.rewardAmount)}</TableCell>
                      <TableCell>{code.totalReferrals}</TableCell>
                      <TableCell>{formatCurrency(code.totalEarnings)}</TableCell>
                      <TableCell>
                        <Badge variant={code.isActive ? 'default' : 'destructive'}>
                          {code.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleViewLogs(code.id)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleToggleCodeStatus(code.id)}
                          >
                            {code.isActive ? <Ban className="size-4" /> : <CheckCircle className="size-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Centers Tab */}
      {activeTab === 'centers' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Center Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Center Code</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCenters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No centers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCenters.map((center) => (
                    <TableRow key={center.id}>
                      <TableCell className="font-medium">{center.name}</TableCell>
                      <TableCell>{center.ownerName}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{center.email}</p>
                          <p className="text-muted-foreground">{center.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{center.district}, {center.state}</TableCell>
                      <TableCell>
                        {center.centerCode ? (
                          <code className="font-mono font-bold text-primary">{center.centerCode}</code>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{center.totalStudents}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            center.status === 'APPROVED'
                              ? 'default'
                              : center.status === 'PENDING'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {center.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {center.status === 'PENDING' && (currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'ADMIN') && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveCenter(center.id)}
                          >
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Referrer</TableHead>
                  <TableHead>New User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No referral activity yet
                    </TableCell>
                  </TableRow>
                ) : (
                  referralLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{formatDateTime(log.createdAt)}</TableCell>
                      <TableCell>
                        <code className="font-mono text-primary">{log.referralCode}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.referrerRole}</Badge>
                        <span className="ml-2 text-xs text-muted-foreground">{log.referrerId}</span>
                      </TableCell>
                      <TableCell>{log.newUserName}</TableCell>
                      <TableCell>{formatCurrency(log.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === 'CREDITED'
                              ? 'default'
                              : log.status === 'PENDING'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Admin Code Dialog */}
      <Dialog open={showCreateAdminCode} onOpenChange={setShowCreateAdminCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Admin Center Code</DialogTitle>
            <DialogDescription>
              Create a new referral code for admin use. Admin codes earn ₹{REFERRAL_CONFIG.adminCenterReward} per successful referral.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adminName">Admin Name *</Label>
              <Input
                id="adminName"
                value={adminCodeForm.adminName}
                onChange={(e) => setAdminCodeForm({ adminName: e.target.value })}
                placeholder="Enter admin name for this code"
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Important</p>
                  <p className="text-yellow-700">
                    Admin codes cannot be edited, transferred, or duplicated once created.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAdminCode(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAdminCode}>
              Create Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Logs Dialog */}
      <Dialog open={showViewLogs} onOpenChange={setShowViewLogs}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Referral Activity Logs</DialogTitle>
            <DialogDescription>
              Detailed logs for selected referral code
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-auto">
            {selectedCodeLogs.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No activity recorded for this code yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>New User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedCodeLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{formatDateTime(log.createdAt)}</TableCell>
                      <TableCell>{log.newUserName}</TableCell>
                      <TableCell>{formatCurrency(log.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === 'CREDITED' ? 'default' : 'secondary'}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowViewLogs(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
