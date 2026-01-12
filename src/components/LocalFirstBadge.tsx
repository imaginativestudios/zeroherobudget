/**
 * Local-First Badge
 * 
 * Interactive badge that emphasizes data privacy with a glowing shield icon.
 * Clicking opens a popover with privacy explanation.
 */

import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface LocalFirstBadgeProps {
  className?: string;
  variant?: 'default' | 'footer' | 'compact';
}

export function LocalFirstBadge({ className, variant = 'default' }: LocalFirstBadgeProps) {
  const content = (
    <div className="space-y-3 max-w-xs">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-success" />
        <span className="font-semibold text-foreground">Local-First Privacy</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your financial data is encrypted and lives only on this device. 
        No servers, no selling, no prying eyes.
      </p>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-1 rounded-full bg-success/10 text-success">
          🔒 Encrypted
        </span>
        <span className="px-2 py-1 rounded-full bg-success/10 text-success">
          📱 Device Only
        </span>
        <span className="px-2 py-1 rounded-full bg-success/10 text-success">
          🌐 Works Offline
        </span>
      </div>
      <Link 
        to="/data-privacy" 
        className="inline-block text-xs text-primary hover:underline"
      >
        Learn more about your privacy →
      </Link>
    </div>
  );

  if (variant === 'footer') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button 
            className={cn(
              "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group",
              className
            )}
            aria-label="Learn about local-first privacy"
          >
            <Shield 
              className={cn(
                "h-3.5 w-3.5 text-success transition-all",
                "group-hover:scale-110 group-hover:animate-pulse"
              )} 
              aria-hidden="true" 
            />
            <span>Local-First</span>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          side="top" 
          className="w-80"
          sideOffset={8}
        >
          {content}
        </PopoverContent>
      </Popover>
    );
  }

  if (variant === 'compact') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button 
            className={cn(
              "inline-flex items-center justify-center p-2 rounded-full",
              "bg-success/10 hover:bg-success/20 transition-colors group",
              className
            )}
            aria-label="Learn about local-first privacy"
          >
            <Shield 
              className="h-4 w-4 text-success group-hover:scale-110 transition-transform" 
              aria-hidden="true" 
            />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-80">
          {content}
        </PopoverContent>
      </Popover>
    );
  }

  // Default variant
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
            "bg-success/10 hover:bg-success/20 transition-all group",
            "border border-success/20 hover:border-success/40",
            className
          )}
          aria-label="Learn about local-first privacy"
        >
          <Shield 
            className={cn(
              "h-4 w-4 text-success transition-transform",
              "group-hover:scale-110"
            )} 
            aria-hidden="true" 
          />
          <span className="text-sm font-medium text-success">Local-First</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-80">
        {content}
      </PopoverContent>
    </Popover>
  );
}
