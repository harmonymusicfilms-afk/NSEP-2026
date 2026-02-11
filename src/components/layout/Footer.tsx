import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';
import { APP_CONFIG } from '@/constants/config';
import { useLanguage } from '@/contexts/LanguageContext';

import logoImg from '@/assets/gphdm-logo.png';

export function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-foreground text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logoImg} alt="GPHDM Logo" className="h-10 w-auto" />
              <div>
                <h3 className="font-serif text-lg font-bold">{APP_CONFIG.name}</h3>
                <p className="text-sm text-white/60">{APP_CONFIG.year}</p>
              </div>
            </div>
            <p className="text-white/70 text-sm max-w-md">
              Empowering students across India through merit-based scholarships. 
              Our mission is to recognize and reward academic excellence while 
              providing equal opportunities for all.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-white/70 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/70 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-white/70 hover:text-white transition-colors">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-white/70 hover:text-white transition-colors">
                  Register Now
                </Link>
              </li>
              <li>
                <Link to="/verify" className="text-white/70 hover:text-white transition-colors">
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-white/70 hover:text-white transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.contactUs')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="size-4 text-white/60 mt-0.5 shrink-0" />
                <a 
                  href={`mailto:${APP_CONFIG.supportEmail}`}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {APP_CONFIG.supportEmail}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="size-4 text-white/60 mt-0.5 shrink-0" />
                <a 
                  href={`tel:${APP_CONFIG.supportPhone}`}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {APP_CONFIG.supportPhone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="size-4 text-white/60 mt-0.5 shrink-0" />
                <span className="text-white/70">
                  {APP_CONFIG.organization}<br />
                  New Delhi, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/50">
              © {new Date().getFullYear()} {APP_CONFIG.organization}. {t('footer.rights')}.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/terms" className="text-white/50 hover:text-white transition-colors">
                {t('footer.terms')}
              </Link>
              <Link to="/privacy" className="text-white/50 hover:text-white transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/contact" className="text-white/50 hover:text-white transition-colors">
                {t('footer.contactUs')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
