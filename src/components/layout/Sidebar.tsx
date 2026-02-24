import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
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
    <aside className="w-[280px] bg-[#030712]/80 backdrop-blur-3xl border-r border-white/10 flex flex-col h-full overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:bg-primary/40 transition-colors" />
            <img src={logoImg} alt="GPHDM Logo" className="h-12 w-auto relative z-10 drop-shadow-[0_0_10px_rgba(255,165,0,0.3)] transition-transform group-hover:scale-105" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tighter leading-none">
              {APP_CONFIG.shortName}
            </h1>
            <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mt-1.5 opacity-80">
              {variant === 'admin' ? 'Admin Node' : variant === 'center' ? 'Center Hub' : 'Scholar Portal'}
            </p>
          </div>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" className="md:hidden text-white/40 hover:text-white" onClick={onClose}>
            <X className="size-6" />
          </Button>
        )}
      </div>

      {/* User Info */}
      {user && (
        <div className="p-6 border-b border-white/5 bg-white/5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="size-11 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
              <Users className="size-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate tracking-tight">{user.name}</p>
              <p className="text-[10px] text-white/40 font-bold italic truncate mt-0.5">
                {(user as any).email || (user as any).ownerEmail || 'Scholar'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-10">
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
                "group flex items-center gap-4 px-4 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-300 outline-none",
                isActive
                  ? variant === 'admin'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                    : variant === 'center'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                      : 'bg-primary text-white border border-primary/20 shadow-[0_0_30px_rgba(251,191,36,0.3)]'
                  : 'text-white/40 hover:text-white hover:bg-white/5 active:scale-95'
              )}
            >
              <item.icon className={cn(
                "size-5 transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-inherit" : "text-white/30 group-hover:text-white"
              )} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId={`active-indicator-${idSuffix}`}
                  className={cn(
                    "ml-auto w-1.5 h-6 rounded-full",
                    variant === 'admin' ? 'bg-red-500' : variant === 'center' ? 'bg-amber-500' : 'bg-white shadow-[0_0_10px_white]'
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/5 bg-white/5 relative z-10">
        <Button
          variant="ghost"
          className="w-full justify-start gap-4 h-14 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-xs"
          onClick={handleLogout}
        >
          <LogOut className="size-5" />
          <span>Logout</span>
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
