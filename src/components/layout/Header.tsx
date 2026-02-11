import { Link, useLocation } from 'react-router-dom';
import { 
  GraduationCap, 
  Menu, 
  X, 
  User, 
  LogOut,
  Shield,
  FileCheck
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores';
import { APP_CONFIG } from '@/constants/config';
import { LanguageToggle } from '@/components/features/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';

import logoImg from '@/assets/gphdm-logo.png';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isStudentLoggedIn, currentStudent, logoutStudent, isAdminLoggedIn } = useAuthStore();
  const { t } = useLanguage();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/gallery', label: t('nav.gallery') },
    { href: '/contact', label: t('nav.contact') },
    { href: '/verify', label: t('nav.verify') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImg} alt="GPHDM Logo" className="h-12 w-auto" />
            <div className="hidden sm:block">
              <h1 className="font-serif text-lg font-bold text-primary leading-tight">
                {APP_CONFIG.shortName}
              </h1>
              <p className="text-xs text-muted-foreground leading-tight">
                {APP_CONFIG.year}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <LanguageToggle />
            </div>
            {isStudentLoggedIn && currentStudent ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="size-4" />
                    <span className="max-w-32 truncate">{currentStudent.name}</span>
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logoutStudent}>
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : !isAdminRoute ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="institutional-gradient">
                    {t('nav.register')}
                  </Button>
                </Link>
              </div>
            ) : null}

            {!isAdminLoggedIn && !isAdminRoute && (
              <Link to="/admin/login" className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-2">
                  <Shield className="size-4" />
                  {t('nav.admin')}
                </Button>
              </Link>
            )}

            <Link to="/verify" className="md:hidden">
              <Button variant="ghost" size="icon">
                <FileCheck className="size-5" />
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="px-3 pb-3 border-b border-border mb-3">
              <LanguageToggle />
            </div>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {isStudentLoggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logoutStudent();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
                  >
                    Student Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Register Now
                  </Link>
                </>
              )}
              
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted flex items-center gap-2"
              >
                <Shield className="size-4" />
                Admin Portal
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
