/**
 * Freedom Slider
 * 
 * Interactive "Time Slider" visualization that shows how extra payments
 * accelerate debt freedom in real-time.
 */

import { useState, useMemo, useEffect } from 'react';
import { Calendar, Rocket, Clock, DollarSign, Lightbulb, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { calculateFreedomImpact, translateToHumanTime } from '@/lib/freedomEngine';
import { DebtItem } from '@/lib/debtCalculations';
import { formatCurrency } from '@/lib/constants';
import { format, differenceInMonths } from 'date-fns';
import { cn } from '@/lib/utils';

interface FreedomSliderProps {
  debts: DebtItem[];
  currentExtraBudget: number;
  strategy: 'Snowball' | 'Avalanche';
  minAmount?: number;
  maxAmount?: number;
  step?: number;
  hourlyWage?: number;
}

export function FreedomSlider({
  debts,
  currentExtraBudget,
  strategy,
  minAmount = 0,
  maxAmount = 1000,
  step = 25,
  hourlyWage = 25,
}: FreedomSliderProps) {
  const [sliderValue, setSliderValue] = useState([0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const extraAmount = sliderValue[0];

  // Calculate impact at current slider position
  const impact = useMemo(() => 
    calculateFreedomImpact(debts, currentExtraBudget, extraAmount, strategy),
    [debts, currentExtraBudget, extraAmount, strategy]
  );

  // Calculate human time for interest saved
  const humanTime = useMemo(() => 
    translateToHumanTime(impact.totalInterestSaved, hourlyWage),
    [impact.totalInterestSaved, hourlyWage]
  );

  // Calculate impact at $100 increments for insight tip
  const firstHundredImpact = useMemo(() => 
    calculateFreedomImpact(debts, currentExtraBudget, 100, strategy),
    [debts, currentExtraBudget, strategy]
  );

  const lastHundredImpact = useMemo(() => {
    const at900 = calculateFreedomImpact(debts, currentExtraBudget, 900, strategy);
    const at1000 = calculateFreedomImpact(debts, currentExtraBudget, 1000, strategy);
    return {
      monthsSaved: at900.baselineMonths - at900.newMonths - (at1000.baselineMonths - at1000.newMonths),
      interestSaved: at900.totalInterestSaved - at1000.totalInterestSaved,
    };
  }, [debts, currentExtraBudget, strategy]);

  // Trigger animation on slider change
  useEffect(() => {
    setIsAnimating(true);
    const timeout = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timeout);
  }, [sliderValue]);

  // Don't render if no active debts
  const activeDebts = debts.filter(d => d.balance > 0);
  if (activeDebts.length === 0) {
    return null;
  }

  // Calculate diminishing returns message
  const showDiminishingReturns = extraAmount >= 200 && 
    firstHundredImpact.monthsSaved > 0 && 
    Math.abs(lastHundredImpact.monthsSaved) < firstHundredImpact.monthsSaved * 0.5;

  return (
    <Card className="shadow-royal overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Freedom Date Simulator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Slider Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Extra Monthly Payment</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(extraAmount)}
            </span>
          </div>
          
          <div className="px-2">
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              min={minAmount}
              max={maxAmount}
              step={step}
              className="cursor-pointer"
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(minAmount)}</span>
            <span>{formatCurrency(maxAmount)}</span>
          </div>
        </div>

        {/* Before/After Comparison */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
          {/* Before Card */}
          <div className="p-3 sm:p-4 rounded-lg border border-border bg-muted/30 space-y-1 sm:space-y-2 text-center">
            <div className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Current Plan
            </div>
            <div className={cn(
              "text-base sm:text-xl font-bold text-foreground transition-all duration-300",
              isAnimating && "scale-95 opacity-70"
            )}>
              📅 {impact.baselineFreedomDateFormatted}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {impact.baselineMonths} months
            </div>
            <div className="text-[10px] sm:text-xs text-destructive">
              Interest: {formatCurrency(impact.baselineInterest)}
            </div>
          </div>

          {/* After Card */}
          <div className={cn(
            "p-3 sm:p-4 rounded-lg border-2 space-y-1 sm:space-y-2 text-center transition-all duration-300",
            extraAmount > 0 
              ? "border-primary bg-primary/10 shadow-lg" 
              : "border-border bg-background"
          )}>
            <div className="text-[10px] sm:text-xs font-medium text-primary uppercase tracking-wider flex items-center justify-center gap-1">
              {extraAmount > 0 && <Rocket className="h-3 w-3" />}
              With Extra Payment
            </div>
            <div className={cn(
              "text-base sm:text-xl font-bold transition-all duration-300",
              extraAmount > 0 ? "text-primary" : "text-foreground",
              isAnimating && "scale-110"
            )}>
              📅 {impact.newFreedomDateFormatted}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {impact.newMonths} months
            </div>
            <div className="text-[10px] sm:text-xs text-primary">
              Interest: {formatCurrency(impact.newInterest)}
            </div>
          </div>
        </div>

        {/* Savings Summary */}
        {extraAmount > 0 && impact.monthsSaved > 0 && (
          <div className={cn(
            "p-3 sm:p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20",
            "animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
          )}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  Time Saved
                </div>
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {impact.monthsSaved}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">
                  month{impact.monthsSaved !== 1 ? 's' : ''}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-muted-foreground mb-1">
                  <DollarSign className="h-3 w-3" />
                  Interest Saved
                </div>
                <div className="text-xl sm:text-2xl font-bold text-accent-dark">
                  {formatCurrency(impact.totalInterestSaved)}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">
                  {humanTime.displayString}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Literacy Tip */}
        {showDiminishingReturns && (
          <div className={cn(
            "p-3 rounded-lg bg-info/10 border border-info/20",
            "animate-in fade-in-50 duration-500"
          )}>
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-info mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Literacy Tip:</span>{' '}
                Notice how the first $100 saves more time than the last $100? 
                That's the power of compound interest working for you instead of against you.
              </p>
            </div>
          </div>
        )}

        {/* Target Debt Info */}
        {impact.targetDebt && extraAmount > 0 && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                Extra payment targets:{' '}
                <span className="font-medium text-foreground">
                  {impact.targetDebt.name}
                </span>
                {' '}({impact.targetDebt.apr}% APR)
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
