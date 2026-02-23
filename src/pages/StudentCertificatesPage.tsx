import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Calendar,
  Shield,
  Loader2,
  FileCheck,
  Eye,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useAuthStore, useCertificateStore, useExamStore, useScholarshipStore } from '@/stores';
import { formatDateTime } from '@/lib/utils';
import { CertificateDownloader } from '@/components/features/CertificateDownloader';
import { CertificateGenerator } from '@/components/CertificateGenerator';

export function StudentCertificatesPage() {
  const navigate = useNavigate();
  const { currentStudent, isStudentLoggedIn } = useAuthStore();
  const { certificates, loadCertificates, isLoading: certsLoading } = useCertificateStore();
  const { results, loadExamData, isLoading: examsLoading } = useExamStore();
  const { scholarships, loadScholarships, isLoading: scholarshipsLoading } = useScholarshipStore();

  useEffect(() => {
    if (!isStudentLoggedIn) {
      navigate('/login');
      return;
    }
    if (currentStudent) {
      // Load all necessary data
      loadCertificates();
      loadExamData();
      loadScholarships();
    }
  }, [isStudentLoggedIn, currentStudent, navigate, loadCertificates, loadExamData, loadScholarships]);

  const isLoading = certsLoading || examsLoading || scholarshipsLoading;

  if (isLoading || !currentStudent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter certificates for current student
  const myCertificates = certificates.filter(c => c.studentId === currentStudent.id);

  // Helper to get total students for a class (for rank generation if needed in cert)
  const getClassTotalStudents = (className: number) => {
    return results.filter(r => r.class === className && r.resultStatus === 'PUBLISHED').length;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
          <Award className="size-6 text-primary" />
          My Certificates
        </h1>
        <p className="text-muted-foreground">
          View and download your earned certificates
        </p>
      </div>

      {myCertificates.length === 0 && (
        <div className="mb-8">
          <Card className="text-center py-12 border-dashed">
            <CardContent>
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Certificates Earned Yet</h3>
              <p className="text-muted-foreground mb-0 max-w-md mx-auto">
                Complete the exam and achieve a qualifying score to earn official certificates. Below is a preview of what your certificate will look like.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myCertificates.length === 0 && (
          <Card className="overflow-hidden hover:shadow-md transition-shadow relative border-dashed">
            <div className="absolute top-4 -right-10 bg-amber-500 text-white text-[10px] font-bold uppercase py-1 px-12 rotate-45 z-10 shadow-lg">
              DEMO PREVIEW
            </div>
            <div className="aspect-[1.414/1] bg-muted relative border-b p-4 flex items-center justify-center opacity-80">
              <div className="text-center p-6 bg-white border shadow-sm w-full h-full flex flex-col items-center justify-center pointer-events-none">
                <Award className="size-12 text-primary mb-2" />
                <div className="font-serif font-bold text-lg text-primary">Certificate</div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-4">OF ACHIEVEMENT</div>
                <div className="text-sm font-medium">{currentStudent.name}</div>
              </div>
              <div className="absolute top-2 left-2 pointer-events-none">
                <Badge variant="secondary" className="bg-white/80">DEMO</Badge>
              </div>
            </div>

            <CardContent className="p-4 space-y-4 relative">
              <div className="space-y-2 text-sm opacity-80 pointer-events-none">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <FileCheck className="size-3" /> Cert ID
                  </span>
                  <span className="font-mono text-xs">DEMO-00000X</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" /> Issued
                  </span>
                  <span>{new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full institutional-gradient relative z-20">
                    <Eye className="size-4 mr-2" />
                    Preview Demo Certificate
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[1250px] w-[95vw] overflow-auto flex justify-center p-8 bg-muted/50 border-none shadow-none">
                  <div className="scale-[0.5] sm:scale-75 md:scale-90 lg:scale-100 origin-top flex items-center justify-center">
                    <CertificateGenerator
                      student={currentStudent}
                      result={{
                        id: 'demo-result',
                        studentId: currentStudent.id,
                        class: currentStudent.class,
                        score: 95,
                        totalMarks: 100,
                        rank: 1,
                        correctAnswers: 95,
                        wrongAnswers: 5,
                        attemptDate: new Date().toISOString(),
                        resultStatus: 'PUBLISHED'
                      }}
                      certificate={{
                        id: 'demo-cert',
                        studentId: currentStudent.id,
                        examResultId: 'demo-result',
                        certificateType: 'MERIT',
                        certificateId: 'DEMO-00000X',
                        issuedAt: new Date().toISOString()
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {myCertificates.map((cert) => {
          const result = results.find(r => r.id === cert.examResultId);
          const scholarship = scholarships.find(s => s.studentId === cert.studentId);
          const totalStudents = result ? getClassTotalStudents(result.class) : 0;

          if (!result) return null;

          return (
            <Card key={cert.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-[1.414/1] bg-muted relative border-b p-4 flex items-center justify-center">
                <div className="text-center p-6 bg-white border shadow-sm w-full h-full flex flex-col items-center justify-center">
                  <Award className="size-12 text-primary mb-2" />
                  <div className="font-serif font-bold text-lg text-primary">Certificate</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mb-4">OF ACHIEVEMENT</div>
                  <div className="text-sm font-medium">{currentStudent.name}</div>
                </div>

                <div className="absolute top-2 right-2">
                  <Badge variant={cert.certificateType === 'SCHOLARSHIP' ? 'default' : 'secondary'}>
                    {cert.certificateType}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <FileCheck className="size-3" /> Cert ID
                    </span>
                    <span className="font-mono text-xs">{cert.certificateId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3" /> Issued
                    </span>
                    <span>{formatDateTime(cert.issuedAt).split(',')[0]}</span>
                  </div>
                </div>

                <CertificateDownloader
                  student={currentStudent}
                  result={result}
                  certificate={cert}
                  scholarship={scholarship}
                  totalStudents={totalStudents}
                  className="w-full institutional-gradient"
                  label="Download / Preview"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
