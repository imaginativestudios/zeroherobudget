/**
 * Surplus Strike Modal Component
 * 
 * Celebratory modal that appears when the user has unspent
 * budget surplus, encouraging them to apply it to debt.
 */

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Zap, Target, Calendar, PartyPopper } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatTriggerCurrency } from '@/lib/behavioralTriggers';

interface SurplusStrikeData {
  surplusAmount: number;
  smallestDebtName: string;
  smallestDebtBalance: number;
  daysAccelerated: number;
}

interface SurplusStrikeModalProps {
  data: SurplusStrikeData | null;
  onDismiss: () => void;
  onStrike: () => void;
}

export function SurplusStrikeModal({ data, onDismiss, onStrike }: SurplusStrikeModalProps) {
  // Trigger confetti when modal opens
  useEffect(() => {
    if (data) {
      // Fire confetti from both sides
      const count = 100;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 0.2, y: 0.7 } });
      fire(0.2, { spread: 60, origin: { x: 0.5, y: 0.7 } });
      fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 0.8, y: 0.7 } });
    }
  }, [data]);

  if (!data) return null;

  return (
    <Dialog open={!!data} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-2 animate-bounce">
            <PartyPopper className="h-8 w-8 text-success" />
          </div>
          <DialogTitle className="text-2xl text-center">
            Victory! Unspent Surplus Detected!
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            You have{' '}
            <span className="font-semibold text-success">
              {formatTriggerCurrency(data.surplusAmount)}
            </span>{' '}
            of unspent budget this month!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Target Debt Info */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your smallest debt:</p>
                <p className="font-semibold text-foreground">
                  {data.smallestDebtName}
                </p>
                <p className="text-sm text-primary">
                  Balance: {formatTriggerCurrency(data.smallestDebtBalance)}
                </p>
              </div>
            </div>
          </div>

          {/* Impact Preview */}
          {data.daysAccelerated > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
              <Calendar className="h-4 w-4 text-primary" />
              <span>
                Tap "Strike!" to knock{' '}
                <span className="font-semibold text-primary">
                  {data.daysAccelerated} days
                </span>{' '}
                off your debt-free date!
              </span>
            </div>
          )}

          {/* Motivational Text */}
          <p className="text-sm text-muted-foreground text-center">
            Every extra dollar chips away at interest and builds momentum toward financial freedom.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onStrike}
            className="flex-1 min-h-[44px] bg-gradient-to-r from-primary to-accent hover:opacity-90 order-first"
          >
            <Zap className="h-4 w-4 mr-2" />
            Strike!
          </Button>
          <Button
            variant="outline"
            onClick={onDismiss}
            className="flex-1 min-h-[44px]"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
