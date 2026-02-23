import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Users,
  FileText,
  AlertCircle,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useAuthStore,
  useStudentStore,
  useEmailStore,
  useCertificateStore,
} from '@/stores';
import { formatDateTime } from '@/lib/utils';
import { EmailTemplate, EmailDelivery } from '@/types';

export function AdminEmailsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentAdmin, isAdminLoggedIn } = useAuthStore();
  const { students, loadStudents } = useStudentStore();
  const { certificates, loadCertificates } = useCertificateStore();
  const {
    templates,
    deliveries,
    loadEmailData,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
    resendEmail,
    sendBulkEmails,
  } = useEmailStore();

  const [activeTab, setActiveTab] = useState<'deliveries' | 'templates'>('deliveries');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Template editor state
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    bodyHtml: '',
  });

  // Bulk send state
  const [showBulkSend, setShowBulkSend] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [bulkTemplateId, setBulkTemplateId] = useState<string>('');

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdminLoggedIn || !currentAdmin) {
      navigate('/admin/login');
      return;
    }
    loadStudents();
    loadCertificates();
    loadEmailData();
  }, [isAdminLoggedIn, currentAdmin, navigate, loadStudents, loadCertificates, loadEmailData]);

  // Filtered deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      if (filterStatus !== 'all' && d.status !== filterStatus) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const student = students.find((s) => s.id === d.studentId);
        const matchesEmail = d.recipientEmail.toLowerCase().includes(query);
        const matchesStudent = student?.name.toLowerCase().includes(query);
        const matchesSubject = d.subject.toLowerCase().includes(query);
        if (!matchesEmail && !matchesStudent && !matchesSubject) return false;
      }

      return true;
    });
  }, [deliveries, searchQuery, filterStatus, students]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: deliveries.length,
      sent: deliveries.filter((d) => d.status === 'SENT').length,
      failed: deliveries.filter((d) => d.status === 'FAILED').length,
      pending: deliveries.filter((d) => d.status === 'PENDING').length,
    };
  }, [deliveries]);

  // Open template editor
  const openTemplateEditor = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        subject: template.subject,
        bodyHtml: template.bodyHtml,
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        subject: '',
        bodyHtml: '',
      });
    }
    setShowTemplateEditor(true);
  };

  // Save template
  const handleSaveTemplate = () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.bodyHtml) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, templateForm);
      toast({
        title: 'Template Updated',
        description: `Email template "${templateForm.name}" has been updated.`,
      });
    } else {
      createTemplate(templateForm.name, templateForm.subject, templateForm.bodyHtml);
      toast({
        title: 'Template Created',
        description: `Email template "${templateForm.name}" has been created.`,
      });
    }

    setShowTemplateEditor(false);
    setTemplateForm({ name: '', subject: '', bodyHtml: '' });
    setEditingTemplate(null);
  };

  // Delete template
  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    toast({
      title: 'Template Deleted',
      description: 'Email template has been deleted.',
    });
    setDeleteConfirm(null);
  };

  // Resend email
  const handleResend = (deliveryId: string) => {
    resendEmail(deliveryId);
    toast({
      title: 'Email Resent',
      description: 'Certificate email has been queued for resending.',
    });
  };

  // Bulk send
  const handleBulkSend = () => {
    if (selectedStudents.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select students to send emails.',
        variant: 'destructive',
      });
      return;
    }

    if (!bulkTemplateId) {
      toast({
        title: 'No Template',
        description: 'Please select an email template.',
        variant: 'destructive',
      });
      return;
    }

    const studentIds = Array.from(selectedStudents);
    sendBulkEmails(studentIds, bulkTemplateId);

    toast({
      title: 'Bulk Emails Sent',
      description: `${studentIds.length} certificate emails have been sent.`,
    });

    setShowBulkSend(false);
    setSelectedStudents(new Set());
    setBulkTemplateId('');
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  // Students with approved scholarships and certificates
  const eligibleStudents = useMemo(() => {
    return students.filter((s) => {
      const cert = certificates.find((c) => c.studentId === s.id);
      return cert !== undefined;
    });
  }, [students, certificates]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
            <Mail className="size-6" />
            Email Management
          </h1>
          <p className="text-muted-foreground">
            Send certificates via email and manage delivery status
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowBulkSend(true)}
            variant="outline"
            className="gap-2"
          >
            <Users className="size-4" />
            Bulk Send
          </Button>
          <Button
            onClick={() => openTemplateEditor()}
            className="institutional-gradient gap-2"
          >
            <Plus className="size-4" />
            New Template
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Emails</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">{stats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="size-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="size-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'deliveries'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          Email Deliveries
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'templates'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          Email Templates
        </button>
      </div>

      {/* Deliveries Tab */}
      {activeTab === 'deliveries' && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Student, email, subject..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="SENT">Sent</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="RETRY">Retry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliveries Table */}
          <Card>
            <CardHeader>
              <CardTitle>Email Delivery History ({filteredDeliveries.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDeliveries.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No email deliveries found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent Date</TableHead>
                        <TableHead>Retries</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDeliveries.map((delivery) => {
                        const student = students.find((s) => s.id === delivery.studentId);
                        return (
                          <TableRow key={delivery.id}>
                            <TableCell>
                              <div className="font-medium">{student?.name || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground">
                                Class {student?.class}
                              </div>
                            </TableCell>
                            <TableCell>{delivery.recipientEmail}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {delivery.subject}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  delivery.status === 'SENT'
                                    ? 'default'
                                    : delivery.status === 'FAILED'
                                      ? 'destructive'
                                      : delivery.status === 'PENDING'
                                        ? 'secondary'
                                        : 'outline'
                                }
                              >
                                {delivery.status === 'SENT' && <CheckCircle className="size-3 mr-1" />}
                                {delivery.status === 'FAILED' && <XCircle className="size-3 mr-1" />}
                                {delivery.status === 'PENDING' && <Clock className="size-3 mr-1" />}
                                {delivery.status === 'RETRY' && <RefreshCw className="size-3 mr-1" />}
                                {delivery.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {delivery.sentAt ? (
                                <div className="text-sm">
                                  {formatDateTime(delivery.sentAt).split(',')[0]}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Not sent</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {delivery.retryCount > 0 ? (
                                <Badge variant="outline">{delivery.retryCount}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {(delivery.status === 'FAILED' || delivery.status === 'RETRY') && (
                                <Button
                                  onClick={() => handleResend(delivery.id)}
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <RefreshCw className="size-3" />
                                  Resend
                                </Button>
                              )}
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
        </>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Templates ({templates.length})</CardTitle>
            <CardDescription>
              Create and manage reusable email templates for certificate delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="size-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No email templates found</p>
                <Button onClick={() => openTemplateEditor()} className="gap-2">
                  <Plus className="size-4" />
                  Create Your First Template
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className={template.isDefault ? 'ring-2 ring-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{template.name}</h3>
                            {template.isDefault && (
                              <Badge variant="default" className="text-xs">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {template.subject}
                          </p>
                          <div className="flex gap-1 flex-wrap">
                            {template.variables.map((v) => (
                              <span
                                key={v}
                                className="text-xs px-2 py-0.5 bg-muted rounded"
                              >
                                {`{{${v}}}`}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        {!template.isDefault && (
                          <Button
                            onClick={() => setDefaultTemplate(template.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Set as Default
                          </Button>
                        )}
                        <Button
                          onClick={() => openTemplateEditor(template)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Edit className="size-3" />
                          Edit
                        </Button>
                        {!template.isDefault && (
                          <Button
                            onClick={() => setDeleteConfirm(template.id)}
                            variant="outline"
                            size="sm"
                            className="gap-2 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-3" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Template Editor Dialog */}
      {showTemplateEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingTemplate ? 'Edit Email Template' : 'Create Email Template'}
              </CardTitle>
              <CardDescription>
                Create your email template. You can insert dynamic variables that will be replaced when sending.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name *</Label>
                <Input
                  id="templateName"
                  placeholder="e.g., Certificate Delivery"
                  value={templateForm.name}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Your NSEP Certificate - Rank {{rank}}"
                  value={templateForm.subject}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, subject: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <Label htmlFor="bodyHtml">Email Body (HTML) *</Label>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-xs text-muted-foreground mr-1 self-center hidden sm:block">Insert:</span>
                    {['studentName', 'rank', 'class', 'score', 'centerCode'].map(v => (
                      <Badge
                        key={v}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary/20 text-[10px] py-0 px-1.5"
                        onClick={() => setTemplateForm(prev => ({ ...prev, bodyHtml: prev.bodyHtml + `{{${v}}}` }))}
                      >
                        +{v}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Textarea
                  id="bodyHtml"
                  rows={12}
                  placeholder="Dear {{studentName}},&#10;&#10;Congratulations on achieving Rank {{rank}} in Class {{class}}!&#10;&#10;Please find your certificate attached.&#10;&#10;Best regards,&#10;NSEP Team"
                  value={templateForm.bodyHtml}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, bodyHtml: e.target.value })
                  }
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowTemplateEditor(false);
                    setTemplateForm({ name: '', subject: '', bodyHtml: '' });
                    setEditingTemplate(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate} className="flex-1 institutional-gradient">
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Send Dialog */}
      {showBulkSend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Bulk Send Certificates</CardTitle>
              <CardDescription>
                Select students and template to send certificate emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Template</Label>
                <Select value={bulkTemplateId} onValueChange={setBulkTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} {t.isDefault && '(Default)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Select Students ({selectedStudents.size} selected)
                </Label>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  {eligibleStudents.map((student) => {
                    const cert = certificates.find((c) => c.studentId === student.id);
                    const alreadySent = deliveries.some(
                      (d) => d.studentId === student.id && d.status === 'SENT'
                    );

                    return (
                      <label
                        key={student.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="size-4"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {student.email} • Class {student.class}
                          </div>
                        </div>
                        {alreadySent && (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle className="size-3" />
                            Sent
                          </Badge>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowBulkSend(false);
                    setSelectedStudents(new Set());
                    setBulkTemplateId('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkSend}
                  className="flex-1 institutional-gradient gap-2"
                  disabled={selectedStudents.size === 0 || !bulkTemplateId}
                >
                  <Send className="size-4" />
                  Send {selectedStudents.size} Emails
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this email template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDeleteTemplate(deleteConfirm)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
