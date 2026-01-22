/**
 * Shadow Budget Summary Card
 * 
 * Shows the monthly total of discretionary spending vs its true cost with debt interest.
 */

import { Ghost, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
            Shadow Budget
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
            Shadow Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No discretionary spending this month. You're keeping your shadow costs at zero! 🎉
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
            Shadow Budget
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
            View Journey Log
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
