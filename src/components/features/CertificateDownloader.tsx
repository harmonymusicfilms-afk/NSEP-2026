import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateCertificateByTemplate } from '@/lib/certificateTemplates';
import { Student, ExamResult, Certificate, Scholarship } from '@/types';
import { useCertificateStore } from '@/stores';

interface CertificateDownloaderProps {
  student: Student;
  result: ExamResult;
  certificate: Certificate;
  scholarship?: Scholarship;
  totalStudents: number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
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
}: CertificateDownloaderProps) {
  const { toast } = useToast();
  const { settings } = useCertificateStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      // Get the default template configuration
      const defaultTemplate = settings.defaultTemplate;
      const templateKey = defaultTemplate.toLowerCase() as 'classic' | 'modern' | 'prestigious';
      const templateConfig = settings.templates[templateKey];

      const pdf = await generateCertificateByTemplate(
        defaultTemplate,
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
        description: `Your ${defaultTemplate.toLowerCase()} style certificate has been downloaded successfully.`,
      });
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

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      variant={variant}
      size={size}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="size-4" />
          Download Certificate
        </>
      )}
    </Button>
  );
}
