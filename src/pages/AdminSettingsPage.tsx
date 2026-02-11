import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Clock,
  DollarSign,
  Award,
  Save,
  AlertCircle,
  FileText,
  Eye,
  Palette,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CertificateTemplatePreview } from '@/components/features';
import { useToast } from '@/hooks/use-toast';
import {
  useAuthStore,
  useExamStore,
  useAdminLogStore,
  useCertificateStore,
  useStudentStore,
  useScholarshipStore,
} from '@/stores';
import { formatCurrency } from '@/lib/utils';
import { CertificateTemplate } from '@/types';
import { generateCertificateByTemplate } from '@/lib/certificateTemplates';

export function AdminSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentAdmin, isAdminLoggedIn } = useAuthStore();
  const { config, updateConfig, loadExamData } = useExamStore();
  const { settings, updateTemplateConfig, setDefaultTemplate, loadSettings } = useCertificateStore();
  const { students, loadStudents } = useStudentStore();
  const { scholarships, loadScholarships } = useScholarshipStore();
  const { addLog } = useAdminLogStore();

  const [timePerQuestion, setTimePerQuestion] = useState<5 | 7>(config.timePerQuestion);
  const [demoQuestionCount, setDemoQuestionCount] = useState(config.demoQuestionCount);
  const [fees, setFees] = useState(config.fees);
  const [marksPerCorrect, setMarksPerCorrect] = useState(config.marksPerCorrect);
  const [marksPerWrong, setMarksPerWrong] = useState(config.marksPerWrong);
  
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate>(settings.defaultTemplate);
  const [templateColors, setTemplateColors] = useState({
    classic: {
      primary: settings.templates.classic.primaryColor,
      accent: settings.templates.classic.accentColor,
    },
    modern: {
      primary: settings.templates.modern.primaryColor,
      accent: settings.templates.modern.accentColor,
    },
    prestigious: {
      primary: settings.templates.prestigious.primaryColor,
      accent: settings.templates.prestigious.accentColor,
    },
  });

  const [isPreviewingTemplate, setIsPreviewingTemplate] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn || !currentAdmin) {
      navigate('/admin/login');
      return;
    }
    loadExamData();
    loadSettings();
    loadStudents();
    loadScholarships();
  }, [isAdminLoggedIn, currentAdmin, navigate, loadExamData, loadSettings, loadStudents, loadScholarships]);

  const handleSaveExamSettings = () => {
    updateConfig({
      timePerQuestion,
      demoQuestionCount,
      marksPerCorrect,
      marksPerWrong,
    });

    if (currentAdmin) {
      addLog(
        currentAdmin.id,
        'UPDATE_EXAM_CONFIG',
        undefined,
        `Time: ${timePerQuestion}s, Questions: ${demoQuestionCount}, Marks: +${marksPerCorrect}/${marksPerWrong}`
      );
    }

    toast({
      title: 'Settings Updated',
      description: 'Exam configuration has been saved successfully.',
    });
  };

  const handleSaveFees = () => {
    updateConfig({ fees });

    if (currentAdmin) {
      addLog(
        currentAdmin.id,
        'UPDATE_FEES',
        undefined,
        `Class 1-5: ${fees['1-5']}, 6-8: ${fees['6-8']}, 9-12: ${fees['9-12']}`
      );
    }

    toast({
      title: 'Fees Updated',
      description: 'Examination fees have been saved successfully.',
    });
  };

  const handleSaveCertificateSettings = () => {
    // Update default template
    setDefaultTemplate(selectedTemplate);

    // Update colors for all templates
    Object.keys(templateColors).forEach((key) => {
      const template = key.toUpperCase() as CertificateTemplate;
      const colors = templateColors[key as keyof typeof templateColors];
      updateTemplateConfig(template, {
        primaryColor: colors.primary,
        accentColor: colors.accent,
      });
    });

    if (currentAdmin) {
      addLog(
        currentAdmin.id,
        'UPDATE_CERTIFICATE_SETTINGS',
        undefined,
        `Default template: ${selectedTemplate}, Colors updated`
      );
    }

    toast({
      title: 'Certificate Settings Saved',
      description: 'Certificate template configuration has been updated successfully.',
    });
  };

  const handlePreviewTemplate = async () => {
    setIsPreviewingTemplate(true);

    try {
      // Get a sample student, result, and scholarship for preview
      const sampleStudent = students[0] || {
        id: 'sample',
        name: 'John Doe',
        fatherName: 'Richard Doe',
        class: 10,
        email: 'john@example.com',
        mobile: '9876543210',
        schoolName: 'Sample High School',
      };

      const sampleScholarship = scholarships.find((s) => s.approvalStatus === 'APPROVED') || {
        id: 'sample',
        studentId: 'sample',
        class: 10,
        rank: 1,
        scholarshipType: 'BOTH' as const,
        amount: 10000,
        approvalStatus: 'APPROVED' as const,
        createdAt: new Date().toISOString(),
      };

      const sampleResult = {
        id: 'sample',
        studentId: 'sample',
        class: 10,
        totalScore: 240,
        correctCount: 58,
        wrongCount: 2,
        unansweredCount: 0,
        totalTimeTaken: 300,
        rank: 1,
        resultStatus: 'PUBLISHED' as const,
        createdAt: new Date().toISOString(),
      };

      const sampleCertificate = {
        id: 'sample',
        studentId: 'sample',
        examResultId: 'sample',
        certificateId: 'NSEP-2025-CERT-000001',
        certificateType: 'SCHOLARSHIP' as const,
        qrCode: 'https://nsep.edu.in/verify/NSEP-2025-CERT-000001',
        issuedAt: new Date().toISOString(),
        isValid: true,
      };

      const templateKey = selectedTemplate.toLowerCase() as 'classic' | 'modern' | 'prestigious';
      const templateConfig = {
        ...settings.templates[templateKey],
        primaryColor: templateColors[templateKey].primary,
        accentColor: templateColors[templateKey].accent,
      };

      const pdf = await generateCertificateByTemplate(
        selectedTemplate,
        {
          student: sampleStudent as any,
          result: sampleResult,
          certificate: sampleCertificate,
          scholarship: sampleScholarship as any,
          totalStudents: 150,
        },
        templateConfig
      );

      pdf.save(`Preview_${selectedTemplate}_Certificate.pdf`);

      toast({
        title: 'Preview Generated',
        description: `${selectedTemplate} template preview has been downloaded.`,
      });
    } catch (error) {
      console.error('Preview generation error:', error);
      toast({
        title: 'Preview Failed',
        description: 'Unable to generate preview. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPreviewingTemplate(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="size-6" />
          System Settings
        </h1>
        <p className="text-muted-foreground">Configure examination parameters, fees, and certificate templates</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Exam Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Exam Configuration
            </CardTitle>
            <CardDescription>Configure exam timing and marking scheme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timePerQuestion">Time Per Question</Label>
              <Select
                value={timePerQuestion.toString()}
                onValueChange={(val) => setTimePerQuestion(Number(val) as 5 | 7)}
              >
                <SelectTrigger id="timePerQuestion">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="7">7 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="demoQuestionCount">Demo Question Count</Label>
              <Input
                id="demoQuestionCount"
                type="number"
                min="10"
                max="60"
                value={demoQuestionCount}
                onChange={(e) => setDemoQuestionCount(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Number of questions in demo mode (10-60)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marksPerCorrect">Marks Per Correct</Label>
                <Input
                  id="marksPerCorrect"
                  type="number"
                  min="1"
                  max="10"
                  value={marksPerCorrect}
                  onChange={(e) => setMarksPerCorrect(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marksPerWrong">Marks Per Wrong</Label>
                <Input
                  id="marksPerWrong"
                  type="number"
                  min="-5"
                  max="0"
                  value={marksPerWrong}
                  onChange={(e) => setMarksPerWrong(Number(e.target.value))}
                />
              </div>
            </div>

            <Button onClick={handleSaveExamSettings} className="w-full institutional-gradient gap-2">
              <Save className="size-4" />
              Save Exam Settings
            </Button>
          </CardContent>
        </Card>

        {/* Fee Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="size-5" />
              Fee Structure
            </CardTitle>
            <CardDescription>Manage examination fees by class range</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fee1-5">Class 1-5 (Primary)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="fee1-5"
                  type="number"
                  min="0"
                  value={fees['1-5']}
                  onChange={(e) => setFees({ ...fees, '1-5': Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Current: {formatCurrency(fees['1-5'])}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee6-8">Class 6-8 (Middle)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="fee6-8"
                  type="number"
                  min="0"
                  value={fees['6-8']}
                  onChange={(e) => setFees({ ...fees, '6-8': Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Current: {formatCurrency(fees['6-8'])}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fee9-12">Class 9-12 (Senior)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="fee9-12"
                  type="number"
                  min="0"
                  value={fees['9-12']}
                  onChange={(e) => setFees({ ...fees, '9-12': Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Current: {formatCurrency(fees['9-12'])}
              </p>
            </div>

            <Button onClick={handleSaveFees} className="w-full institutional-gradient gap-2">
              <Save className="size-4" />
              Save Fee Structure
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Certificate Templates Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Certificate Templates
          </CardTitle>
          <CardDescription>
            Choose default template and customize colors for each design variant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div>
            <Label className="mb-3 block">Select Default Template</Label>
            <div className="grid sm:grid-cols-3 gap-4">
              <CertificateTemplatePreview
                template="CLASSIC"
                config={{
                  ...settings.templates.classic,
                  primaryColor: templateColors.classic.primary,
                  accentColor: templateColors.classic.accent,
                }}
                selected={selectedTemplate === 'CLASSIC'}
                onSelect={() => setSelectedTemplate('CLASSIC')}
              />
              <CertificateTemplatePreview
                template="MODERN"
                config={{
                  ...settings.templates.modern,
                  primaryColor: templateColors.modern.primary,
                  accentColor: templateColors.modern.accent,
                }}
                selected={selectedTemplate === 'MODERN'}
                onSelect={() => setSelectedTemplate('MODERN')}
              />
              <CertificateTemplatePreview
                template="PRESTIGIOUS"
                config={{
                  ...settings.templates.prestigious,
                  primaryColor: templateColors.prestigious.primary,
                  accentColor: templateColors.prestigious.accent,
                }}
                selected={selectedTemplate === 'PRESTIGIOUS'}
                onSelect={() => setSelectedTemplate('PRESTIGIOUS')}
              />
            </div>
          </div>

          {/* Color Customization */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="size-4" />
              <Label>Template Colors Customization</Label>
            </div>

            {/* Classic Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="classic-primary" className="text-sm">Classic - Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="classic-primary"
                    type="color"
                    value={templateColors.classic.primary}
                    onChange={(e) =>
                      setTemplateColors({
                        ...templateColors,
                        classic: { ...templateColors.classic, primary: e.target.value },
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={templateColors.classic.primary}
                    onChange={(e) =>
                      setTemplateColors({
                        ...templateColors,
                        classic: { ...templateColors.classic, primary: e.target.value },
                      })
                    }
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classic-accent" className="text-sm">Classic - Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="classic-accent"
                    type="color"
                    value={templateColors.classic.accent}
                    onChange={(e) =>
                      setTemplateColors({
                        ...templateColors,
                        classic: { ...templateColors.classic, accent: e.target.value },
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={templateColors.classic.accent}
                    onChange={(e) =>
                      setTemplateColors({
                        ...templateColors,
                        classic: { ...templateColors.classic, accent: e.target.value },
                      })
                    }
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Modern Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modern-primary" className="text-sm">Modern - Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="modern-primary"
                    type="color"
                    value={templateColors.modern.primary}
                    onChange={(e) =>
                      setTemplateColors({
                        ...templateColors,
                        modern: { ...templateColors.modern, primary: e.target.value },
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={templateColors.modern.primary}
                    onChange={(e) =>
                      setTemplateColors({
                        ...templateColors,
                        modern: { ...templateColors.modern, primary: e.target.value },
                      })
                    }
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modern-accent" className="text-sm">Modern - Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="modern-accent"
                    type="color"
                    value={templateColors.modern.accent}
                    onChange={(e) =>
                      setTemplateColors({
                        ...templateColors,
                        modern: { ...templateColors.modern, accent: e.target.value },
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={templateColors.modern.accent}
                    onChange={(e) =>
                      setTemplateColors({
                        ...templateColors,
                        modern: { ...templateColors.modern, accent: e.target.value },
                      })
                    }
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Prestigious Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prestigious-primary" className="text-sm">Prestigious - Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="prestigious-primary"
                    type="color"
                    value={templateColors.prestigious.primary}
                    onChange={(e) =>
                      setTemplateColors({
                        ...templateColors,
                        prestigious: { ...templateColors.prestigious, primary: e.target.value },
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={templateColors.prestigious.primary}
                    onChange={(e) =>
                      setTemplateColors({
                        ...templateColors,
                        prestigious: { ...templateColors.prestigious, primary: e.target.value },
                      })
                    }
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prestigious-accent" className="text-sm">Prestigious - Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="prestigious-accent"
                    type="color"
                    value={templateColors.prestigious.accent}
                    onChange={(e) =>
                      setTemplateColors({
                        ...templateColors,
                        prestigious: { ...templateColors.prestigious, accent: e.target.value },
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={templateColors.prestigious.accent}
                    onChange={(e) =>
                      setTemplateColors({
                        ...templateColors,
                        prestigious: { ...templateColors.prestigious, accent: e.target.value },
                      })
                    }
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handlePreviewTemplate}
              disabled={isPreviewingTemplate}
              variant="outline"
              className="flex-1 gap-2"
            >
              {isPreviewingTemplate ? (
                <>
                  <Eye className="size-4 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Eye className="size-4" />
                  Preview {selectedTemplate.charAt(0) + selectedTemplate.slice(1).toLowerCase()} Template
                </>
              )}
            </Button>

            <Button onClick={handleSaveCertificateSettings} className="flex-1 institutional-gradient gap-2">
              <Save className="size-4" />
              Save Certificate Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="size-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900">Important Notice</p>
            <p className="text-sm text-yellow-700 mt-1">
              Changes to exam configuration will only affect new exam sessions. Ongoing or completed
              exams will retain their original settings. Fee changes apply immediately to all new registrations.
              Certificate template changes will apply to all newly generated certificates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
