/**
 * Debt Victory Modal
 * 
 * Celebratory modal displayed when a debt is fully paid off.
 * Shows confetti, victory message, and next target suggestion.
 */

import { useEffect } from 'react';
import { Sword, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

interface DebtVictoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debtName: string;
  interestSaved?: number;
  nextDebt?: {
    name: string;
    balance: number;
  } | null;
  onViewBattlePlan?: () => void;
}

export function DebtVictoryModal({
  open,
  onOpenChange,
  debtName,
  interestSaved = 0,
  nextDebt,
  onViewBattlePlan,
}: DebtVictoryModalProps) {
  // Trigger confetti when modal opens
  useEffect(() => {
    if (open) {
      // First burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6B35', '#0D7377', '#14919B'],
      });
      
      // Second burst (delayed)
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FF6B35'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#0D7377', '#14919B'],
        });
      }, 250);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 relative">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-warning to-accent",
              "animate-pulse shadow-lg"
            )}>
              <Sword className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-6 w-6 text-warning animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-warning" />
            VANQUISHED!
            <Trophy className="h-6 w-6 text-warning" />
          </DialogTitle>
          <DialogDescription className="text-center text-lg pt-2">
            You've slain <span className="font-semibold text-foreground">{debtName}</span>!
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Stats */}
          {interestSaved > 0 && (
            <Card className="bg-success/10 border-success/20">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Interest Saved</p>
                <p className="text-2xl font-bold text-success">
                  ${interestSaved.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Victory Message */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              One less balance foe standing between you and financial freedom.
            </p>
            <div className="flex items-center justify-center gap-2 text-warning">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Legendary Achievement Unlocked</span>
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          {/* Next Target */}
          {nextDebt && (
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Next Target
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{nextDebt.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${nextDebt.balance.toLocaleString()} remaining
                    </p>
                  </div>
                  <Sword className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Celebrate Later
          </Button>
          {onViewBattlePlan && (
            <Button onClick={onViewBattlePlan} className="flex-1">
              View Battle Plan
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
