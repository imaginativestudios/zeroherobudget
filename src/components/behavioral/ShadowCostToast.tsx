/**
 * Shadow Cost Toast Component
 * 
 * Displays a loss aversion-focused notification when users
 * add non-essential transactions, showing the true cost
 * of the expense in terms of debt interest.
 */

import { useEffect } from 'react';
import { toast } from 'sonner';
import { Ghost, TrendingDown, Calendar, X } from 'lucide-react';
import { formatTriggerCurrency } from '@/lib/behavioralTriggers';

interface ShadowCostData {
  transactionId: string;
  description: string;
  amount: number;
  shadowCost: number;
  freedomDateDelay: number;
  interestRate: number;
}

interface ShadowCostToastProps {
  data: ShadowCostData | null;
  onDismiss: () => void;
}

export function ShadowCostToast({ data, onDismiss }: ShadowCostToastProps) {
  useEffect(() => {
    if (!data) return;

    const interestCost = data.shadowCost - data.amount;
    const percentageMore = ((interestCost / data.amount) * 100).toFixed(0);

    toast.custom(
      (t) => (
        <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-lg p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Ghost className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Shadow Budget Alert</h4>
                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {data.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t);
                onDismiss();
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Main Message */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <p className="text-sm text-foreground">
              This <span className="font-semibold text-primary">{formatTriggerCurrency(data.amount)}</span> purchase 
              actually costs you{' '}
              <span className="font-semibold text-destructive">
                {formatTriggerCurrency(data.shadowCost)}
              </span>{' '}
              when you factor in {data.interestRate.toFixed(1)}% APR debt.
            </p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span>{percentageMore}% more in interest</span>
              </div>
              {data.freedomDateDelay > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-warning" />
                  <span>+{data.freedomDateDelay} days to freedom</span>
                </div>
              )}
            </div>
          </div>

          {/* Subtle encouragement */}
          <p className="text-xs text-muted-foreground text-center">
            💡 Consider: Could this wait? Every dollar toward debt brings you closer to freedom.
          </p>
        </div>
      ),
      {
        duration: 8000,
        position: 'bottom-right',
        onDismiss: onDismiss,
      }
    );
  }, [data, onDismiss]);

  return null;
}
