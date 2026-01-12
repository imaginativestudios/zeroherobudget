/**
 * Shadow Cost Preview
 * 
 * Real-time shadow cost preview shown in the Add Transaction dialog
 * for non-essential expenses when user has debt.
 */

import { Ghost, AlertTriangle } from 'lucide-react';
import { useBehavioralEngine } from '@/hooks/useBehavioralEngine';
import { getSurvivalCategories } from '@/lib/behavioralEngine';
import { cn } from '@/lib/utils';

interface ShadowCostPreviewProps {
  amount: number;
  category: string;
  flow: 'in' | 'out';
}

export function ShadowCostPreview({ amount, category, flow }: ShadowCostPreviewProps) {
  const { getShadowCost, highestInterestRate } = useBehavioralEngine();

  // Only show for expenses (outflow)
  if (flow !== 'out') {
    return null;
  }

  // Only show if user has debt with interest
  if (highestInterestRate <= 0) {
    return null;
  }

  // Only show for non-essential categories
  const survivalCategories = getSurvivalCategories();
  if (survivalCategories.includes(category)) {
    return null;
  }

  // Only show if amount is meaningful
  if (!amount || amount <= 0) {
    return null;
  }

  const shadowCost = getShadowCost(amount);
  const hiddenCost = shadowCost.shadowCost - amount;

  if (hiddenCost <= 0) {
    return null;
  }

  return (
    <div className={cn(
      'rounded-lg border border-warning/30 bg-warning/5 p-3 space-y-2',
      'animate-in fade-in-50 slide-in-from-top-2 duration-200'
    )}>
      <div className="flex items-center gap-2 text-warning">
        <Ghost className="h-4 w-4" />
        <span className="text-sm font-medium">Shadow Cost Alert</span>
      </div>
      
      <p className="text-sm text-muted-foreground">
        This ${amount.toFixed(0)} purchase actually costs you{' '}
        <span className="font-semibold text-foreground">${shadowCost.shadowCost.toFixed(2)}</span>{' '}
        when factoring in your {highestInterestRate.toFixed(1)}% debt interest.
      </p>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <AlertTriangle className="h-3 w-3" />
        <span>
          Hidden cost: +${hiddenCost.toFixed(2)} over 12 months
        </span>
      </div>
    </div>
  );
}
