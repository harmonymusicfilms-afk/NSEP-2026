import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Award,
  CheckSquare,
  Square,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  useAuthStore,
  useStudentStore,
  useCertificateStore,
  useExamStore,
  useScholarshipStore,
  useAdminLogStore,
} from '@/stores';
import { formatDateTime, getOrdinal } from '@/lib/utils';
import { generateCertificateByTemplate } from '@/lib/certificateTemplates';
import { Certificate, Student, ExamResult, Scholarship, CertificateTemplate } from '@/types';
import JSZip from 'jszip';

export function AdminCertificatesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentAdmin, isAdminLoggedIn } = useAuthStore();
  const { students, loadStudents } = useStudentStore();
  const { certificates, settings, loadCertificates } = useCertificateStore();
  const { results, loadExamData } = useExamStore();
  const { scholarships, loadScholarships } = useScholarshipStore();
  const { addLog } = useAdminLogStore();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterTemplate, setFilterTemplate] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isReissuing, setIsReissuing] = useState<string | null>(null);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn || !currentAdmin) {
      navigate('/admin/login');
      return;
    }
    loadStudents();
    loadCertificates();
    loadExamData();
    loadScholarships();
  }, [isAdminLoggedIn, currentAdmin, navigate, loadStudents, loadCertificates, loadExamData, loadScholarships]);

  // Enhanced certificate data with student and result info
  const enrichedCertificates = useMemo(() => {
    return certificates.map((cert) => {
      const student = students.find((s) => s.id === cert.studentId);
      const result = results.find((r) => r.id === cert.examResultId);
      const scholarship = scholarships.find((s) => s.studentId === cert.studentId);
      return { cert, student, result, scholarship };
    });
  }, [certificates, students, results, scholarships]);

  // Filtered certificates
  const filteredCertificates = useMemo(() => {
    return enrichedCertificates.filter(({ cert, student, result }) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesStudent = student?.name.toLowerCase().includes(query) ||
          student?.email.toLowerCase().includes(query) ||
          student?.mobile.includes(query);
        const matchesCertId = cert.certificateId.toLowerCase().includes(query);
        if (!matchesStudent && !matchesCertId) return false;
      }

      // Class filter
      if (filterClass !== 'all' && result?.class.toString() !== filterClass) {
        return false;
      }

      // Template filter - we'll need to infer this from cert metadata or settings
      // For now, we'll skip this filter since we don't store template type in cert
      if (filterTemplate !== 'all') {
        // This would require storing template type in certificate
        // Skipping for now
      }

      // Date range filter
      if (filterDateFrom) {
        const certDate = new Date(cert.issuedAt);
        const fromDate = new Date(filterDateFrom);
        if (certDate < fromDate) return false;
      }

      if (filterDateTo) {
        const certDate = new Date(cert.issuedAt);
        const toDate = new Date(filterDateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (certDate > toDate) return false;
      }

      return true;
    });
  }, [enrichedCertificates, searchQuery, filterClass, filterTemplate, filterDateFrom, filterDateTo]);

  // Select all toggle
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCertificates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCertificates.map((c) => c.cert.id)));
    }
  };

  // Toggle individual selection
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Reissue certificate
  const handleReissue = async (certId: string) => {
    const enriched = enrichedCertificates.find((e) => e.cert.id === certId);
    if (!enriched || !enriched.student || !enriched.result) {
      toast({
        title: 'Reissue Failed',
        description: 'Certificate data incomplete.',
        variant: 'destructive',
      });
      return;
    }

    setIsReissuing(certId);

    try {
      const totalStudents = results.filter((r) => r.class === enriched.result!.class).length;
      const templateKey = settings.defaultTemplate.toLowerCase() as 'classic' | 'modern' | 'prestigious';
      const templateConfig = settings.templates[templateKey];

      const pdf = await generateCertificateByTemplate(
        settings.defaultTemplate,
        {
          student: enriched.student,
          result: enriched.result,
          certificate: enriched.cert,
          scholarship: enriched.scholarship,
          totalStudents,
        },
        templateConfig
      );

      const fileName = `NSEP_Certificate_${enriched.student.name.replace(/\s+/g, '_')}_${enriched.cert.certificateId}_REISSUED.pdf`;
      pdf.save(fileName);

      if (currentAdmin) {
        addLog(
          currentAdmin.id,
          'REISSUE_CERTIFICATE',
          enriched.cert.id,
          `Reissued certificate ${enriched.cert.certificateId} for ${enriched.student.name}`
        );
      }

      toast({
        title: 'Certificate Reissued',
        description: `Certificate has been regenerated and downloaded.`,
      });
    } catch (error) {
      console.error('Reissue error:', error);
      toast({
        title: 'Reissue Failed',
        description: 'Unable to regenerate certificate. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsReissuing(null);
    }
  };

  // Bulk download
  const handleBulkDownload = async () => {
    if (selectedIds.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select certificates to download.',
        variant: 'destructive',
      });
      return;
    }

    setIsBulkDownloading(true);

    try {
      const zip = new JSZip();
      const templateKey = settings.defaultTemplate.toLowerCase() as 'classic' | 'modern' | 'prestigious';
      const templateConfig = settings.templates[templateKey];

      let processedCount = 0;

      for (const certId of selectedIds) {
        const enriched = enrichedCertificates.find((e) => e.cert.id === certId);
        if (!enriched || !enriched.student || !enriched.result) continue;

        const totalStudents = results.filter((r) => r.class === enriched.result!.class).length;

        const pdf = await generateCertificateByTemplate(
          settings.defaultTemplate,
          {
            student: enriched.student,
            result: enriched.result,
            certificate: enriched.cert,
            scholarship: enriched.scholarship,
            totalStudents,
          },
          templateConfig
        );

        const fileName = `${enriched.cert.certificateId}_${enriched.student.name.replace(/\s+/g, '_')}.pdf`;
        const pdfBlob = pdf.output('blob');
        zip.file(fileName, pdfBlob);

        processedCount++;
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `NSEP_Certificates_Bulk_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      if (currentAdmin) {
        addLog(
          currentAdmin.id,
          'BULK_DOWNLOAD_CERTIFICATES',
          undefined,
          `Bulk downloaded ${processedCount} certificates`
        );
      }

      toast({
        title: 'Bulk Download Complete',
        description: `${processedCount} certificates have been downloaded as a ZIP file.`,
      });

      setSelectedIds(new Set());
    } catch (error) {
      console.error('Bulk download error:', error);
      toast({
        title: 'Bulk Download Failed',
        description: 'Unable to generate ZIP file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsBulkDownloading(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterClass('all');
    setFilterTemplate('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const hasActiveFilters = searchQuery || filterClass !== 'all' || filterTemplate !== 'all' || filterDateFrom || filterDateTo;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="size-6" />
            Certificate Issuance History
          </h1>
          <p className="text-muted-foreground">
            View, filter, reissue, and manage all generated certificates
          </p>
        </div>

        {selectedIds.size > 0 && (
          <Button
            onClick={handleBulkDownload}
            disabled={isBulkDownloading}
            className="institutional-gradient gap-2"
            size="lg"
          >
            {isBulkDownloading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating ZIP...
              </>
            ) : (
              <>
                <Download className="size-4" />
                Bulk Download ({selectedIds.size})
              </>
            )}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="size-4" />
            Filters
          </CardTitle>
          <CardDescription>Filter certificates by student, date, class, or template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Student / Certificate ID</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Name, email, mobile, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Class Filter */}
            <div className="space-y-2">
              <Label htmlFor="filterClass">Class</Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger id="filterClass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
                    <SelectItem key={c} value={c.toString()}>
                      Class {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Issued From</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="dateFrom"
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label htmlFor="dateTo">Issued To</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="dateTo"
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {filteredCertificates.length} of {certificates.length} certificates
              </p>
              <Button onClick={clearFilters} variant="ghost" size="sm">
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Certificates ({filteredCertificates.length})</span>
            {filteredCertificates.length > 0 && (
              <Button
                onClick={toggleSelectAll}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {selectedIds.size === filteredCertificates.length ? (
                  <>
                    <CheckSquare className="size-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="size-4" />
                    Select All
                  </>
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {hasActiveFilters ? 'No certificates match your filters' : 'No certificates issued yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <button onClick={toggleSelectAll} className="p-1">
                        {selectedIds.size === filteredCertificates.length ? (
                          <CheckSquare className="size-4" />
                        ) : (
                          <Square className="size-4" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead>Certificate ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map(({ cert, student, result, scholarship }) => (
                    <TableRow key={cert.id}>
                      <TableCell>
                        <button
                          onClick={() => toggleSelect(cert.id)}
                          className="p-1"
                        >
                          {selectedIds.has(cert.id) ? (
                            <CheckSquare className="size-4 text-primary" />
                          ) : (
                            <Square className="size-4" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {cert.certificateId}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student?.name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">
                            {student?.email || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{result?.class || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {result?.rank ? getOrdinal(result.rank) : 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{result?.totalScore || 0}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            cert.certificateType === 'SCHOLARSHIP'
                              ? 'default'
                              : cert.certificateType === 'MERIT'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {cert.certificateType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDateTime(cert.issuedAt).split(',')[0]}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(cert.issuedAt).split(',')[1]}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={cert.isValid ? 'default' : 'destructive'}>
                          {cert.isValid ? 'Valid' : 'Invalid'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleReissue(cert.id)}
                          disabled={isReissuing === cert.id}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          {isReissuing === cert.id ? (
                            <>
                              <Loader2 className="size-3 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="size-3" />
                              Reissue
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Issued</p>
                <p className="text-2xl font-bold">{certificates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scholarship Certs</p>
                <p className="text-2xl font-bold">
                  {certificates.filter((c) => c.certificateType === 'SCHOLARSHIP').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Students</p>
                <p className="text-2xl font-bold">
                  {new Set(certificates.map((c) => c.studentId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="size-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {
                    certificates.filter((c) => {
                      const date = new Date(c.issuedAt);
                      const now = new Date();
                      return (
                        date.getMonth() === now.getMonth() &&
                        date.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
