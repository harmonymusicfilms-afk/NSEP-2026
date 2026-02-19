import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore, useExamStore, useCertificateStore } from '@/stores';

export function CreateMockResultPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { currentStudent, isStudentLoggedIn } = useAuthStore();
    const { results, loadExamData } = useExamStore();
    const { certificates, generateCertificate, loadCertificates } = useCertificateStore();
    const [isCreating, setIsCreating] = useState(false);
    const [created, setCreated] = useState(false);

    useEffect(() => {
        if (!isStudentLoggedIn || !currentStudent) {
            navigate('/login');
            return;
        }
        loadExamData();
        loadCertificates();
    }, [isStudentLoggedIn, currentStudent, navigate, loadExamData, loadCertificates]);

    const createMockResult = async () => {
        if (!currentStudent) return;

        setIsCreating(true);
        try {
            const { v4: uuidv4 } = await import('uuid');
            const { generateCertificateId } = await import('@/lib/utils');

            // Create mock exam result
            const resultId = uuidv4();
            const mockResult = {
                id: resultId,
                studentId: currentStudent.id,
                class: currentStudent.class,
                totalScore: 32, // 8 correct * 4 marks
                correctCount: 8,
                wrongCount: 2,
                unansweredCount: 0,
                totalTimeTaken: 45,
                resultStatus: 'PUBLISHED',
                rank: 5,
                createdAt: new Date().toISOString(),
            };

            // Save to localStorage
            const existingResults = JSON.parse(localStorage.getItem('exam_results') || '[]');
            existingResults.push(mockResult);
            localStorage.setItem('exam_results', JSON.stringify(existingResults));

            console.log('Mock result created:', mockResult);

            // Create certificate
            const certificateId = generateCertificateId();
            const certificate = {
                id: uuidv4(),
                certificateId: certificateId,
                studentId: currentStudent.id,
                examResultId: resultId,
                certificateType: 'PARTICIPATION',
                issuedAt: new Date().toISOString(),
                isValid: true,
            };

            // Save certificate to localStorage
            const existingCertificates = JSON.parse(localStorage.getItem('certificates') || '[]');
            existingCertificates.push(certificate);
            localStorage.setItem('certificates', JSON.stringify(existingCertificates));

            console.log('Certificate created:', certificate);

            toast({
                title: 'Success! 🎉',
                description: 'Mock result and certificate created successfully!',
            });
            setCreated(true);

            // Reload data
            await loadExamData();
            await loadCertificates();
        } catch (error: any) {
            console.error('Error creating mock result:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to create mock result',
            });
        } finally {
            setIsCreating(false);
        }
    };

    if (!currentStudent) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    // Check if student has class field (required for mock result)
    if (!currentStudent.class) {
        return (
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardContent className="py-12 text-center">
                            <Trophy className="size-12 text-yellow-600 mx-auto mb-4" />
                            <h3 className="font-semibold text-lg mb-2">Student Data Incomplete</h3>
                            <p className="text-muted-foreground mb-6">
                                Student class information is missing. Please logout and login again.
                            </p>
                            <Button onClick={() => navigate('/dashboard')} variant="outline">
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const hasResult = results.some((r) => r.studentId === currentStudent.id);
    const hasCertificate = certificates.some((c) => c.studentId === currentStudent.id);

    return (
        <div className="p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
                        <Trophy className="size-6 text-primary" />
                        Create Mock Result & Certificate
                    </h1>
                    <p className="text-muted-foreground">
                        Generate a test result and certificate for demo purposes
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Student Information</CardTitle>
                        <CardDescription>Current logged-in student details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Name:</span>
                                <p className="font-medium">{currentStudent.name}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Class:</span>
                                <p className="font-medium">Class {currentStudent.class}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Email:</span>
                                <p className="font-medium">{currentStudent.email}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Center Code:</span>
                                <p className="font-medium">{currentStudent.centerCode}</p>
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Has Exam Result:</span>
                                <span className={`text-sm font-medium ${hasResult ? 'text-green-600' : 'text-red-600'}`}>
                                    {hasResult ? '✓ Yes' : '✗ No'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Has Certificate:</span>
                                <span className={`text-sm font-medium ${hasCertificate ? 'text-green-600' : 'text-red-600'}`}>
                                    {hasCertificate ? '✓ Yes' : '✗ No'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle>Mock Data Details</CardTitle>
                        <CardDescription>The following mock data will be created</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Score:</span>
                            <span className="font-medium">32 marks</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Correct Answers:</span>
                            <span className="font-medium text-green-600">8</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Wrong Answers:</span>
                            <span className="font-medium text-red-600">2</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Rank:</span>
                            <span className="font-medium">5th</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Certificate Type:</span>
                            <span className="font-medium">Participation</span>
                        </div>
                    </CardContent>
                </Card>

                {created ? (
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="py-6 text-center">
                            <CheckCircle className="size-12 text-green-600 mx-auto mb-4" />
                            <h3 className="font-semibold text-lg mb-2">Successfully Created!</h3>
                            <p className="text-muted-foreground mb-6">
                                Mock result and certificate have been generated
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button onClick={() => navigate('/dashboard/results')} variant="outline">
                                    View Results
                                </Button>
                                <Button onClick={() => navigate('/dashboard/certificates')} className="institutional-gradient">
                                    View Certificate
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex gap-3">
                        <Button
                            onClick={createMockResult}
                            disabled={isCreating || hasResult}
                            className="flex-1 institutional-gradient"
                            size="lg"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="size-5 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Trophy className="size-5 mr-2" />
                                    Create Mock Result & Certificate
                                </>
                            )}
                        </Button>
                        <Button onClick={() => navigate('/dashboard')} variant="outline" size="lg">
                            Cancel
                        </Button>
                    </div>
                )}

                {hasResult && !created && (
                    <p className="text-sm text-center text-muted-foreground">
                        Note: This student already has a result. Delete it first to create a new mock result.
                    </p>
                )}
            </div>
        </div>
    );
}
