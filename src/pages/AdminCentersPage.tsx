import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  Filter,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore, useAdminLogStore } from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { formatDate, generateId } from '@/lib/utils';
import { REFERRAL_CONFIG, STORAGE_KEYS } from '@/constants/config';
import { sendEmailNotification } from '@/lib/emailNotifications';

import { Center } from '@/types';

export function AdminCentersPage() {
  const navigate = useNavigate();
  const { currentAdmin, isAdminLoggedIn } = useAuthStore();
  const { addLog } = useAdminLogStore();
  const { toast } = useToast();

  const [centers, setCenters] = useState<Center[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn || !currentAdmin) {
      navigate('/admin/login');
      return;
    }
    loadCenters();
  }, [isAdminLoggedIn, currentAdmin, navigate]);

  const loadCenters = () => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.centers) || '[]');
    setCenters(data);
  };

  const saveCenters = (data: Center[]) => {
    localStorage.setItem(STORAGE_KEYS.centers, JSON.stringify(data));
    setCenters(data);
  };

  const handleApprove = () => {
    if (!selectedCenter || !currentAdmin) return;

    const updatedCenters = centers.map(c => {
      if (c.id === selectedCenter.id) {
        return {
          ...c,
          status: 'APPROVED' as const,
          approvedBy: currentAdmin.id,
          approvedAt: new Date().toISOString(),
        };
      }
      return c;
    });

    // Create referral code for center
    const referralCodes = JSON.parse(localStorage.getItem(STORAGE_KEYS.referralCodes) || '[]');
    const newCode = {
      id: generateId(),
      code: selectedCenter.centerCode,
      type: 'CENTER_CODE',
      ownerId: selectedCenter.id,
      ownerName: selectedCenter.name,
      rewardAmount: REFERRAL_CONFIG.centerCodeReward,
      isActive: true,
      totalReferrals: 0,
      totalEarnings: 0,
      createdAt: new Date().toISOString(),
    };
    referralCodes.push(newCode);
    localStorage.setItem(STORAGE_KEYS.referralCodes, JSON.stringify(referralCodes));

    // Send approval email
    sendEmailNotification(
      'CENTER_APPROVED',
      selectedCenter.email,
      {
        studentName: selectedCenter.ownerName,
        studentEmail: selectedCenter.email,
        centerName: selectedCenter.name,
        centerCode: selectedCenter.centerCode,
        date: new Date().toISOString(),
      }
    );

    saveCenters(updatedCenters);
    setIsApproveDialogOpen(false);
    setSelectedCenter(null);

    addLog(currentAdmin.id, 'APPROVE_CENTER', selectedCenter.id, `Approved center ${selectedCenter.name} (${selectedCenter.centerCode})`);

    toast({
      title: 'Center Approved',
      description: `${selectedCenter.name} has been approved successfully.`,
    });
  };

  const handleReject = () => {
    if (!selectedCenter || !currentAdmin) return;

    const updatedCenters = centers.map(c => {
      if (c.id === selectedCenter.id) {
        return {
          ...c,
          status: 'BLOCKED' as const,
          approvedBy: currentAdmin.id,
          approvedAt: new Date().toISOString(),
        };
      }
      return c;
    });

    saveCenters(updatedCenters);
    setIsRejectDialogOpen(false);
    setSelectedCenter(null);
    setRejectionReason('');

    addLog(currentAdmin.id, 'REJECT_CENTER', selectedCenter.id, `Rejected center ${selectedCenter.name}. Reason: ${rejectionReason}`);

    toast({
      title: 'Center Rejected',
      description: `${selectedCenter.name} has been rejected.`,
      variant: 'destructive',
    });
  };

  const filteredCenters = centers.filter(center => {
    const matchesSearch =
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.centerCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || center.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: centers.length,
    pending: centers.filter(c => c.status === 'PENDING').length,
    approved: centers.filter(c => c.status === 'APPROVED').length,
    blocked: centers.filter(c => c.status === 'BLOCKED').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Center Management</h1>
          <p className="text-muted-foreground">Manage examination center applications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Centers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="size-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="size-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.blocked}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="BLOCKED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Centers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Centers ({filteredCenters.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCenters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="size-12 mx-auto mb-4 opacity-50" />
              <p>No centers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Center</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCenters.map((center) => (
                    <TableRow key={center.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{center.name}</p>
                          <p className="text-xs text-muted-foreground">{center.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-muted-foreground" />
                          {center.ownerName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="size-4 text-muted-foreground" />
                          <span className="text-sm">{center.district}, {center.state}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{center.centerCode}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          center.status === 'APPROVED' ? 'default' :
                            center.status === 'PENDING' ? 'secondary' : 'destructive'
                        }>
                          {center.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(center.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedCenter(center);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="size-4" />
                          </Button>
                          {center.status === 'PENDING' && (
                            <>
                              {(currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'ADMIN') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => {
                                    setSelectedCenter(center);
                                    setIsApproveDialogOpen(true);
                                  }}
                                >
                                  <CheckCircle className="size-4" />
                                </Button>
                              )}
                              {(currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'ADMIN') && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setSelectedCenter(center);
                                    setIsRejectDialogOpen(true);
                                  }}
                                >
                                  <XCircle className="size-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Center Details</DialogTitle>
          </DialogHeader>
          {selectedCenter && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Center Name</p>
                  <p className="font-medium">{selectedCenter.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Center Type</p>
                  <p className="font-medium capitalize">{selectedCenter.centerType.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Center Code</p>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{selectedCenter.centerCode}</code>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={
                    selectedCenter.status === 'APPROVED' ? 'default' :
                      selectedCenter.status === 'PENDING' ? 'secondary' : 'destructive'
                  }>
                    {selectedCenter.status}
                  </Badge>
                </div>

                <div className="col-span-2 border-t pt-2 mt-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Owner Details</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Owner Name</p>
                  <p className="font-medium">{selectedCenter.ownerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aadhaar Number</p>
                  <p className="font-medium">{selectedCenter.ownerAadhaar}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedCenter.ownerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-sm">{selectedCenter.ownerPhone}</p>
                </div>

                <div className="col-span-2 border-t pt-2 mt-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Location Information</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Full Address</p>
                  <p className="text-sm">{selectedCenter.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Village/Town</p>
                  <p className="text-sm">{selectedCenter.village}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Block/Tehsil</p>
                  <p className="text-sm">{selectedCenter.block}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">District</p>
                  <p className="text-sm">{selectedCenter.district}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">State</p>
                  <p className="text-sm">{selectedCenter.state}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pincode</p>
                  <p className="text-sm">{selectedCenter.pincode}</p>
                </div>

                <div className="col-span-2 border-t pt-2 mt-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Documents</p>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {selectedCenter.idProofUrl && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground">ID Proof</p>
                        <a href={selectedCenter.idProofUrl} target="_blank" rel="noreferrer" className="block w-full aspect-square border rounded overflow-hidden hover:opacity-80 transition-opacity">
                          <img src={selectedCenter.idProofUrl} alt="ID Proof" className="w-full h-full object-cover" />
                        </a>
                      </div>
                    )}
                    {selectedCenter.addressProofUrl && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground">Address Proof</p>
                        <a href={selectedCenter.addressProofUrl} target="_blank" rel="noreferrer" className="block w-full aspect-square border rounded overflow-hidden hover:opacity-80 transition-opacity">
                          <img src={selectedCenter.addressProofUrl} alt="Address Proof" className="w-full h-full object-cover" />
                        </a>
                      </div>
                    )}
                    {selectedCenter.centerPhotoUrl && (
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground">Center Photo</p>
                        <a href={selectedCenter.centerPhotoUrl} target="_blank" rel="noreferrer" className="block w-full aspect-square border rounded overflow-hidden hover:opacity-80 transition-opacity">
                          <img src={selectedCenter.centerPhotoUrl} alt="Center Photo" className="w-full h-full object-cover" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-2 border-t pt-2 mt-2">
                  <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Statistics & Dates</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="font-medium">{selectedCenter.totalStudents || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="font-medium">₹{selectedCenter.totalEarnings || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applied On</p>
                  <p className="text-sm">{formatDate(selectedCenter.createdAt)}</p>
                </div>
                {selectedCenter.approvedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Approved On</p>
                    <p className="text-sm">{formatDate(selectedCenter.approvedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Center</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve "{selectedCenter?.name}"?
              This will activate their center code and allow them to earn referral rewards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="size-4 mr-2" />
              Approve Center
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Center</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{selectedCenter?.name}".
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="size-4 mr-2" />
              Reject Center
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
