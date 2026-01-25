/**
 * Regrouping Banner
 * 
 * Heroic reassurance banner displayed when the Moat needs repairs.
 * Uses calming colors and encouraging copy to reinforce the protective purpose.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMoatStatus } from '@/hooks/useMoatStatus';
import { useHeroProfile } from '@/hooks/useHeroProfile';
import { formatRepairTimeline } from '@/lib/recoveryEngine';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface RegroupingBannerProps {
  className?: string;
}

export function RegroupingBanner({ className }: RegroupingBannerProps) {
  const navigate = useNavigate();
  const { 
    recoveryState, 
    repairPlan, 
    dismissBanner, 
    activateRepairMode,
  } = useMoatStatus();
  
  const { savingsVault } = useHeroProfile();
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate repair progress
  const currentBalance = savingsVault.moat_balance || 0;
  const targetBalance = savingsVault.moat_target || 1000;
  const remaining = Math.max(0, targetBalance - currentBalance);
  const progressPercent = recoveryState.fortressIntegrity;
  
  const handleOptimizeClick = () => {
    activateRepairMode();
    navigate('/budgets?mode=repair');
  };

  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('w-full', className)}
    >
      <Card className="border-2 overflow-hidden border-primary/30 bg-white dark:bg-card">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between bg-primary/10">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold uppercase tracking-wide text-sm text-primary">
              Status: Rebuilding
            </span>
            <Badge variant="outline" className="text-xs border-primary/50 text-primary">
              Fund Protected
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={dismissBanner}
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <CardContent className="p-4 space-y-4">
          {/* Main Message */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                Emergency Fund
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your emergency fund protected you from new debt. Now, let's focus on 
                rebuilding it back to your goal.
              </p>
            </div>
          </div>
          
          {/* Repair Progress Bar */}
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {formatCurrency(currentBalance)} of {formatCurrency(targetBalance)}
              </span>
              <span className="text-primary font-semibold">
                {progressPercent}%
              </span>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {formatCurrency(remaining)} remaining to reach your goal
              </p>
              {progressPercent >= 75 && (
                <p className="text-xs text-primary font-medium">
                  Almost there!
                </p>
              )}
            </div>
          </div>
          
          {/* Expandable Repair Plan */}
          {repairPlan && repairPlan.affectedCategories.length > 0 && (
            <>
              <Button
                variant="ghost"
                className="w-full justify-between px-3 py-2 h-auto"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  View Recovery Plan
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            Non-Essential Spending
                          </p>
                          <p className="text-lg font-bold">
                            {formatCurrency(repairPlan.nonEssentialTotal)}/mo
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            Suggested Adjustment (15%)
                          </p>
                          <p className="text-lg font-bold text-success">
                            -{formatCurrency(repairPlan.suggestedCutAmount)}/mo
                          </p>
                        </div>
                      </div>
                      
                      {/* Days to Repair */}
                      <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">
                            Estimated Recovery Time
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {formatRepairTimeline(repairPlan.daysToRepair)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Category Breakdown */}
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                          Categories Affected
                        </p>
                        <div className="space-y-2">
                          {repairPlan.affectedCategories.slice(0, 5).map((cat) => (
                            <div 
                              key={cat.category}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {cat.category}
                              </span>
                              <span>
                                {formatCurrency(cat.currentSpend)} → {' '}
                                <span className="text-success font-medium">
                                  {formatCurrency(cat.newAmount)}
                                </span>
                                {' '}
                                <span className="text-xs text-muted-foreground">
                                  (-{formatCurrency(cat.suggestedCut)})
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
          
          {/* Action Button */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button 
              onClick={handleOptimizeClick}
              className="flex-1 sm:flex-none"
            >
              View Budget
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
