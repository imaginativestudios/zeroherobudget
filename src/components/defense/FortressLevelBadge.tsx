import { motion, AnimatePresence } from 'framer-motion';
import { Home, Building, Castle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CastleLevel, FORTRESS_LEVEL_LABELS } from '@/lib/moatCalculations';
import { cn } from '@/lib/utils';

interface FortressLevelBadgeProps {
  level: CastleLevel;
  isSecure?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const getLevelIcon = (level: CastleLevel, isSecure: boolean) => {
  const iconClass = "shrink-0";
  
  switch (level) {
    case 1:
      return <Home className={cn(iconClass, "h-3.5 w-3.5")} />;
    case 2:
      return <Building className={cn(iconClass, "h-3.5 w-3.5")} />;
    case 3:
      return <Castle className={cn(iconClass, "h-3.5 w-3.5")} />;
    case 4:
      return isSecure ? (
        <span className="flex items-center gap-0.5">
          <Castle className={cn(iconClass, "h-3.5 w-3.5")} />
          <Shield className={cn(iconClass, "h-3 w-3")} />
        </span>
      ) : (
        <Castle className={cn(iconClass, "h-3.5 w-3.5")} />
      );
  }
};

const getLevelColorClass = (level: CastleLevel, isSecure: boolean): string => {
  if (isSecure) {
    return 'border-success/50 bg-success/10 text-success';
  }
  
  switch (level) {
    case 1:
      return 'border-muted-foreground/30 bg-muted/50 text-muted-foreground';
    case 2:
      return 'border-primary/30 bg-primary/10 text-primary/70';
    case 3:
      return 'border-primary/50 bg-primary/15 text-primary';
    case 4:
      return 'border-primary/60 bg-primary/20 text-primary';
  }
};

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-1 gap-1.5',
  lg: 'text-sm px-2.5 py-1.5 gap-2',
};

export function FortressLevelBadge({
  level,
  isSecure = false,
  size = 'md',
  showLabel = true,
  className,
}: FortressLevelBadgeProps) {
  const colorClass = getLevelColorClass(level, isSecure);
  const label = FORTRESS_LEVEL_LABELS[level];
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`level-${level}-${isSecure}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <Badge
          variant="outline"
          className={cn(
            'flex items-center font-medium transition-all duration-300',
            colorClass,
            sizeClasses[size],
            isSecure && 'animate-pulse',
            className
          )}
        >
          {getLevelIcon(level, isSecure)}
          {showLabel && (
            <span className="whitespace-nowrap">{label}</span>
          )}
        </Badge>
      </motion.div>
    </AnimatePresence>
  );
}
