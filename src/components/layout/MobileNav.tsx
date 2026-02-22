import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ClipboardList,
    Award,
    FileCheck,
    Wallet,
    Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';

const studentTabs = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/exam', label: 'Exam', icon: ClipboardList },
    { href: '/dashboard/results', label: 'Results', icon: Award },
    { href: '/dashboard/certificates', label: 'Docs', icon: FileCheck },
    { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
];

interface MobileNavProps {
    onMenuClick?: () => void;
}

export function MobileNav({ onMenuClick }: MobileNavProps) {
    const location = useLocation();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border px-4 pb-safe-area-inset-bottom">
            <nav className="flex items-center justify-between h-16 max-w-lg mx-auto">
                {studentTabs.map((tab) => {
                    const isActive = location.pathname === tab.href;
                    return (
                        <NavLink
                            key={tab.href}
                            to={tab.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all duration-200 min-h-[48px]",
                                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <tab.icon className={cn("size-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                            <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
                            {isActive && (
                                <span className="absolute bottom-0 w-8 h-1 bg-primary rounded-t-full" />
                            )}
                        </NavLink>
                    );
                })}
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="flex flex-col items-center justify-center flex-1 py-1 gap-1 text-muted-foreground hover:text-foreground min-h-[48px]"
                    >
                        <Menu className="size-6" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">More</span>
                    </button>
                )}
            </nav>
        </div>
    );
}
