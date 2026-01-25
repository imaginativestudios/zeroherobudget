import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Flag, Sparkles, ArrowRight, PartyPopper } from 'lucide-react';
import { calculateFreedomImpact } from '@/lib/freedomEngine';
import { DebtItem } from '@/lib/debtCalculations';
import { format } from 'date-fns';

interface FreedomTimelineWidgetProps {
  debts: DebtItem[];
  extraBudget: number;
  strategy: 'Snowball' | 'Avalanche';
}

const getHeroicMessage = (months: number): string => {
  if (months === 0) return "Victory! You've paid off all your debts!";
  if (months <= 6) return "Almost there! Just a few more months!";
  if (months <= 12) return "You're in the final stretch!";
  if (months <= 24) return "Steady progress leads to certain success!";
  if (months <= 36) return "Your discipline will pay off!";
  return "The longest journeys start with a single step!";
};

export function FreedomTimelineWidget({ debts, extraBudget, strategy }: FreedomTimelineWidgetProps) {
  const activeDebts = useMemo(() => debts.filter(d => d.balance > 0), [debts]);
  
  const impact = useMemo(() => {
    if (activeDebts.length === 0) return null;
    return calculateFreedomImpact(activeDebts, extraBudget, 0, strategy);
  }, [activeDebts, extraBudget, strategy]);

  // Calculate progress based on paid vs total debt
  const progressPercent = useMemo(() => {
    if (activeDebts.length === 0) return 100;
    // Estimate original balance as current balance + some paid amount
    // For now, show progress based on timeline completion
    if (!impact || impact.baselineMonths === 0) return 100;
    return Math.max(0, Math.min(100, 10)); // Start at 10% for having started the journey
  }, [activeDebts, impact]);

  // Debt-free state
  if (activeDebts.length === 0) {
    return (
      <Card className="border-accent/30 bg-white dark:bg-card shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <PartyPopper className="h-5 w-5 text-accent" aria-hidden="true" />
            Freedom Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-3">
              <Flag className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-accent">Debt Free!</h3>
            <p className="text-muted-foreground mt-1">
              You've achieved financial freedom!
            </p>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/debts">
              <Sparkles className="mr-2 h-4 w-4" />
              View Your Victory
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No impact calculated (edge case)
  if (!impact) {
    return (
      <Card className="border-border/50 shadow-lg bg-white dark:bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
            Freedom Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Add debts to start tracking your path to freedom.
          </p>
          <Button asChild variant="outline" className="w-full mt-4">
            <Link to="/debts">
              Add Your First Debt
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const monthsRemaining = impact.baselineMonths;
  const freedomDate = impact.baselineFreedomDate;
  const heroMessage = getHeroicMessage(monthsRemaining);

  return (
    <Card className="shadow-royal hover-lift overflow-hidden bg-white dark:bg-card">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
          Freedom Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        {/* Main Date Display */}
        <div className="text-center py-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Your Debt-Free Date
          </p>
          <div className="inline-flex flex-col items-center justify-center px-6 py-3 rounded-xl bg-primary/10 border border-primary/20">
            <span className="text-3xl font-bold text-primary">
              {format(freedomDate, 'MMM yyyy')}
            </span>
            <span className="text-sm text-muted-foreground mt-0.5">
              {monthsRemaining} {monthsRemaining === 1 ? 'month' : 'months'} away
            </span>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Today</span>
            <span>Freedom</span>
          </div>
          <div className="relative">
            <Progress value={progressPercent} className="h-2" />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-sm transition-all duration-500"
              style={{ left: `calc(${progressPercent}% - 6px)` }}
            />
          </div>
        </div>

        {/* Heroic Message */}
        <p className="text-sm text-center text-muted-foreground italic">
          "{heroMessage}"
        </p>

        {/* Action Button */}
        <Button asChild variant="outline" className="w-full group">
          <Link to="/debts">
            View Debt Strategy
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
