import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowDown } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { cn } from '@/lib/utils';

interface PullToRefreshContainerProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}

export function PullToRefreshContainer({
  children,
  onRefresh,
  disabled = false,
  className,
}: PullToRefreshContainerProps) {
  const { containerRef, isRefreshing, pullProgress } = usePullToRefresh({
    onRefresh,
    disabled,
  });

  const showIndicator = pullProgress > 0 || isRefreshing;
  const indicatorHeight = isRefreshing ? 60 : pullProgress * 80;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center overflow-hidden pointer-events-none z-10"
        style={{ height: indicatorHeight }}
        animate={{ opacity: showIndicator ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex flex-col items-center gap-2 text-primary">
          {isRefreshing ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
              <span className="text-xs font-medium text-muted-foreground" aria-live="polite">
                Refreshing...
              </span>
            </>
          ) : (
            <>
              <motion.div
                animate={{ rotate: pullProgress >= 1 ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowDown className="h-5 w-5" aria-hidden="true" />
              </motion.div>
              <span className="text-xs font-medium text-muted-foreground">
                {pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ 
          transform: `translateY(${isRefreshing ? 60 : pullProgress * 80}px)`,
          opacity: isRefreshing ? 0.7 : 1 - (pullProgress * 0.1),
        }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
