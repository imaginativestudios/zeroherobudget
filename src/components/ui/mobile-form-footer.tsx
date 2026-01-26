import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MobileFormFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * Sticky footer for form actions on mobile devices.
 * Provides a consistent, accessible action area with proper safe area handling.
 */
export function MobileFormFooter({ children, className }: MobileFormFooterProps) {
  return (
    <div
      className={cn(
        "fixed bottom-16 left-0 right-0 z-40 lg:hidden",
        "bg-background/95 backdrop-blur-sm border-t border-border",
        "px-4 py-3 pb-safe",
        "flex items-center justify-end gap-3",
        className
      )}
    >
      {children}
    </div>
  );
}
