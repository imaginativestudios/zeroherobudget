/**
 * Shadow Impact Card
 * 
 * Enhanced purchase decision UI that shows the true cost of non-essential
 * expenses and provides "Hero Choice" buttons.
 */

import { useState } from 'react';
import { Swords, Clock, Zap, ArrowRight, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBehavioralEngine } from '@/hooks/useBehavioralEngine';
import { getSurvivalCategories, translateToHumanTime, calculateTrueCost } from '@/lib/debtInsights';
import { useLocalDebts } from '@/hooks/useLocalDebts';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { formatCurrency } from '@/lib/constants';
import { soundEffects } from '@/lib/soundEffects';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface ShadowImpactCardProps {
  amount: number;
  category: string;
  flow: 'in' | 'out';
  description?: string;
  hourlyWage?: number;
  onSkipAndPayDebt?: () => void;
  onBuyAnyway?: () => void;
}

export function ShadowImpactCard({ 
  amount, 
  category, 
  flow, 
  description,
  hourlyWage = 25,
  onSkipAndPayDebt,
  onBuyAnyway 
}: ShadowImpactCardProps) {
  const [hasChosen, setHasChosen] = useState(false);
  const { highestInterestRate } = useBehavioralEngine();
  const { debts } = useLocalDebts();
  const [income] = useUserLocalStorage("bdt_income", 0);
  const [expenses] = useUserLocalStorage("bdt_expenses", []);
  const [strategy] = useUserLocalStorage("bdt_strategy", "Snowball");

  // Calculate leftover budget
  const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + (expense.planned || 0), 0);
  const leftover = Math.max(0, (income || 0) - totalExpenses);

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

  // Calculate true cost and time impact
  const trueCostData = calculateTrueCost(
    amount,
    debts.map(d => ({
      id: d.id,
      name: d.name,
      balance: d.balance,
      apr: d.interest_rate,
      min: d.minimum_payment,
      type: d.type,
    })),
    leftover,
    strategy as 'Snowball' | 'Avalanche'
  );

  const humanTime = translateToHumanTime(trueCostData.opportunityCost, hourlyWage);

  // Don't show if no meaningful opportunity cost
  if (trueCostData.opportunityCost <= 1) {
    return null;
  }

  const handleSkipAndPayDebt = () => {
    setHasChosen(true);
    
    // Celebratory feedback
    soundEffects.heroChoice();
    haptics.success();
    
    // Fire confetti
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#FFD700', '#FFA500', '#0D7377', '#14B8A6'],
    });
    
    // Show success toast
    toast.success("Hero Move!", {
      description: `${formatCurrency(amount)} redirected to debt payoff. You're ${humanTime.displayString} closer to freedom!`,
    });
    
    onSkipAndPayDebt?.();
  };

  const handleBuyAnyway = () => {
    setHasChosen(true);
    onBuyAnyway?.();
  };

  if (hasChosen) {
    return null;
  }

  return (
    <Card className={cn(
      'border-2 border-warning/40 bg-gradient-to-br from-warning/5 to-background',
      'animate-in fade-in-50 slide-in-from-top-2 duration-300'
    )}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-warning/20">
            <Swords className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">Hero's Choice</h4>
            <p className="text-xs text-muted-foreground">A moment of tactical decision</p>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-2 gap-3">
          {/* Purchase Side */}
          <div className="p-3 rounded-lg border border-border bg-background space-y-2 text-center">
            <Ghost className="h-6 w-6 mx-auto text-muted-foreground" />
            <div className="text-lg font-bold text-foreground">
              {formatCurrency(amount)}
            </div>
            <div className="text-xs text-muted-foreground">
              {description || 'This Purchase'}
            </div>
            <div className="text-xs text-destructive font-medium">
              True Cost: {formatCurrency(trueCostData.trueCost)}
            </div>
          </div>

          {/* Time Side */}
          <div className="p-3 rounded-lg border-2 border-primary/30 bg-primary/5 space-y-2 text-center">
            <Clock className="h-6 w-6 mx-auto text-primary" />
            <div className="text-lg font-bold text-primary">
              {humanTime.displayString}
            </div>
            <div className="text-xs text-muted-foreground">
              If you skip & pay debt
            </div>
            {trueCostData.monthsDelayed > 0 && (
              <div className="text-xs text-primary font-medium">
                {trueCostData.monthsDelayed} month{trueCostData.monthsDelayed > 1 ? 's' : ''} closer to freedom
              </div>
            )}
          </div>
        </div>

        {/* Insight */}
        <div className="p-2 rounded-lg bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground">
            <Zap className="inline h-3 w-3 text-warning mr-1" />
            This {formatCurrency(amount)} becomes {formatCurrency(trueCostData.trueCost)} with your {highestInterestRate.toFixed(1)}% debt interest.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="royal"
            className="w-full gap-2"
            onClick={handleSkipAndPayDebt}
          >
            <Swords className="h-4 w-4" />
            Skip & Pay Debt
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleBuyAnyway}
          >
            Buy Anyway
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
