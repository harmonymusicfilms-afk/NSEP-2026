import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  Download, 
  Eye, 
  FileCheck, 
  QrCode,
  Calendar,
  Shield,
  Trophy,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  useAuthStore,
  useCertificateStore,
  useExamStore,
  useScholarshipStore,
  useStudentStore,
} from '@/stores';
import { formatDateTime, getOrdinal } from '@/lib/utils';
import { CertificateDownloader } from '@/components/features';

export function StudentCertificatesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentStudent, isStudentLoggedIn } = useAuthStore();
  const { certificates, loadCertificates, settings, loadSettings } = useCertificateStore();
  const { results, loadExamData } = useExamStore();
  const { scholarships, loadScholarships } = useScholarshipStore();
  const { students, loadStudents } = useStudentStore();

  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);

  useEffect(() => {
    if (!isStudentLoggedIn || !currentStudent) {
      navigate('/login');
      return;
    }
    loadCertificates();
    loadSettings();
    loadExamData();
    loadScholarships();
    loadStudents();
  }, [isStudentLoggedIn, currentStudent, navigate, loadCertificates, loadSettings, loadExamData, loadScholarships, loadStudents]);

  if (!currentStudent) return null;

  // Get student's certificates
  const myCertificates = certificates.filter((c) => c.studentId === currentStudent.id);

  // Get exam result and scholarship for each certificate
  const certificatesWithDetails = myCertificates.map((cert) => {
    const examResult = results.find((r) => r.id === cert.examResultId);
    const scholarship = scholarships.find((s) => s.studentId === cert.studentId);
    return { cert, examResult, scholarship };
  });

  const handleCopyVerificationLink = (certificateId: string) => {
    const verificationUrl = `${window.location.origin}/verify?id=${certificateId}`;
    navigator.clipboard.writeText(verificationUrl);
    toast({
      title: 'Link Copied',
      description: 'Verification link copied to clipboard',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
          <Award className="size-6 text-primary" />
          My Certificates
        </h1>
        <p className="text-muted-foreground">
          View, download, and verify your achievement certificates
        </p>
      </div>

      {/* Empty State */}
      {myCertificates.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted mb-4">
              <FileCheck className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No Certificates Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Certificates will appear here after you complete the exam and receive scholarship approval from the admin.
            </p>
            <Button onClick={() => navigate('/dashboard/exam')} className="institutional-gradient">
              Take Exam
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Certificates Grid */}
      {myCertificates.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          {certificatesWithDetails.map(({ cert, examResult, scholarship }) => (
            <Card key={cert.id} className="hover:shadow-elevated transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="size-5 text-primary" />
                      <CardTitle className="text-lg">
                        {cert.certificateType === 'SCHOLARSHIP' 
                          ? 'Scholarship Certificate' 
                          : cert.certificateType === 'MERIT'
                          ? 'Merit Certificate'
                          : 'Achievement Certificate'}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Class {examResult?.class || currentStudent.class} • {formatDateTime(cert.issuedAt).split(',')[0]}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={cert.isValid ? 'default' : 'destructive'}
                    className="gap-1"
                  >
                    {cert.isValid ? (
                      <>
                        <Shield className="size-3" />
                        Verified
                      </>
                    ) : (
                      'Invalid'
                    )}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Certificate Details */}
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Certificate ID</p>
                      <p className="font-mono font-semibold text-xs break-all">
                        {cert.certificateId}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Issue Date</p>
                      <p className="font-medium">
                        {formatDateTime(cert.issuedAt).split(',')[0]}
                      </p>
                    </div>
                  </div>

                  {examResult && (
                    <div className="pt-3 border-t border-border grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Rank</p>
                        <p className="text-lg font-bold text-primary">
                          {examResult.rank ? getOrdinal(examResult.rank) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="text-lg font-bold text-primary">
                          {examResult.totalScore}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Correct</p>
                        <p className="text-lg font-bold text-primary">
                          {examResult.correctCount}
                        </p>
                      </div>
                    </div>
                  )}

                  {scholarship && scholarship.amount && (
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Award className="size-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">
                            Scholarship Awarded
                          </span>
                        </div>
                        <span className="text-lg font-bold text-green-700">
                          ₹{scholarship.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <CertificateDownloader
                    studentId={cert.studentId}
                    examResultId={cert.examResultId}
                    certificateId={cert.certificateId}
                    certificateType={cert.certificateType}
                    trigger={
                      <Button variant="outline" className="w-full gap-2">
                        <Download className="size-4" />
                        Download PDF
                      </Button>
                    }
                  />
                  
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleCopyVerificationLink(cert.certificateId)}
                  >
                    <QrCode className="size-4" />
                    Copy Verify Link
                  </Button>
                </div>

                {/* Verification Link */}
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Public Verification:</span>
                    <a
                      href={`/verify?id=${cert.certificateId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Verify Online
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      {myCertificates.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                <FileCheck className="size-5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-blue-900">Certificate Verification</h3>
                <p className="text-sm text-blue-700">
                  All certificates include a unique QR code and certificate ID for public verification. 
                  Anyone can verify the authenticity of your certificate by scanning the QR code or 
                  visiting our verification page with the certificate ID.
                </p>
                <Button
                  variant="link"
                  className="text-blue-700 hover:text-blue-900 p-0 h-auto"
                  onClick={() => navigate('/verify')}
                >
                  Go to Verification Page →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
