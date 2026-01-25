/**
 * Surplus Power Card
 * 
 * Displays the calculated Surplus Power metric with contextual hero messaging.
 * Shows Income - Survival - Debt Minimums = Surplus Power
 */

import { Zap, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBehavioralEngine } from '@/hooks/useBehavioralEngine';
import { cn } from '@/lib/utils';

export function SurplusPowerCard() {
  const { surplusPower, isLoading } = useBehavioralEngine();

  if (isLoading) {
    return (
      <Card className="h-full bg-white dark:bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-warning" />
            Surplus Power
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

  const { surplusPower: amount, surplusPercentage, isPositive, heroMessage } = surplusPower;

  // Derive status from surplusPercentage
  const status = !isPositive ? 'negative' 
    : surplusPercentage < 10 ? 'tight' 
    : surplusPercentage < 25 ? 'healthy' 
    : 'hero';

  const statusConfig = {
    hero: {
      color: 'text-success',
      bgColor: 'bg-success/10',
      icon: TrendingUp,
      label: 'Strong Surplus',
    },
    healthy: {
      color: 'text-success',
      bgColor: 'bg-success/10',
      icon: TrendingUp,
      label: 'Healthy',
    },
    tight: {
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      icon: TrendingDown,
      label: 'Tight Budget',
    },
    negative: {
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      icon: TrendingDown,
      label: 'Needs Attention',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className="h-full shadow-royal hover-lift bg-white dark:bg-card">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Surplus Power
          </span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full', config.bgColor, config.color)}>
            {config.label}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-3">
        <div className="flex items-baseline gap-2">
          <span className={cn('text-3xl font-bold', config.color)}>
            ${Math.abs(amount).toLocaleString()}
          </span>
          <StatusIcon className={cn('h-5 w-5', config.color)} />
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {heroMessage}
        </p>

        <Button variant="ghost" size="sm" asChild className="w-full justify-between">
          <Link to="/budgets">
            Adjust Budget
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
