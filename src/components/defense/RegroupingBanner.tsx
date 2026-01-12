/**
 * Regrouping Banner
 * 
 * Tactical alert displayed when the Moat has a breach.
 * Includes a repair calculator showing how to refill the moat.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Shield, 
  Calendar,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMoatStatus } from '@/hooks/useMoatStatus';
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
    isVulnerable,
  } = useMoatStatus();
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleOptimizeClick = () => {
    activateRepairMode();
    navigate('/budget?mode=repair');
  };
  
  const handleViewWarMap = () => {
    navigate('/budget');
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
      <Card className={cn(
        'border-2 overflow-hidden',
        isVulnerable 
          ? 'border-destructive/50 bg-destructive/5' 
          : 'border-warning/50 bg-warning/5'
      )}>
        {/* Header */}
        <div className={cn(
          'px-4 py-3 flex items-center justify-between',
          isVulnerable ? 'bg-destructive/10' : 'bg-warning/10'
        )}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn(
              'h-5 w-5',
              isVulnerable ? 'text-destructive' : 'text-warning'
            )} />
            <span className={cn(
              'font-bold uppercase tracking-wide text-sm',
              isVulnerable ? 'text-destructive' : 'text-warning'
            )}>
              {isVulnerable ? 'Critical Alert' : 'Tactical Alert'}
            </span>
            <Badge variant="outline" className={cn(
              'text-xs',
              isVulnerable 
                ? 'border-destructive/30 text-destructive' 
                : 'border-warning/30 text-warning'
            )}>
              {recoveryState.fortressIntegrity}% Integrity
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
            <div className={cn(
              'p-2 rounded-lg',
              isVulnerable ? 'bg-destructive/10' : 'bg-warning/10'
            )}>
              <Shield className={cn(
                'h-6 w-6',
                isVulnerable ? 'text-destructive' : 'text-warning'
              )} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                Breach Detected: Your Moat has dropped to {formatCurrency(recoveryState.fortressIntegrity * 10)}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {isVulnerable 
                  ? 'Your Fortress Integrity is critically compromised. Immediate tactical shift required.'
                  : 'Your Fortress Integrity is compromised. We are prioritizing repairs this month.'}
              </p>
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
                  <Wrench className="h-4 w-4" />
                  View Repair Plan
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
                            Suggested Tactical Shift (15%)
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
                            Estimated Repair Time
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
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button 
              onClick={handleOptimizeClick}
              className="flex-1 sm:flex-none"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Optimize for Repair
            </Button>
            <Button 
              variant="outline" 
              onClick={handleViewWarMap}
              className="flex-1 sm:flex-none"
            >
              View War Map
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
