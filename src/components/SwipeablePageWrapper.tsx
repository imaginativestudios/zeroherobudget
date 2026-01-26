import { ReactNode } from 'react';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeablePageWrapperProps {
  children: ReactNode;
  leftRoute?: string;
  rightRoute?: string;
  className?: string;
}

export function SwipeablePageWrapper({
  children,
  leftRoute,
  rightRoute,
  className,
}: SwipeablePageWrapperProps) {
  const { containerProps, direction } = useSwipeNavigation({
    routes: { left: leftRoute, right: rightRoute },
    enabled: true,
  });

  return (
    <div className={cn("relative", className)} {...containerProps}>
      {/* Left edge indicator */}
      {rightRoute && direction === 'right' && (
        <div 
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 p-2 bg-primary/10 rounded-r-lg lg:hidden"
          aria-hidden="true"
        >
          <ChevronLeft className="h-6 w-6 text-primary" />
        </div>
      )}
      
      {/* Right edge indicator */}
      {leftRoute && direction === 'left' && (
        <div 
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 p-2 bg-primary/10 rounded-l-lg lg:hidden"
          aria-hidden="true"
        >
          <ChevronRight className="h-6 w-6 text-primary" />
        </div>
      )}
      
      {children}
    </div>
  );
}
