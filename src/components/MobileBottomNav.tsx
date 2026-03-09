import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Cloud, Scroll, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { MobileMoreDrawer } from './MobileMoreDrawer';

const navItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Budget', href: '/budgets', icon: Compass },
  { name: 'Debts', href: '/debts', icon: Cloud },
  { name: 'Log', href: '/transactions', icon: Scroll },
];

export function MobileBottomNav() {
  const location = useLocation();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  const handleNavPress = () => {
    haptics.tap();
  };

  const handleMorePress = () => {
    haptics.tap();
    setMoreDrawerOpen(true);
  };

  // Check if current path matches any "more" drawer routes
  const isMoreActive = [
    '/journey',
    '/accounts',
    '/wealth',
    '/achievements',
    '/reports',
    '/data',
    '/learn',
    
    '/account',
    '/data-privacy',
  ].some((path) => location.pathname.startsWith(path));

  return (
    <>
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-sidebar border-t border-sidebar-border"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-16 pb-safe">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={handleNavPress}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.name}
              >
                <item.icon 
                  className={cn(
                    "h-5 w-5 mb-1 transition-transform",
                    isActive && "scale-110"
                  )} 
                  aria-hidden="true" 
                />
                <span className={cn(
                  "text-[10px] font-medium truncate",
                  isActive && "font-semibold"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
          
          {/* More button */}
          <button
            onClick={handleMorePress}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1 transition-colors",
              isMoreActive || moreDrawerOpen
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="More navigation options"
            aria-expanded={moreDrawerOpen}
          >
            <MoreHorizontal 
              className={cn(
                "h-5 w-5 mb-1 transition-transform",
                (isMoreActive || moreDrawerOpen) && "scale-110"
              )} 
              aria-hidden="true" 
            />
            <span className={cn(
              "text-[10px] font-medium",
              (isMoreActive || moreDrawerOpen) && "font-semibold"
            )}>
              More
            </span>
          </button>
        </div>
      </nav>

      <MobileMoreDrawer 
        open={moreDrawerOpen} 
        onOpenChange={setMoreDrawerOpen} 
      />
    </>
  );
}
