import { differenceInDays } from 'date-fns';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PricingInterval } from '@/lib/constants';

interface TrialCountdownBannerProps {
  trialEnd: string;
  interval?: PricingInterval | null;
}

export function TrialCountdownBanner({ trialEnd, interval }: TrialCountdownBannerProps) {
  const navigate = useNavigate();
  const daysRemaining = differenceInDays(new Date(trialEnd), new Date());
  
  // Don't show if trial has ended
  if (daysRemaining < 0) return null;
  
  // Urgency-based styling
  const isUrgent = daysRemaining <= 2;
  const isWarning = daysRemaining <= 4 && daysRemaining > 2;
  
  const urgencyClass = isUrgent
    ? 'bg-destructive/10 border-destructive/30 text-destructive'
    : isWarning
      ? 'bg-warning/10 border-warning/30 text-warning-foreground'
      : 'bg-primary/10 border-primary/30 text-primary';
  
  const iconClass = isUrgent
    ? 'text-destructive'
    : isWarning
      ? 'text-warning'
      : 'text-primary';

  const daysText = daysRemaining === 0 
    ? 'Last day' 
    : daysRemaining === 1 
      ? '1 day left' 
      : `${daysRemaining} days left`;

  const planLabel = interval === 'annual' ? 'Annual' : 'Monthly';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', duration: 0.5 }}
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border',
        urgencyClass
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-full bg-background/50', iconClass)}>
          <Clock className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{daysText}</span>
            <span className="text-sm opacity-80">in your free trial</span>
          </div>
          {interval && (
            <p className="text-sm opacity-70 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Your {planLabel} Plan awaits!
            </p>
          )}
        </div>
      </div>
      
      <Button
        variant={isUrgent ? 'destructive' : isWarning ? 'default' : 'outline'}
        size="sm"
        onClick={() => navigate('/pricing')}
        className="w-full sm:w-auto"
      >
        Subscribe Now
        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
      </Button>
    </motion.div>
  );
}
