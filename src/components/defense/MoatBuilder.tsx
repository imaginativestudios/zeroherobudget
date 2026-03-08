/**
 * Emergency Fund Builder
 * 
 * Emergency fund visualization with:
 * - Animated water reservoir using Framer Motion
 * - Evolving icons based on progress
 * - Current Focus highlighting when fund < $1,000
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Shield, 
  TrendingUp, 
  Shield, 
  Plus, 
  Check, 
  Droplets,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useHeroProfile } from '@/hooks/useHeroProfile';
import { calculateMoatHealth, MOAT_MILESTONES, type CastleLevel } from '@/lib/moatCalculations';
import { cn } from '@/lib/utils';
import { FortressLevelBadge } from './FortressLevelBadge';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { soundEffects, playAchievementUnlockSound } from '@/lib/soundEffects';
import { haptics } from '@/lib/haptics';

interface MoatBuilderProps {
  variant?: 'card' | 'full';
  showPrimaryQuestBadge?: boolean;
}

export function MoatBuilder({ 
  variant = 'card', 
  showPrimaryQuestBadge = false 
}: MoatBuilderProps) {
  const { 
    profile,
    addToMoat,
    achievedMilestones,
  } = useHeroProfile();
  
  const [addAmount, setAddAmount] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const moatHealth = calculateMoatHealth(profile.moat_current, profile.moat_target);

  const triggerMilestoneCelebration = (milestone: 25 | 50 | 75 | 100) => {
    const milestoneData = MOAT_MILESTONES[milestone];
    
    // Haptic feedback
    haptics.success();
    
    // Tiered confetti based on milestone
    if (milestone === 100) {
      // Epic celebration - continuous from both sides
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const colors = ['#0D7377', '#FF6B35', '#14919B', '#FFD700', '#10B981'];
      
      const frame = () => {
        confetti({ 
          particleCount: 4, 
          angle: 60, 
          spread: 55, 
          origin: { x: 0 }, 
          colors 
        });
        confetti({ 
          particleCount: 4, 
          angle: 120, 
          spread: 55, 
          origin: { x: 1 }, 
          colors 
        });
        if (Date.now() < animationEnd) requestAnimationFrame(frame);
      };
      frame();
      playAchievementUnlockSound('epic');
    } else if (milestone === 75 || milestone === 50) {
      // Milestone celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0D7377', '#FF6B35', '#14919B'],
      });
      playAchievementUnlockSound('milestone');
    } else {
      // Basic celebration for 25%
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0D7377', '#14919B'],
      });
      soundEffects.moatMilestone();
    }
    
    // Toast notification
    toast.success(milestoneData.title, {
      description: milestoneData.message,
      icon: milestoneData.icon,
      duration: 5000,
    });
  };

  const handleAddToMoat = () => {
    const amount = parseFloat(addAmount);
    if (!isNaN(amount) && amount > 0) {
      // addToMoat returns newly achieved milestones
      const newlyAchieved = addToMoat(amount);
      setAddAmount('');
      setDialogOpen(false);
      
      // Trigger celebrations for each milestone (staggered)
      newlyAchieved.forEach((milestone, index) => {
        setTimeout(() => {
          triggerMilestoneCelebration(milestone as 25 | 50 | 75 | 100);
        }, index * 800);
      });
    }
  };

  // Get castle icon based on level
  const getCastleIcon = (level: CastleLevel) => {
    const iconClass = cn(
      "transition-all duration-500",
      variant === 'full' ? "h-16 w-16" : "h-12 w-12"
    );
    
    switch (level) {
      case 1: // 0-25% - Wood Cabin (Vulnerable)
        return <Home className={cn(iconClass, "text-muted-foreground")} />;
      case 2: // 26-50% - Small Tower
        return <Building className={cn(iconClass, "text-primary/60")} />;
      case 3: // 51-75% - Castle
        return <Castle className={cn(iconClass, "text-primary")} />;
      case 4: // 76-100% - Stone Fortress
        return (
          <div className="relative">
            <Castle className={cn(iconClass, moatHealth.status === 'secure' ? "text-success" : "text-primary")} />
            <Shield className={cn(
              "absolute -bottom-1 -right-1",
              variant === 'full' ? "h-6 w-6" : "h-5 w-5",
              moatHealth.status === 'secure' ? "text-success" : "text-primary"
            )} />
          </div>
        );
    }
  };

  return (
    <Card 
      className={cn(
        "shadow-royal hover-lift overflow-hidden h-full flex flex-col bg-white dark:bg-card",
        moatHealth.status === 'secure' && "ring-1 ring-success/30",
        showPrimaryQuestBadge && "ring-1 ring-warning/30",
        variant === 'full' && "col-span-full"
      )}
    >
      {/* Current Focus Badge - inside the card */}
      {showPrimaryQuestBadge && (
        <div className="px-6 pt-4 pb-0">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-warning/10 text-warning text-sm font-semibold rounded-full">
            🎯 CURRENT FOCUS
          </span>
        </div>
      )}
      
      <CardHeader className={cn("p-6 pb-2", showPrimaryQuestBadge && "pt-3", variant === 'full' && "pb-4")}>
        <CardTitle className={cn(
          "font-medium flex items-center justify-between",
          variant === 'full' ? "text-lg" : "text-sm"
        )}>
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-2">
              <Castle className="h-5 w-5 text-primary" />
              Emergency Fund
            </span>
            <span className="text-xs font-normal text-muted-foreground">Build your $1,000 safety net</span>
          </div>
          <FortressLevelBadge 
            level={moatHealth.castleLevel}
            isSecure={moatHealth.status === 'secure'}
            size="sm"
          />
        </CardTitle>
      </CardHeader>
      
      <CardContent className={cn("p-6 pt-0 space-y-4 flex-1 flex flex-col", variant === 'full' && "space-y-6")}>
        {/* Castle Evolution and Water Reservoir */}
        <div className={cn(
          "flex gap-4",
          variant === 'full' ? "flex-row items-center" : "flex-col items-center"
        )}>
          {/* Evolving Castle Icon */}
          <div className="flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={moatHealth.castleLevel}
                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative"
              >
                {getCastleIcon(moatHealth.castleLevel)}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Water Reservoir Visualization */}
          <div className={cn(
            "relative bg-muted/50 rounded-lg border-2 border-muted overflow-hidden",
            variant === 'full' ? "flex-1 h-24" : "w-full h-20"
          )}>
            {/* Water Level with Animation */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-primary/80"
              initial={{ height: 0 }}
              animate={{ height: `${moatHealth.percentage}%` }}
              transition={{ 
                type: "spring", 
                stiffness: 50, 
                damping: 15,
                duration: 0.8 
              }}
            >
              {/* Wave Effect */}
              <svg 
                className="absolute top-0 left-0 right-0 h-3 -translate-y-2 text-primary/80" 
                viewBox="0 0 100 10" 
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M0,5 Q12.5,0 25,5 T50,5 T75,5 T100,5 V10 H0 Z"
                  fill="currentColor"
                  animate={{ x: [0, -25, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                />
              </svg>
              
              {/* Ripple bubbles effect */}
              {moatHealth.percentage > 10 && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Droplets className="h-6 w-6 text-white/40" />
                </motion.div>
              )}
            </motion.div>
            
            {/* Percentage Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span 
                className={cn(
                  "font-bold",
                  variant === 'full' ? "text-2xl" : "text-xl",
                  moatHealth.percentage > 50 ? "text-white" : "text-foreground"
                )}
                key={moatHealth.percentage}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {moatHealth.percentage.toFixed(0)}%
              </motion.span>
            </div>
            
            {/* Milestone Markers with achieved badges */}
            <div className="absolute inset-0">
              {[25, 50, 75].map((milestone) => {
                const isAchieved = achievedMilestones.includes(milestone) || moatHealth.percentage >= milestone;
                return (
                  <div
                    key={milestone}
                    className="absolute h-full"
                    style={{ left: `${milestone}%` }}
                  >
                    <div className={cn(
                      "absolute top-1 -translate-x-1/2 text-xs rounded-full px-1.5 py-0.5 font-medium",
                      isAchieved 
                        ? "bg-success/20 text-success" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isAchieved ? "✓" : `${milestone}%`}
                    </div>
                    <div className={cn(
                      "h-full border-l-2",
                      isAchieved 
                        ? "border-success/50 border-solid" 
                        : "border-dashed border-muted-foreground/20"
                    )} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Droplets className={cn(
              "h-4 w-4",
              moatHealth.status === 'secure' ? "text-success" : "text-primary"
            )} />
            <span className={cn(
              "font-semibold",
              moatHealth.status === 'secure' ? "text-success" : "text-foreground"
            )}>
              {moatHealth.statusLabel}
            </span>
          </div>
          {moatHealth.status !== 'secure' && (
            <span className="text-muted-foreground">
              ${(profile.moat_target - profile.moat_current).toLocaleString()} to go
            </span>
          )}
        </div>
        
        {/* Message */}
        <p className={cn(
          "text-muted-foreground leading-relaxed",
          variant === 'full' ? "text-base" : "text-sm"
        )}>
          {moatHealth.message}
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 mt-auto">
          {moatHealth.status === 'secure' ? (
            <div className="flex items-center justify-center gap-2 py-2 text-success w-full min-h-[44px]">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium text-sm">Emergency Fund Complete!</span>
              <Sparkles className="h-4 w-4" />
            </div>
          ) : (
            <>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" className="flex-1 min-h-[44px]">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Savings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Castle className="h-5 w-5 text-primary" />
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
                      Remaining: ${(profile.moat_target - profile.moat_current).toLocaleString()}
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
              
              <Button variant="outline" className="flex-1 min-h-[44px]" asChild>
                <Link to="/debts">
                  View Debt Strategy
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
