import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Award,
  FileCheck,
  Wallet,
  History,
  LogOut,
  GraduationCap,
  ClipboardList,
  Gift,
  FileText,
  Share2,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores';
import { APP_CONFIG } from '@/constants/config';
import { cn } from '@/lib/utils';

import logoImg from '@/assets/gphdm-logo.png';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/scholarships', label: 'Scholarships', icon: Award },
  { href: '/admin/referrals', label: 'CenterCode', icon: Share2 },
  { href: '/admin/centers', label: 'Centers', icon: GraduationCap },
  { href: '/admin/certificates', label: 'Certificates', icon: FileText },
  { href: '/admin/emails', label: 'Emails', icon: Mail },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const studentNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/exam', label: 'Take Exam', icon: ClipboardList },
  { href: '/dashboard/results', label: 'Results', icon: Award },
  { href: '/dashboard/certificates', label: 'Certificates', icon: FileCheck },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
];

interface SidebarProps {
  variant: 'admin' | 'student';
}

export function Sidebar({ variant }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentAdmin, currentStudent, logoutAdmin, logoutStudent } = useAuthStore();

  const navItems = variant === 'admin' ? adminNavItems : studentNavItems;
  const user = variant === 'admin' ? currentAdmin : currentStudent;

  const handleLogout = () => {
    if (variant === 'admin') {
      logoutAdmin();
      navigate('/admin/login');
    } else {
      logoutStudent();
      navigate('/login');
    }
  };

  return (
    <aside className="w-sidebar bg-card border-r border-border flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="GPHDM Logo" className="h-10 w-auto" />
          <div>
            <h1 className="font-serif text-base font-bold text-foreground">
              {APP_CONFIG.shortName}
            </h1>
            <p className="text-xs text-muted-foreground">
              {variant === 'admin' ? 'Admin Portal' : 'Student Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="size-9 bg-muted rounded-full flex items-center justify-center">
              <Users className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? variant === 'admin'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="size-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
