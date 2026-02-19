import { useState } from 'react';
import { Download, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { generateCertificateByTemplate } from '@/lib/certificateTemplates';
import { Student, ExamResult, Certificate, Scholarship, CertificateTemplate } from '@/types';
import { useCertificateStore } from '@/stores';
import { CertificateTemplatePreview } from './CertificateTemplatePreview';

interface CertificateDownloaderProps {
  student: Student;
  result: ExamResult;
  certificate: Certificate;
  scholarship?: Scholarship;
  totalStudents: number;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showPreview?: boolean;
  label?: string;
}

export function CertificateDownloader({
  student,
  result,
  certificate,
  scholarship,
  totalStudents,
  variant = 'default',
  size = 'default',
  className,
  showPreview = true,
  label = 'Download Certificate',
}: CertificateDownloaderProps) {
  const { toast } = useToast();
  const { settings } = useCertificateStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate>(
    settings.defaultTemplate || 'CLASSIC'
  );

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      // Get the template configuration
      const templateKey = selectedTemplate.toLowerCase() as keyof typeof settings.templates;
      const templateConfig = settings.templates[templateKey];

      const pdf = await generateCertificateByTemplate(
        selectedTemplate,
        {
          student,
          result,
          certificate,
          scholarship,
          totalStudents,
        },
        templateConfig
      );

      const fileName = `NSEP_Certificate_${student.name.replace(/\s+/g, '_')}_${certificate.certificateId}.pdf`;
      pdf.save(fileName);

      toast({
        title: 'Certificate Downloaded',
        description: `Your ${selectedTemplate.toLowerCase()} style certificate has been downloaded successfully.`,
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Certificate generation error:', error);
      toast({
        title: 'Download Failed',
        description: 'Unable to generate certificate. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const templates: CertificateTemplate[] = ['CLASSIC', 'MODERN', 'PRESTIGIOUS', 'GPHDM'];

  const triggerButton = (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={isGenerating}
      onClick={() => !showPreview && handleDownload()}
    >
      {isGenerating && !showPreview ? (
        <>
          <Loader2 className="size-4 animate-spin mr-2" />
          Generating...
        </>
      ) : (
        <>
          <Download className="size-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  );

  if (!showPreview) {
    return triggerButton;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Download className="size-4 mr-2" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Download Certificate</DialogTitle>
          <DialogDescription>
            Choose a template design for your certificate. All designs are valid for official use.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
          {templates.map((template) => (
            <CertificateTemplatePreview
              key={template}
              template={template}
              config={settings.templates[template.toLowerCase() as keyof typeof settings.templates]}
              selected={selectedTemplate === template}
              onSelect={() => setSelectedTemplate(template)}
            />
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="institutional-gradient"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="size-4 mr-2" />
                Download Selected ({selectedTemplate})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
