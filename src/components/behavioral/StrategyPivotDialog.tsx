/**
 * Strategy Pivot Dialog Component
 * 
 * Level-up dialog that suggests switching from Debt Snowball
 * to Debt Avalanche after achieving 30+ day consistency streak.
 */

import { Trophy, TrendingUp, Flame, Target, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface StrategyPivotDialogProps {
  open: boolean;
  currentStreak: number;
  currentStrategy: 'Snowball' | 'Avalanche';
  onDismiss: () => void;
  onSwitch: (strategy: 'Snowball' | 'Avalanche') => void;
}

export function StrategyPivotDialog({
  open,
  currentStreak,
  currentStrategy,
  onDismiss,
  onSwitch,
}: StrategyPivotDialogProps) {
  // Calculate streak percentage (cap at 100 for display)
  const streakPercentage = Math.min((currentStreak / 30) * 100, 100);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDismiss()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2">
            <Trophy className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl text-center">
            Level Up! You're Ready for the Next Step
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            You've proven incredible financial discipline!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Streak Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">30-Day Streak Progress</span>
              <span className="font-semibold text-primary">{currentStreak} days</span>
            </div>
            <Progress value={streakPercentage} className="h-3" />
            <div className="flex items-center justify-center gap-2 text-sm">
              <Flame className="h-4 w-4 text-accent" />
              <span className="text-muted-foreground">
                {currentStreak >= 30 ? 'Legendary streak achieved!' : `${30 - currentStreak} days to legend`}
              </span>
            </div>
          </div>

          {/* Strategy Comparison */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Consider switching from <span className="font-semibold">Debt Snowball</span> to{' '}
              <span className="font-semibold">Debt Avalanche</span> to save more on interest.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Snowball */}
              <div className="bg-card border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Snowball</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Quick psychological wins</li>
                  <li>✓ Builds momentum</li>
                  <li>✓ Great for motivation</li>
                </ul>
              </div>

              {/* Avalanche */}
              <div className="bg-card border-2 border-primary rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Avalanche</span>
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    Suggested
                  </span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Saves the most money</li>
                  <li>✓ Mathematically optimal</li>
                  <li>✓ For disciplined heroes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Encouragement */}
          <div className="flex items-start gap-3 bg-success/5 border border-success/20 rounded-lg p-3">
            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <Trophy className="h-4 w-4 text-success" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">
                Your {currentStreak}-day streak proves you're ready!
              </p>
              <p className="text-muted-foreground">
                Disciplined heroes like you can maximize savings with Avalanche.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => onSwitch('Snowball')}
            className="flex-1"
          >
            Stay with Snowball
          </Button>
          <Button
            onClick={() => onSwitch('Avalanche')}
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            Switch to Avalanche
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
