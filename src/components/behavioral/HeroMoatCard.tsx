/**
 * Hero's Sanctuary Card
 * 
 * Visualizes the user's progress toward their first $1,000 emergency fund.
 * Uses a growing sanctuary metaphor with peaceful restoration themes.
 */

import { useState } from 'react';
import { Heart, Droplets, Shield, Plus, Check, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useHeroProfile } from '@/hooks/useHeroProfile';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

export function HeroMoatCard() {
  const { 
    moatProgress, 
    moatRemaining, 
    isMoatComplete,
    addToMoat,
    profile 
  } = useHeroProfile();
  
  const [addAmount, setAddAmount] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddToMoat = () => {
    const amount = parseFloat(addAmount);
    if (!isNaN(amount) && amount > 0) {
      const wasComplete = isMoatComplete;
      addToMoat(amount);
      setAddAmount('');
      setDialogOpen(false);
      
      // Trigger celebration if just completed
      if (!wasComplete && profile.moat_current + amount >= profile.moat_target) {
        triggerCelebration();
      }
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0D7377', '#FF6B35', '#14919B', '#FFD700'],
    });
  };

  // Calculate filled segments (10 segments = $100 each)
  const filledSegments = Math.floor(moatProgress / 10);
  const partialFill = (moatProgress % 10) / 10;

  // Milestone messages
  const getMilestoneMessage = () => {
    if (isMoatComplete) return "Your emergency fund is complete! You're protected from unexpected expenses.";
    if (moatProgress >= 75) return "Almost there! Your emergency fund is nearly complete.";
    if (moatProgress >= 50) return "Halfway to your goal! Keep building.";
    if (moatProgress >= 25) return "Good progress! Your emergency fund is growing.";
    if (moatProgress > 0) return "Every dollar adds more security.";
    return "Start building your emergency fund today.";
  };

  return (
    <Card className={cn(
      "h-full transition-all duration-500",
      isMoatComplete && "ring-2 ring-success/50 bg-gradient-to-br from-success/5 to-transparent"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Emergency Fund
          </span>
          {isMoatComplete ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Safe
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              ${profile.moat_current.toLocaleString()} / ${profile.moat_target.toLocaleString()}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Progress - Water Rising */}
        <div className="relative">
          {/* Segment Indicators */}
          <div className="flex gap-1 mb-2">
            {Array.from({ length: 10 }).map((_, i) => {
              const isFilled = i < filledSegments;
              const isPartial = i === filledSegments && partialFill > 0;
              
              return (
                <div 
                  key={i}
                  className={cn(
                    "flex-1 h-3 rounded-sm transition-all duration-300",
                    isFilled 
                      ? "bg-primary" 
                      : isPartial 
                        ? "bg-primary/40" 
                        : "bg-muted"
                  )}
                  style={isPartial ? {
                    background: `linear-gradient(to right, hsl(var(--primary)) ${partialFill * 100}%, hsl(var(--muted)) ${partialFill * 100}%)`
                  } : undefined}
                />
              );
            })}
          </div>
          
          {/* Progress Bar */}
          <Progress 
            value={moatProgress} 
            className={cn(
              "h-2",
              isMoatComplete && "[&>div]:bg-success"
            )}
          />
          
          {/* Milestone Markers */}
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>$0</span>
            <span>$250</span>
            <span>$500</span>
            <span>$750</span>
            <span>$1,000</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Droplets className={cn(
              "h-4 w-4",
              isMoatComplete ? "text-success" : "text-primary"
            )} />
            <span className={cn(
              "font-semibold",
              isMoatComplete ? "text-success" : "text-foreground"
            )}>
              {moatProgress.toFixed(0)}% Protected
            </span>
          </div>
          {!isMoatComplete && (
            <span className="text-muted-foreground">
              ${moatRemaining.toLocaleString()} to go
            </span>
          )}
        </div>

        {/* Milestone Message */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {getMilestoneMessage()}
        </p>

        {/* Action Button */}
        {isMoatComplete ? (
          <div className="flex items-center justify-center gap-2 py-2 text-success">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium text-sm">Fund Complete!</span>
            <Sparkles className="h-4 w-4" />
          </div>
        ) : (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Savings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Add to Emergency Fund
                </DialogTitle>
                <DialogDescription>
                  How much have you saved toward your emergency fund?
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <CurrencyInput
                  prefix="$"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  min="0"
                  step="1"
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Current: ${profile.moat_current.toLocaleString()} • 
                  Remaining: ${moatRemaining.toLocaleString()}
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddToMoat} disabled={!addAmount || parseFloat(addAmount) <= 0}>
                  <Check className="h-4 w-4 mr-2" />
                  Add ${addAmount || '0'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
