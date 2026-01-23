/**
 * Strike Payment Modal
 * 
 * Modal for making extra debt payments with shadow cost visualization.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, DollarSign, Clock, TrendingDown, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Debt, useLocalDebts } from '@/hooks/useLocalDebts';
import { calculateFreedomImpact, translateToHumanTime } from '@/lib/freedomEngine';
import { useHeroProfile } from '@/hooks/useHeroProfile';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { haptics } from '@/lib/haptics';

interface StrikePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: Debt;
  allDebts: Debt[];
  onPaymentMade?: (amount: number) => void;
}

export function StrikePaymentModal({
  open,
  onOpenChange,
  debt,
  allDebts,
  onPaymentMade,
}: StrikePaymentModalProps) {
  const [amount, setAmount] = useState('');
  const { updateDebt } = useLocalDebts();
  const { profile } = useHeroProfile();

  const paymentAmount = parseFloat(amount) || 0;
  
  // Calculate impact of this payment
  const impact = useMemo(() => {
    if (paymentAmount <= 0) return null;
    
    const debtItems = allDebts.map(d => ({
      id: d.id,
      name: d.name,
      balance: d.balance,
      min: d.minimum_payment,
      apr: d.interest_rate,
      type: d.type as 'card' | 'loan'
    }));
    
    const result = calculateFreedomImpact(debtItems, 0, paymentAmount, 'Snowball');
    return result;
    
  }, [paymentAmount, allDebts]);

  // Translate to human time
  const humanTime = useMemo(() => {
    if (!impact) return null;
    return translateToHumanTime(impact.totalInterestSaved, profile.hourly_wage || 25);
  }, [impact, profile.hourly_wage]);

  const handleStrike = () => {
    if (paymentAmount <= 0) return;
    
    const newBalance = Math.max(0, debt.balance - paymentAmount);
    updateDebt(debt.id, { balance: newBalance });
    
    // Celebration effects
    haptics.success();
    
    if (newBalance === 0) {
      // Debt completely paid off!
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#0D7377', '#FF6B35', '#14919B', '#FFD700'],
      });
      toast.success('DEBT PAID OFF!', {
        description: `${debt.name} has been completely eliminated!`,
        icon: '🎉',
        duration: 5000,
      });
    } else {
      // Regular payment
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0D7377', '#14919B'],
      });
      toast.success('Strike Landed!', {
        description: `$${paymentAmount.toLocaleString()} dealt to ${debt.name}`,
        icon: '⚡',
      });
    }
    
    onPaymentMade?.(paymentAmount);
    setAmount('');
    onOpenChange(false);
  };

  // Quick amount buttons
  const quickAmounts = [50, 100, 250, 500];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Strike {debt.name}
          </DialogTitle>
          <DialogDescription>
            Make an extra payment to accelerate your debt payoff.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Balance Display */}
          <div className="p-3 rounded-lg bg-muted/50 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <span className="font-bold text-lg">${debt.balance.toLocaleString()}</span>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Amount</label>
            <CurrencyInput
              prefix="$"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl h-14 font-bold"
              min="0"
              max={debt.balance}
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2 flex-wrap">
            {quickAmounts.map((quickAmount) => (
              <Button
                key={quickAmount}
                variant={paymentAmount === quickAmount ? "default" : "outline"}
                size="sm"
                onClick={() => setAmount(quickAmount.toString())}
              >
                ${quickAmount}
              </Button>
            ))}
            <Button
              variant={paymentAmount === debt.balance ? "default" : "outline"}
              size="sm"
              onClick={() => setAmount(debt.balance.toString())}
            >
              Pay Off (${debt.balance.toLocaleString()})
            </Button>
          </div>

          {/* Impact Preview */}
          <AnimatePresence mode="wait">
            {paymentAmount > 0 && impact && humanTime && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="p-4 rounded-lg bg-gradient-to-br from-success/10 to-transparent border border-success/20">
                  <h4 className="font-semibold text-success flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4" />
                    Impact of This Strike
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Interest Saved
                      </p>
                      <p className="text-lg font-bold text-success">
                        ${impact.totalInterestSaved.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Time Reclaimed
                      </p>
                      <p className="text-lg font-bold text-success">
                        {humanTime.displayString}
                      </p>
                    </div>
                  </div>
                  
                  {impact.monthsSaved > 0 && (
                    <div className="mt-3 pt-3 border-t border-success/20">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        Payoff accelerated by{' '}
                        <span className="font-semibold text-success">
                          {impact.monthsSaved} month{impact.monthsSaved !== 1 ? 's' : ''}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* New Balance Preview */}
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">New Balance</span>
                  <span className={cn(
                    "font-bold text-lg",
                    debt.balance - paymentAmount === 0 && "text-success"
                  )}>
                    ${Math.max(0, debt.balance - paymentAmount).toLocaleString()}
                    {debt.balance - paymentAmount === 0 && (
                      <span className="ml-2 text-success">🎉</span>
                    )}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleStrike}
            disabled={paymentAmount <= 0 || paymentAmount > debt.balance}
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            Strike for ${paymentAmount.toLocaleString()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
