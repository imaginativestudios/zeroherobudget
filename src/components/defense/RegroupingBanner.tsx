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
      <Card className="border-2 overflow-hidden border-amber-200 bg-slate-100">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between bg-amber-50/80">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            <span className="font-bold uppercase tracking-wide text-sm text-amber-700">
              Status: Regrouping
            </span>
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
              Defenses Active
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
            <div className="p-2 rounded-lg bg-amber-100">
              <Shield className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                The Moat Has Done Its Duty
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your fortress protected you from new debt. Now, let's focus on 
                tactical repairs to get your defenses back to 100%.
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
              variant="ghost" 
              onClick={handleViewWarMap}
              className="flex-1 sm:flex-none text-muted-foreground"
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
