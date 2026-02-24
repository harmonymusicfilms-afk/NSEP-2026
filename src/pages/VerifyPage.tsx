import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Award, User, Calendar, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCertificateStore, useExamStore } from '@/stores';
import { APP_CONFIG } from '@/constants/config';
import { formatDate, getOrdinal } from '@/lib/utils';
import { motion } from 'framer-motion';

export function VerifyPage() {
  const { certificateId: urlCertificateId } = useParams();
  const [certificateId, setCertificateId] = useState(urlCertificateId || '');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    certificate?: ReturnType<typeof useCertificateStore.getState>['certificates'][0];
    student?: { name: string; fatherName: string; class: number; centerCode?: string };
    examResult?: { totalScore: number; rank: number };
  } | null>(null);

  const { verifyCertificate, loadCertificates } = useCertificateStore();
  const { loadExamData } = useExamStore();

  useEffect(() => {
    if (urlCertificateId) {
      handleSearch(urlCertificateId);
    }
  }, [urlCertificateId]);

  const handleSearch = async (term: string = certificateId) => {
    if (!term.trim()) return;

    setIsSearching(true);
    await Promise.all([loadCertificates(), loadExamData()]);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const searchTerm = term.trim().toUpperCase();
    let result = await verifyCertificate(searchTerm);

    if (!result.isValid) {
      const certStore = useCertificateStore.getState();
      const certificate = certStore.getCertificateByStudent(searchTerm);
      if (certificate) {
        result = await verifyCertificate(certificate.certificateId);
      }
    }

    if (result.isValid && result.certificate && result.student) {
      const examResult = useExamStore.getState().results.find((r) => r.id === result.certificate?.examResultId);
      setSearchResult({
        found: true,
        certificate: result.certificate,
        student: {
          name: result.student.name,
          fatherName: result.student.fatherName,
          class: result.student.class,
          centerCode: result.student.centerCode,
        },
        examResult: examResult ? { totalScore: examResult.totalScore, rank: examResult.rank || 0 } : undefined,
      });
    } else {
      setSearchResult({ found: false });
    }

    setIsSearching(false);
  };

  return (
    <div className="min-h-screen py-20 lg:py-32">
      <div className="max-w-3xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center size-24 rounded-[2rem] bg-primary/10 border border-primary/20 mb-8 shadow-[0_0_30px_rgba(255,165,0,0.2)]">
            <QrCode className="size-12 text-primary animate-pulse" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tighter">
            Verify <span className="premium-text-gradient">Certificate</span>
          </h1>
          <p className="text-xl text-white/50 max-w-xl mx-auto font-medium italic">
            Enter the Certificate ID or Student ID to verify authenticity.
          </p>
        </div>

        {/* Search Form */}
        <div className="glass-card-heavy rounded-[3rem] p-8 lg:p-12 border border-white/10 shadow-2xl mb-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <Label htmlFor="certificateId" className="text-white/80 font-black ml-1 uppercase tracking-widest text-xs">Certificate ID or Student ID</Label>
              <div className="flex gap-4">
                <Input
                  id="certificateId"
                  value={certificateId}
                  onChange={(e) => {
                    setCertificateId(e.target.value.toUpperCase());
                    setSearchResult(null);
                  }}
                  placeholder="EX: STITCH-CERT-000001"
                  className="h-16 bg-white/5 border-white/10 rounded-2xl text-white text-xl font-mono uppercase focus:border-primary/50 transition-all placeholder:text-white/10"
                />
                <Button
                  size="icon"
                  onClick={() => handleSearch()}
                  disabled={isSearching || !certificateId.trim()}
                  className="size-16 rounded-2xl bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,165,0,0.3)] shrink-0"
                >
                  {isSearching ? (
                    <div className="size-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Search className="size-8 text-white" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-white/30 italic font-bold">
                Verification ensures the legitimacy of the issued scholarship award.
              </p>
            </div>
          </div>
        </div>

        {/* Search Result */}
        {searchResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={`glass-card-heavy rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative`}>
              {searchResult.found ? (
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] -z-10" />
              ) : (
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -z-10" />
              )}

              <div className="p-10 lg:p-12">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
                  {searchResult.found ? (
                    <div className="size-24 rounded-3xl bg-green-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                      <CheckCircle className="size-12 text-green-500" />
                    </div>
                  ) : (
                    <div className="size-24 rounded-3xl bg-red-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.3)]">
                      <XCircle className="size-12 text-red-500" />
                    </div>
                  )}
                  <div className="text-center md:text-left">
                    <h2 className={`text-4xl font-black mb-3 ${searchResult.found ? 'text-green-500' : 'text-red-500'}`}>
                      {searchResult.found ? 'Authentication Success' : 'Authentication Failed'}
                    </h2>
                    <p className="text-xl text-white/50 font-bold italic">
                      {searchResult.found
                        ? 'This digital record is authentic and verified by NSEP.'
                        : 'No matching record was found in our database.'}
                    </p>
                  </div>
                </div>

                {searchResult.found && searchResult.certificate && searchResult.student && (
                  <div className="space-y-8">
                    {/* Details Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Certificate Info */}
                      <div className="glass-card rounded-[2rem] p-8 border-white/5">
                        <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                          <Award className="size-4" />
                          Certificate Record
                        </h3>
                        <div className="space-y-4">
                          {[
                            { label: 'ID', value: searchResult.certificate.certificateId, mono: true },
                            { label: 'Tier', value: searchResult.certificate.certificateType.toLowerCase(), capitalize: true },
                            { label: 'Issue Date', value: formatDate(searchResult.certificate.issuedAt) }
                          ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3">
                              <span className="text-white/40 font-bold uppercase text-[10px] tracking-widest">{item.label}</span>
                              <span className={`text-white font-bold ${item.mono ? 'font-mono text-primary' : ''} ${item.capitalize ? 'capitalize' : ''}`}>
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Student Info */}
                      <div className="glass-card rounded-[2rem] p-8 border-white/5">
                        <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                          <User className="size-4" />
                          Recipient Details
                        </h3>
                        <div className="space-y-4">
                          {[
                            { label: 'FullName', value: searchResult.student.name },
                            { label: 'Guardian', value: searchResult.student.fatherName },
                            { label: 'Academic', value: `Class ${searchResult.student.class}` },
                            { label: 'Institution', value: searchResult.student.centerCode || 'Independent', mono: true }
                          ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3">
                              <span className="text-white/40 font-bold uppercase text-[10px] tracking-widest">{item.label}</span>
                              <span className={`text-white font-bold ${item.mono ? 'font-mono text-primary' : ''}`}>
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    {searchResult.examResult && (
                      <div className="glass-card rounded-[2.5rem] p-10 border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                          <Calendar className="size-4" />
                          Performance Metrics
                        </h3>
                        <div className="grid grid-cols-2 gap-8">
                          <div className="text-center p-8 bg-white/5 rounded-[2rem] border border-white/5">
                            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black mb-2">Aggregate Score</p>
                            <p className="text-5xl font-black text-white premium-text-glow">{searchResult.examResult.totalScore}</p>
                          </div>
                          <div className="text-center p-8 bg-white/5 rounded-[2rem] border border-white/5">
                            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black mb-2">Merit Standing</p>
                            <p className="text-5xl font-black text-primary premium-text-glow">
                              {searchResult.examResult.rank ? getOrdinal(searchResult.examResult.rank) : '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Official Stamp */}
                    <div className="flex flex-col items-center justify-center gap-4 py-8 border-t border-white/5">
                      <div className="flex items-center gap-3 px-6 py-3 bg-green-500/10 rounded-full border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                        <CheckCircle className="size-5 text-green-500" />
                        <span className="text-sm font-black text-green-500 uppercase tracking-widest leading-none">
                          Verified Authenticity • NSEP Digital Trust
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {!searchResult.found && (
                  <div className="text-center py-8">
                    <p className="text-xl text-white/40 font-bold italic mb-10 max-w-md mx-auto">
                      Please verify the ID provided on the certificate. Errors may occur due to incorrect entry or expired records.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setCertificateId('')}
                      className="h-16 px-12 rounded-full border-white/10 text-white font-black hover:bg-white/5 transition-all text-lg"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Info Section */}
        <div className="mt-24">
          <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.5em] text-center mb-10">Where to find your credentials</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="glass-card rounded-[2.5rem] p-10 border-white/5 text-center group hover:border-primary/30 transition-all">
              <QrCode className="size-16 text-primary mx-auto mb-8 group-hover:scale-110 transition-transform" />
              <p className="text-2xl font-black text-white mb-2">Visual Scan</p>
              <p className="text-white/40 font-bold italic">
                Focus your camera on the QR code located in the center of your physical certificate.
              </p>
            </div>
            <div className="glass-card rounded-[2.5rem] p-10 border-white/5 text-center group hover:border-primary/30 transition-all">
              <Search className="size-16 text-primary mx-auto mb-8 group-hover:scale-110 transition-transform" />
              <p className="text-2xl font-black text-white mb-2">Manual Audit</p>
              <p className="text-white/40 font-bold italic">
                Input the unique alphanumeric sequence printed on the lower margin of the certificate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
