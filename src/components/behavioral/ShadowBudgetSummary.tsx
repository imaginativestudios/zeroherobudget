/**
 * Hidden Costs Summary Card
 * 
 * Shows the monthly total of discretionary spending vs its true cost with debt interest.
 */

import { Ghost, ArrowRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBehavioralEngine } from '@/hooks/useBehavioralEngine';
import { cn } from '@/lib/utils';

export function ShadowBudgetSummary() {
  const { shadowAlerts, highestInterestRate, isLoading } = useBehavioralEngine();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Ghost className="h-4 w-4 text-muted-foreground" />
            Hidden Costs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-muted rounded w-24" />
            <div className="h-4 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show if user has no debt interest
  if (highestInterestRate <= 0) {
    return null;
  }

  const totalSpent = shadowAlerts.reduce((sum, alert) => sum + alert.amount, 0);
  const totalShadowCost = shadowAlerts.reduce(
    (sum, alert) => sum + alert.shadowCost.shadowCost,
    0
  );
  const hiddenCost = totalShadowCost - totalSpent;

  if (shadowAlerts.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Ghost className="h-4 w-4 text-muted-foreground" />
            Hidden Costs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No discretionary spending this month. You're keeping your hidden costs at zero! 🎉
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-royal hover-lift">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Ghost className="h-4 w-4 text-muted-foreground" />
            Hidden Costs
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="font-medium">What are hidden costs?</p>
                <p className="text-sm text-muted-foreground">
                  When you have debt, discretionary spending has a "hidden cost" — the interest 
                  you'll pay on that amount over 12 months instead of putting it toward debt.
                </p>
              </TooltipContent>
            </Tooltip>
          </span>
          <span className="text-xs text-destructive">
            +${hiddenCost.toFixed(0)} hidden
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Spent</p>
            <p className="text-lg font-semibold">${totalSpent.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">True Cost</p>
            <p className={cn('text-lg font-semibold', hiddenCost > 0 && 'text-destructive')}>
              ${totalShadowCost.toFixed(0)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Recent discretionary expenses:</p>
          {shadowAlerts.slice(0, 3).map((alert) => (
            <div key={alert.transactionId} className="flex justify-between text-sm">
              <span className="truncate flex-1">{alert.description}</span>
              <span className="text-destructive ml-2">
                +${(alert.shadowCost.shadowCost - alert.amount).toFixed(0)}
              </span>
            </div>
          ))}
        </div>

        <Button variant="ghost" size="sm" asChild className="w-full justify-between">
          <Link to="/transactions">
            View Transactions
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
