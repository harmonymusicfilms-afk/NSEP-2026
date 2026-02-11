import { CertificateTemplate, CertificateTemplateConfig } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface CertificateTemplatePreviewProps {
  template: CertificateTemplate;
  config: CertificateTemplateConfig;
  selected: boolean;
  onSelect: () => void;
}

export function CertificateTemplatePreview({
  template,
  config,
  selected,
  onSelect,
}: CertificateTemplatePreviewProps) {
  const templateInfo = {
    CLASSIC: {
      name: 'Classic',
      description: 'Traditional formal design with double borders and institutional seal',
      preview: 'Traditional • Government Style • Formal',
    },
    MODERN: {
      name: 'Modern',
      description: 'Clean contemporary layout with gradient header and stat cards',
      preview: 'Minimalist • Contemporary • Professional',
    },
    PRESTIGIOUS: {
      name: 'Prestigious',
      description: 'Elegant ornate design with decorative elements and gold accents',
      preview: 'Premium • Ornate • Distinguished',
    },
  };

  const info = templateInfo[template];

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        selected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        {/* Template Preview Visual */}
        <div className="relative mb-3 h-32 rounded-lg border-2 overflow-hidden bg-white">
          {template === 'CLASSIC' && (
            <div className="absolute inset-0 p-2">
              <div
                className="absolute inset-2 border-2 rounded"
                style={{ borderColor: config.primaryColor }}
              />
              <div
                className="absolute inset-3 border"
                style={{ borderColor: config.accentColor }}
              />
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {config.sealText}
                </div>
              </div>
              <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center">
                <div className="text-xs font-bold" style={{ color: config.primaryColor }}>
                  CERTIFICATE
                </div>
                <div className="text-[8px] text-gray-500 mt-1">{config.institutionName}</div>
              </div>
            </div>
          )}

          {template === 'MODERN' && (
            <div className="absolute inset-0">
              <div className="h-10" style={{ backgroundColor: config.primaryColor }}>
                <div className="pt-1.5 text-center">
                  <div className="text-white text-xs font-bold">CERTIFICATE</div>
                  <div className="text-white text-[8px] opacity-90">{config.institutionName}</div>
                </div>
              </div>
              <div className="h-1" style={{ backgroundColor: config.accentColor }} />
              <div className="p-4 text-center">
                <div className="text-[10px] text-gray-500 mb-1">This certifies</div>
                <div className="text-xs font-bold" style={{ color: config.primaryColor }}>
                  Student Name
                </div>
                <div className="flex gap-1 justify-center mt-3">
                  <div
                    className="w-12 h-10 rounded border flex flex-col items-center justify-center"
                    style={{ borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}15` }}
                  >
                    <div className="text-xs font-bold" style={{ color: config.primaryColor }}>1st</div>
                    <div className="text-[7px] text-gray-500">Rank</div>
                  </div>
                  <div
                    className="w-12 h-10 rounded border flex flex-col items-center justify-center"
                    style={{ borderColor: config.accentColor, backgroundColor: `${config.accentColor}15` }}
                  >
                    <div className="text-xs font-bold" style={{ color: config.accentColor }}>100</div>
                    <div className="text-[7px] text-gray-500">Score</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {template === 'PRESTIGIOUS' && (
            <div className="absolute inset-0 p-1">
              <div
                className="absolute inset-1 border-2"
                style={{ borderColor: config.accentColor }}
              />
              <div
                className="absolute inset-2 border"
                style={{ borderColor: config.primaryColor }}
              />
              <div className="absolute top-3 left-1/2 -translate-x-1/2">
                <div className="relative w-10 h-10 rounded-full flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: config.primaryColor }}
                  />
                  <div
                    className="absolute inset-1 rounded-full"
                    style={{ backgroundColor: config.accentColor }}
                  />
                  <div className="absolute inset-2 rounded-full bg-white" />
                  <span className="relative text-[8px] font-bold" style={{ color: config.primaryColor }}>
                    {config.sealText}
                  </span>
                </div>
              </div>
              <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full text-center px-2">
                <div
                  className="text-[10px] font-bold"
                  style={{ color: config.primaryColor }}
                >
                  Certificate of Excellence
                </div>
                <div className="text-[7px] italic mt-0.5" style={{ color: config.accentColor }}>
                  {config.institutionName}
                </div>
                <div className="mt-2 text-[8px] text-gray-700">Student Name</div>
                <div
                  className="w-16 h-0.5 mx-auto mt-0.5"
                  style={{ backgroundColor: config.accentColor }}
                />
              </div>
            </div>
          )}

          {/* Selected indicator */}
          {selected && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Check className="size-4 text-white" />
            </div>
          )}
        </div>

        {/* Template info */}
        <div>
          <h3 className="font-semibold text-sm mb-1">{info.name}</h3>
          <p className="text-xs text-muted-foreground mb-2">{info.description}</p>
          <div className="flex gap-1 flex-wrap">
            {info.preview.split(' • ').map((tag, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
