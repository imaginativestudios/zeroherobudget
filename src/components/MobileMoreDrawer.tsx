import { Link, useLocation } from 'react-router-dom';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import {
  Menu,
  Rocket,
  Wallet,
  Trophy,
  BarChart3,
  Database,
  Lightbulb,
  Settings,
  Shield,
  Plug,
  TrendingUp,
} from 'lucide-react';

interface MobileMoreDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const moreNavItems = [
  { name: 'Journey', href: '/journey', icon: Rocket },
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Wealth', href: '/wealth', icon: TrendingUp },
  { name: 'Achievements', href: '/achievements', icon: Trophy },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Data Management', href: '/data', icon: Database },
  { name: 'Financial Tips', href: '/learn', icon: Lightbulb },
  
  { name: 'Account Settings', href: '/account', icon: Settings },
  { name: 'Your Privacy', href: '/data-privacy', icon: Shield },
];

export function MobileMoreDrawer({ open, onOpenChange }: MobileMoreDrawerProps) {
  const location = useLocation();

  const handleItemClick = () => {
    haptics.tap();
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <DrawerTitle className="text-center">More</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-1 overflow-y-auto">
          {moreNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={handleItemClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px]",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-foreground hover:bg-muted"
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
