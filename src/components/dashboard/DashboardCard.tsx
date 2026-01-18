/**
 * Unified Dashboard Card Component
 * 
 * Enforces consistent styling across all dashboard widgets:
 * - shadow-royal hover-lift
 * - Standard padding (p-6)
 * - Uniform header pattern with icon and optional badge
 */

import { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const DashboardCard = forwardRef<HTMLDivElement, DashboardCardProps>(
  ({ title, icon: Icon, iconClassName, badge, children, footer, className }, ref) => {
    return (
      <Card 
        ref={ref}
        className={cn("shadow-royal hover-lift h-full", className)}
      >
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Icon className={cn("h-5 w-5 text-primary", iconClassName)} aria-hidden="true" />
              {title}
            </span>
            {badge}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-3">
          {children}
        </CardContent>
        {footer && (
          <CardFooter className="p-6 pt-0">
            {footer}
          </CardFooter>
        )}
      </Card>
    );
  }
);

DashboardCard.displayName = 'DashboardCard';
