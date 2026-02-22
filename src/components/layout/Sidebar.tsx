import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useDragControls,
  PanInfo
} from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Award,
  FileCheck,
  Wallet,
  LogOut,
  GraduationCap,
  ClipboardList,
  Gift,
  FileText,
  Share2,
  Mail,
  Image,
  BookOpen,
  Cpu,
  X
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
  { href: '/admin/questions', label: 'Questions', icon: ClipboardList },
  { href: '/admin/certificates', label: 'Certificates', icon: FileText },
  { href: '/admin/syllabus', label: 'Syllabus', icon: BookOpen },
  { href: '/admin/automation', label: 'Automation', icon: Cpu },
  { href: '/admin/gallery', label: 'Gallery', icon: Image },
  { href: '/admin/emails', label: 'Emails', icon: Mail },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const centerNavItems = [
  { href: '/center/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/center/students', label: 'My Students', icon: Users },
  { href: '/center/rewards', label: 'Rewards', icon: Gift },
  { href: '/center/profile', label: 'Profile', icon: Settings },
];

const studentNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/exam', label: 'Take Exam', icon: ClipboardList },
  { href: '/dashboard/results', label: 'Results', icon: Award },
  { href: '/dashboard/certificates', label: 'Certificates', icon: FileCheck },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
];

interface SidebarProps {
  variant: 'admin' | 'student' | 'center';
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ variant, isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentAdmin, currentStudent, currentCenter, logoutAdmin, logoutStudent, logoutCenter } = useAuthStore();

  const navItems = variant === 'admin' ? adminNavItems : variant === 'center' ? centerNavItems : studentNavItems;
  const user = variant === 'admin' ? currentAdmin : variant === 'center' ? currentCenter : currentStudent;

  const handleLogout = () => {
    if (variant === 'admin') {
      logoutAdmin();
      navigate('/admin/login');
    } else if (variant === 'center') {
      logoutCenter();
      navigate('/center/login');
    } else {
      logoutStudent();
      navigate('/login');
    }
    onClose?.();
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x < -50 && onClose) {
      onClose();
    }
  };

  const renderSidebarContent = (idSuffix: string) => (
    <aside className="w-[260px] bg-card border-r border-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoImg} alt="GPHDM Logo" className="h-10 w-auto" />
          <div>
            <h1 className="font-serif text-base font-bold text-foreground">
              {APP_CONFIG.shortName}
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
              {variant === 'admin' ? 'Admin Portal' : variant === 'center' ? 'Center Portal' : 'Student Portal'}
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
            <X className="size-5" />
          </Button>
        )}
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="size-9 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate italic">
                {(user as any).email || (user as any).ownerEmail}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.href
            : location.pathname.startsWith(item.href);

          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => onClose?.()}
              className={cn(
                "group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 outline-none",
                isActive
                  ? variant === 'admin'
                    ? 'bg-red-50 text-red-700 shadow-sm border border-red-100/50'
                    : variant === 'center'
                      ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100/50'
                      : 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95'
              )}
            >
              <item.icon className={cn("size-5 transition-transform group-hover:scale-110", isActive && "animate-pulse")} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId={`active-pill-${idSuffix}`}
                  className={cn("ml-auto w-1.5 h-6 rounded-full", variant === 'admin' ? 'bg-red-500' : variant === 'center' ? 'bg-amber-500' : 'bg-white/30')}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/20">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-12 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300"
          onClick={handleLogout}
        >
          <LogOut className="size-5" />
          <span className="font-semibold">Logout</span>
        </Button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block sticky top-0 h-screen">
        {renderSidebarContent('desktop')}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100] md:hidden"
          />
        )}
        {isOpen && (
          <motion.div
            key="drawer-content"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="x"
            dragConstraints={{ right: 0, left: -260 }}
            onDragEnd={handleDragEnd}
            className="fixed inset-y-0 left-0 w-[260px] z-[101] md:hidden shadow-2xl"
          >
            {renderSidebarContent('mobile')}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
