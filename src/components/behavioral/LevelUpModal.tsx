/**
 * Level Up Modal
 * 
 * Triggers when consistencyScore > 75 and user is on Snowball strategy.
 * Shows personalized savings data and encourages switch to Avalanche.
 */

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Swords, TrendingUp, Sparkles } from 'lucide-react';
import { formatTriggerCurrency } from '@/lib/behavioralTriggers';

interface HighestInterestDebt {
  name: string;
  balance: number;
  interest_rate: number;
}

interface LevelUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consistencyScore: number;
  highestInterestDebt: HighestInterestDebt | null;
  annualSavings: number;
  currentStrategy: 'Snowball' | 'Avalanche';
  onSwitch: () => void;
  onDismiss: () => void;
}

export function LevelUpModal({
  open,
  onOpenChange,
  consistencyScore,
  highestInterestDebt,
  annualSavings,
  onSwitch,
  onDismiss,
}: LevelUpModalProps) {
  // Trigger golden confetti on open
  useEffect(() => {
    if (open) {
      // Golden confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6B35', '#DAA520'],
      });
      
      // Second burst after a short delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { y: 0.5, x: 0.3 },
          colors: ['#FFD700', '#FFA500', '#FF6B35'],
        });
        confetti({
          particleCount: 50,
          spread: 100,
          origin: { y: 0.5, x: 0.7 },
          colors: ['#FFD700', '#FFA500', '#FF6B35'],
        });
      }, 200);
    }
  }, [open]);

  const handleSwitch = () => {
    onSwitch();
    onOpenChange(false);
  };

  const handleDismiss = () => {
    onDismiss();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-2 border-amber-400/50 shadow-[0_0_30px_rgba(255,215,0,0.3)] animate-in zoom-in-95 duration-300">
        <DialogHeader className="text-center space-y-4">
          {/* Animated Trophy Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping bg-amber-400/20 rounded-full" />
              <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 p-4 rounded-full shadow-lg">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-400 animate-pulse" />
            </div>
          </div>
          
          <div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              LEVEL UP!
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              You've proven yourself a <span className="font-semibold text-foreground">Master of Discipline</span> with a{' '}
              <span className="font-bold text-primary">{Math.round(consistencyScore)}%</span> Consistency Score.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Highest Interest Debt Card */}
          {highestInterestDebt && (
            <div className="bg-muted/50 rounded-lg p-4 border border-destructive/20">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
                <Swords className="h-4 w-4" />
                YOUR HIGHEST INTEREST DEBT
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{highestInterestDebt.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTriggerCurrency(highestInterestDebt.balance)} @ {highestInterestDebt.interest_rate}% APR
                  </p>
                </div>
                <div className="text-2xl font-bold text-destructive">
                  {highestInterestDebt.interest_rate}%
                </div>
              </div>
            </div>
          )}

          {/* Savings Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
              <TrendingUp className="h-4 w-4" />
              EXPERT STRATEGY ADVANTAGE
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              By switching to the <span className="font-semibold text-foreground">Avalanche Method</span>, 
              you attack high-interest debts first—the mathematically optimal approach.
            </p>
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">Potential Interest Savings</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {formatTriggerCurrency(annualSavings)}
              </p>
              <p className="text-xs text-muted-foreground">estimated over your payoff period</p>
            </div>
          </div>

          {/* Motivational Text */}
          <p className="text-sm text-center text-muted-foreground italic">
            "A true Slayer doesn't just fight—they fight <span className="font-semibold">smart</span>."
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1 min-h-[44px]"
          >
            Stay the Course
          </Button>
          <Button
            onClick={handleSwitch}
            className="flex-1 min-h-[44px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
          >
            <Swords className="h-4 w-4 mr-2" />
            Adopt Expert Strategy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
