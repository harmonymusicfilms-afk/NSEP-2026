import { useState } from 'react';
import { Search, CheckCircle, XCircle, Award, User, Calendar, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCertificateStore, useExamStore } from '@/stores';
import { APP_CONFIG } from '@/constants/config';
import { formatDate, getOrdinal } from '@/lib/utils';

export function VerifyPage() {
  const [certificateId, setCertificateId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    certificate?: ReturnType<typeof useCertificateStore.getState>['certificates'][0];
    student?: { name: string; fatherName: string; class: number };
    examResult?: { totalScore: number; rank: number };
  } | null>(null);

  const { verifyCertificate, loadCertificates } = useCertificateStore();
  const { results, loadExamData } = useExamStore();

  const handleSearch = async () => {
    if (!certificateId.trim()) return;

    setIsSearching(true);
    loadCertificates();
    loadExamData();

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const result = verifyCertificate(certificateId.trim().toUpperCase());

    if (result.isValid && result.certificate && result.student) {
      const examResult = results.find((r) => r.id === result.certificate?.examResultId);
      setSearchResult({
        found: true,
        certificate: result.certificate,
        student: {
          name: result.student.name,
          fatherName: result.student.fatherName,
          class: result.student.class,
        },
        examResult: examResult ? { totalScore: examResult.totalScore, rank: examResult.rank || 0 } : undefined,
      });
    } else {
      setSearchResult({ found: false });
    }

    setIsSearching(false);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
            <QrCode className="size-8 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Certificate Verification
          </h1>
          <p className="text-muted-foreground">
            Enter the Certificate ID to verify its authenticity
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certificateId">Certificate ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="certificateId"
                    value={certificateId}
                    onChange={(e) => {
                      setCertificateId(e.target.value.toUpperCase());
                      setSearchResult(null);
                    }}
                    placeholder="e.g., GPHDM2025ABCD1234"
                    className="font-mono uppercase"
                  />
                  <Button onClick={handleSearch} disabled={isSearching || !certificateId.trim()}>
                    {isSearching ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Search className="size-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The Certificate ID can be found on the bottom of your certificate or scan the QR code
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Result */}
        {searchResult && (
          <Card className={searchResult.found ? 'border-green-500 border-2' : 'border-red-500 border-2'}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {searchResult.found ? (
                  <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="size-6 text-green-600" />
                  </div>
                ) : (
                  <div className="size-12 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="size-6 text-red-600" />
                  </div>
                )}
                <div>
                  <CardTitle className={searchResult.found ? 'text-green-700' : 'text-red-700'}>
                    {searchResult.found ? 'Certificate Verified' : 'Certificate Not Found'}
                  </CardTitle>
                  <CardDescription>
                    {searchResult.found
                      ? 'This certificate is authentic and valid'
                      : 'No certificate found with this ID'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {searchResult.found && searchResult.certificate && searchResult.student && (
              <CardContent className="space-y-6">
                {/* Certificate Details */}
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Award className="size-4 text-primary" />
                    Certificate Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Certificate ID:</span>
                    <span className="font-mono">{searchResult.certificate.certificateId}</span>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{searchResult.certificate.certificateType.toLowerCase()}</span>
                    <span className="text-muted-foreground">Issue Date:</span>
                    <span>{formatDate(searchResult.certificate.issuedAt)}</span>
                  </div>
                </div>

                {/* Student Details */}
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    Student Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{searchResult.student.name}</span>
                    <span className="text-muted-foreground">Father's Name / Guardian:</span>
                    <span>{searchResult.student.fatherName}</span>
                    <span className="text-muted-foreground">Class:</span>
                    <span>Class {searchResult.student.class}</span>
                  </div>
                </div>

                {/* Exam Result */}
                {searchResult.examResult && (
                  <div className="bg-primary/10 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="size-4 text-primary" />
                      Examination Results
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Score</p>
                        <p className="text-2xl font-bold text-primary">{searchResult.examResult.totalScore}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-sm text-muted-foreground">Class Rank</p>
                        <p className="text-2xl font-bold text-primary">
                          {searchResult.examResult.rank ? getOrdinal(searchResult.examResult.rank) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Badge */}
                <div className="flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-3">
                  <CheckCircle className="size-4" />
                  <span>Verified by {APP_CONFIG.organization}</span>
                </div>
              </CardContent>
            )}

            {!searchResult.found && (
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    Please check the Certificate ID and try again. If you believe this is an error,
                    contact our support team.
                  </p>
                  <Button variant="outline" onClick={() => setCertificateId('')}>
                    Try Again
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Info Section */}
        <div className="mt-12 text-center">
          <h2 className="font-semibold mb-4">How to Find Your Certificate ID</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <Card>
              <CardContent className="p-4">
                <QrCode className="size-8 text-primary mx-auto mb-2" />
                <p className="font-medium">Scan QR Code</p>
                <p className="text-muted-foreground text-xs">
                  Scan the QR code on your certificate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Search className="size-8 text-primary mx-auto mb-2" />
                <p className="font-medium">Manual Entry</p>
                <p className="text-muted-foreground text-xs">
                  Enter the ID from the bottom of certificate
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
