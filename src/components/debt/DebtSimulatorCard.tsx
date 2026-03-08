/**
 * Debt Simulator Card
 * 
 * Hero card showing Reality (current path) vs What-If (simulated path)
 * with a slider + input for extra payments and strategy toggle.
 */

import { useState, useMemo } from 'react';
import {
  Snowflake, Flame, TrendingDown, Clock, DollarSign,
  Calendar, Zap, CheckCircle2, ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { calculatePayoffPlan, type DebtItem } from '@/lib/debtCalculations';
import { formatCurrency } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface DebtSimulatorCardProps {
  debts: DebtItem[];
  currentStrategy: 'Snowball' | 'Avalanche';
  extraBudget: number;
  onApplyPlan?: (strategy: 'Snowball' | 'Avalanche', extraAmount: number) => void;
}

export function DebtSimulatorCard({
  debts,
  currentStrategy,
  extraBudget,
  onApplyPlan,
}: DebtSimulatorCardProps) {
  const [simStrategy, setSimStrategy] = useState<'Snowball' | 'Avalanche'>(currentStrategy);
  const [simExtra, setSimExtra] = useState(0);

  const activeDebts = debts.filter(d => d.balance > 0);

  // Reality: current path
  const realityPlan = useMemo(
    () => calculatePayoffPlan(debts, extraBudget, currentStrategy),
    [debts, extraBudget, currentStrategy]
  );

  // What-If: simulated path
  const simPlan = useMemo(
    () => calculatePayoffPlan(debts, extraBudget + simExtra, simStrategy),
    [debts, extraBudget, simExtra, simStrategy]
  );

  const interestSaved = realityPlan.totalInterest - simPlan.totalInterest;
  const monthsSaved = realityPlan.months - simPlan.months;
  const hasImpact = interestSaved > 0 || monthsSaved > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(0, Math.min(2000, Number(e.target.value) || 0));
    setSimExtra(val);
  };

  if (activeDebts.length === 0) {
    return (
      <Card className="border-2 border-dashed border-primary/20 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Debt Payoff Simulator
          </CardTitle>
          <CardDescription>
            Add your debts below to unlock the simulator and see how extra payments accelerate your freedom
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Once you add at least one debt, the simulator will show your current payoff timeline and let you explore "what if" scenarios.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalMinimums = activeDebts.reduce((sum, d) => sum + d.min, 0);
  const currentMonthlyPayment = totalMinimums + extraBudget;

  return (
    <Card className="border-2 border-primary/20 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Debt Payoff Simulator
        </CardTitle>
        <CardDescription>
          See how extra payments and strategy changes accelerate your freedom
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Two-Column: Reality vs What-If */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reality Column */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Your Current Path
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Monthly Payment
                </span>
                <span className="font-bold text-foreground">{formatCurrency(currentMonthlyPayment)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5" /> Total Interest
                </span>
                <span className="font-bold text-destructive">{formatCurrency(realityPlan.totalInterest)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Time to Freedom
                </span>
                <span className="font-bold text-foreground">
                  {realityPlan.months > 0 ? `${realityPlan.months} months` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Debt-Free By
                </span>
                <span className="font-bold text-foreground">{realityPlan.debtFreeDate}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground pt-1 border-t border-border">
              Strategy: <span className="font-medium text-foreground capitalize">{currentStrategy}</span>
              {' · '}Extra: <span className="font-medium text-foreground">{formatCurrency(extraBudget)}/mo</span>
            </div>
          </div>

          {/* What-If Column */}
          <div className={cn(
            "rounded-xl border-2 p-4 sm:p-5 space-y-4 transition-all duration-300",
            hasImpact
              ? "border-primary bg-primary/5 shadow-lg"
              : "border-border bg-background"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-2 w-2 rounded-full",
                hasImpact ? "bg-primary animate-pulse" : "bg-muted-foreground"
              )} />
              <h3 className={cn(
                "font-semibold text-sm uppercase tracking-wider",
                hasImpact ? "text-primary" : "text-muted-foreground"
              )}>
                What If
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Monthly Payment
                </span>
                <span className={cn("font-bold", hasImpact ? "text-primary" : "text-foreground")}>
                  {formatCurrency(currentMonthlyPayment + simExtra)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5" /> Total Interest
                </span>
                <span className={cn("font-bold", interestSaved > 0 ? "text-success" : "text-foreground")}>
                  {formatCurrency(simPlan.totalInterest)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Time to Freedom
                </span>
                <span className={cn("font-bold", monthsSaved > 0 ? "text-success" : "text-foreground")}>
                  {simPlan.months > 0 ? `${simPlan.months} months` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Debt-Free By
                </span>
                <span className={cn("font-bold", hasImpact ? "text-primary" : "text-foreground")}>
                  {simPlan.debtFreeDate}
                </span>
              </div>
            </div>

            {/* Savings highlight */}
            {hasImpact && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-1 border-t border-primary/20 flex items-center justify-between gap-2 flex-wrap"
              >
                {interestSaved > 0 && (
                  <span className="text-xs font-semibold text-success">
                    Save {formatCurrency(interestSaved)} in interest
                  </span>
                )}
                {monthsSaved > 0 && (
                  <span className="text-xs font-semibold text-success">
                    {monthsSaved} month{monthsSaved !== 1 ? 's' : ''} sooner
                  </span>
                )}
              </motion.div>
            )}
          </div>
        </div>

        <Separator />

        {/* Controls */}
        <div className="space-y-5">
          {/* Strategy Toggle */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Simulate Strategy
            </label>
            <div className="flex border border-border rounded-lg overflow-hidden w-full sm:w-auto">
              <Button
                variant={simStrategy === 'Snowball' ? 'royal' : 'ghost'}
                className="rounded-none flex-1 sm:flex-initial text-xs sm:text-sm"
                onClick={() => setSimStrategy('Snowball')}
              >
                <Snowflake className="h-4 w-4 mr-1" /> Snowball
              </Button>
              <Button
                variant={simStrategy === 'Avalanche' ? 'royal' : 'ghost'}
                className="rounded-none flex-1 sm:flex-initial text-xs sm:text-sm"
                onClick={() => setSimStrategy('Avalanche')}
              >
                <Flame className="h-4 w-4 mr-1" /> Avalanche
              </Button>
            </div>
          </div>

          {/* Extra Payment: Slider + Input */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Extra Monthly Payment
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Slider
                  value={[simExtra]}
                  onValueChange={([v]) => setSimExtra(v)}
                  min={0}
                  max={2000}
                  step={25}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>$0</span>
                  <span>$1,000</span>
                  <span>$2,000</span>
                </div>
              </div>
              <div className="w-28 flex-shrink-0">
                <div className="flex items-center rounded-xl border border-input/50 bg-muted/30 px-3 h-11 sm:h-10">
                  <span className="text-muted-foreground text-sm mr-1">$</span>
                  <input
                    type="number"
                    value={simExtra || ''}
                    onChange={handleInputChange}
                    min={0}
                    max={2000}
                    step={25}
                    placeholder="0"
                    className="w-full bg-transparent text-sm font-medium text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        {hasImpact && onApplyPlan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button
              onClick={() => onApplyPlan(simStrategy, simExtra)}
              variant="royal"
              className="w-full sm:w-auto"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Apply This Plan
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
