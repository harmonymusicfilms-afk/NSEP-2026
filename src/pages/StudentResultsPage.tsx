import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Download,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CertificateDownloader } from '@/components/features';
import { useAuthStore, useExamStore, useScholarshipStore, useCertificateStore, useStudentStore } from '@/stores';
import { formatTime, getOrdinal, calculatePercentage } from '@/lib/utils';
import { EXAM_CONFIG } from '@/constants/config';

export function StudentResultsPage() {
  const navigate = useNavigate();
  const { currentStudent, isStudentLoggedIn } = useAuthStore();
  const { results, loadExamData, config, isLoading: examsLoading } = useExamStore();
  const { scholarships, loadScholarships, isLoading: scholarshipsLoading } = useScholarshipStore();
  const { certificates, loadCertificates, isLoading: certsLoading } = useCertificateStore();
  const { loadStudents, isLoading: studentsLoading } = useStudentStore();

  useEffect(() => {
    if (!isStudentLoggedIn || !currentStudent) {
      if (!isStudentLoggedIn) navigate('/login');
      return;
    }
    loadExamData();
    loadScholarships();
    loadCertificates();
    loadStudents();
  }, [isStudentLoggedIn, currentStudent, navigate, loadExamData, loadScholarships, loadCertificates, loadStudents]);

  const isLoading = examsLoading || scholarshipsLoading || certsLoading || studentsLoading;

  if (isLoading || !currentStudent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const studentResult = results.find((r) => r.studentId === currentStudent.id);
  const studentScholarship = scholarships.find((s) => s.studentId === currentStudent.id);
  const studentCertificate = certificates.find((c) => c.studentId === currentStudent.id);

  if (!studentResult) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <FileText className="size-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold mb-2">No Results Yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't completed the examination yet. Complete the exam to view your results.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="institutional-gradient">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalQuestions = config.demoQuestionCount;
  const accuracy = calculatePercentage(studentResult.correctCount, totalQuestions);
  const avgTimePerQuestion = Math.round(studentResult.totalTimeTaken / totalQuestions);

  // Get class rank statistics
  const classResults = results.filter((r) => r.class === currentStudent.class && r.resultStatus === 'PUBLISHED');
  const totalStudentsInClass = classResults.length;
  const topScore = Math.max(...classResults.map((r) => r.totalScore));
  const avgScore = classResults.length > 0
    ? Math.round(classResults.reduce((sum, r) => sum + r.totalScore, 0) / classResults.length)
    : 0;

  const isTopRank = studentResult.rank && studentResult.rank <= 3;
  const isEligibleForScholarship = studentResult.rank && studentResult.rank <= 10;

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Examination Results</h1>
            <p className="text-muted-foreground">Class {currentStudent.class} • {currentStudent.name}</p>
          </div>
          {studentCertificate && studentResult.resultStatus === 'PUBLISHED' && (
            <CertificateDownloader
              student={currentStudent}
              result={studentResult}
              certificate={studentCertificate}
              scholarship={studentScholarship}
              totalStudents={totalStudentsInClass}
              className="success-gradient"
            />
          )}
        </div>

        {/* Result Status Banner */}
        {studentResult.resultStatus === 'PENDING' ? (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="size-5 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900">Results Under Review</p>
                <p className="text-sm text-yellow-700">
                  Your results are being processed. Final rank and certificate will be available once published.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : isEligibleForScholarship && studentScholarship?.approvalStatus === 'APPROVED' ? (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 flex items-center gap-3">
              <Award className="size-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">🎉 Scholarship Awarded!</p>
                <p className="text-sm text-green-700">
                  Congratulations! You've been awarded a {studentScholarship.scholarshipType.toLowerCase()} scholarship for your outstanding performance.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Score Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={isTopRank ? 'ring-2 ring-yellow-400' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-full flex items-center justify-center ${studentResult.rank === 1 ? 'gold-gradient' :
                    studentResult.rank === 2 ? 'silver-gradient' :
                      studentResult.rank === 3 ? 'bronze-gradient' : 'bg-primary/10'
                  }`}>
                  <Trophy className={`size-6 ${studentResult.rank && studentResult.rank <= 3 ? 'text-white' : 'text-primary'}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                  <p className="text-3xl font-bold">
                    {studentResult.rank ? getOrdinal(studentResult.rank) : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">out of {totalStudentsInClass}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="size-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Score</p>
                  <p className="text-3xl font-bold text-primary">{studentResult.totalScore}</p>
                  <p className="text-xs text-muted-foreground">Top: {topScore} • Avg: {avgScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="size-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
                  <p className="text-xs text-muted-foreground">
                    {studentResult.correctCount}/{totalQuestions} correct
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Clock className="size-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="text-3xl font-bold text-purple-600">{formatTime(studentResult.totalTimeTaken)}</p>
                  <p className="text-xs text-muted-foreground">{avgTimePerQuestion}s avg/question</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Answer Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                Answer Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    Correct Answers
                  </span>
                  <span className="font-semibold text-green-600">{studentResult.correctCount}</span>
                </div>
                <Progress value={calculatePercentage(studentResult.correctCount, totalQuestions)} className="h-2 bg-green-100" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <XCircle className="size-4 text-red-600" />
                    Wrong Answers
                  </span>
                  <span className="font-semibold text-red-600">{studentResult.wrongCount}</span>
                </div>
                <Progress value={calculatePercentage(studentResult.wrongCount, totalQuestions)} className="h-2 bg-red-100" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Clock className="size-4 text-gray-600" />
                    Unanswered
                  </span>
                  <span className="font-semibold text-gray-600">{studentResult.unansweredCount}</span>
                </div>
                <Progress value={calculatePercentage(studentResult.unansweredCount, totalQuestions)} className="h-2 bg-gray-100" />
              </div>
            </CardContent>
          </Card>

          {/* Performance Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Questions</p>
                    <p className="text-2xl font-bold">{totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Attempted</p>
                    <p className="text-2xl font-bold">{totalQuestions - studentResult.unansweredCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Marks Per Correct</p>
                    <p className="text-2xl font-bold text-green-600">+{config.marksPerCorrect}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Marks Per Wrong</p>
                    <p className="text-2xl font-bold text-red-600">{config.marksPerWrong}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Speed</span>
                  <span className="font-medium">
                    {avgTimePerQuestion < EXAM_CONFIG.defaultTimePerQuestion ? 'Fast' : 'Moderate'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Accuracy Rate</span>
                  <span className="font-medium">{accuracy}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Class Position</span>
                  <span className="font-medium">
                    {studentResult.rank ? `${getOrdinal(studentResult.rank)} / ${totalStudentsInClass}` : 'Pending'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scholarship Status */}
        {isEligibleForScholarship && studentScholarship && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="size-5" />
                Scholarship Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`size-16 rounded-full flex items-center justify-center ${studentScholarship.approvalStatus === 'APPROVED' ? 'bg-green-100' :
                      studentScholarship.approvalStatus === 'PENDING' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                    <Award className={`size-8 ${studentScholarship.approvalStatus === 'APPROVED' ? 'text-green-600' :
                        studentScholarship.approvalStatus === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">
                      {studentScholarship.approvalStatus === 'APPROVED' ? '✅ Scholarship Approved' :
                        studentScholarship.approvalStatus === 'PENDING' ? '⏳ Under Review' : '❌ Not Approved'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Rank {studentScholarship.rank} • Class {studentScholarship.class}
                    </p>
                    {studentScholarship.amount && (
                      <p className="text-sm font-medium text-primary mt-1">
                        Amount: ₹{studentScholarship.amount.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
                {studentScholarship.approvalStatus === 'APPROVED' && (
                  <Button className="success-gradient">View Details</Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
