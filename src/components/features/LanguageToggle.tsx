import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
      className="gap-2"
    >
      <Languages className="size-4" />
      <span className="font-medium">
        {language === 'en' ? 'हिंदी' : 'English'}
      </span>
    </Button>
  );
}
