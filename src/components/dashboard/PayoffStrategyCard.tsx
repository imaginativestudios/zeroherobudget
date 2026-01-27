/**
 * Payoff Strategy Card
 * 
 * Two-section card that separates:
 * 1. "Your Current Path" - Current debt payoff situation with total debt display
 * 2. "What-If Simulator" - Interactive exploration of strategy/payment changes
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ArrowRight, 
  TrendingUp,
  Snowflake,
  Flame,
  Lightbulb,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { formatCurrency } from '@/lib/utils';
import { FUNCTIONAL_COPY, HEROIC_SUBTEXTS } from '@/lib/functionalVocabulary';
import { simulatePayoff } from '@/lib/debtCalculations';
import type { Debt } from '@/hooks/useLocalDebts';
import type { DebtItem } from '@/lib/debtCalculations';
import { cn } from '@/lib/utils';

interface PayoffStrategyCardProps {
  debts: Debt[];
  debtItems: DebtItem[];
  leftover: number;
  strategy: 'Snowball' | 'Avalanche';
  freedomDate: string;
  animationDelay?: number;
}

export function PayoffStrategyCard({
  debts,
  debtItems,
  leftover,
  strategy,
  freedomDate,
  animationDelay = 0,
}: PayoffStrategyCardProps) {
  // Simulator state
  const [simulatedStrategy, setSimulatedStrategy] = useState<'Snowball' | 'Avalanche'>(strategy);
  const [simulatedExtra, setSimulatedExtra] = useState([0]);

  const activeDebts = debts.filter(d => d.balance > 0);
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.balance, 0);

  // Calculate current path (baseline)
  const currentPath = useMemo(() => {
    const activeDebtItems = debtItems.filter(d => d.balance > 0);
    if (activeDebtItems.length === 0 || leftover <= 0) return null;
    
    const result = simulatePayoff(activeDebtItems, leftover, strategy);
    const months = result.timeline.length;
    
    return {
      months,
      totalInterest: result.totalInterest,
      date: result.timeline[months - 1]?.label || 'Debt Free!',
    };
  }, [debtItems, leftover, strategy]);

  // Calculate simulated impact
  const simulatedImpact = useMemo(() => {
    const activeDebtItems = debtItems.filter(d => d.balance > 0);
    if (activeDebtItems.length === 0 || leftover <= 0) return null;
    
    // Current scenario (baseline)
    const current = simulatePayoff(activeDebtItems, leftover, strategy);
    
    // Simulated scenario (with changes)
    const simulated = simulatePayoff(
      activeDebtItems, 
      leftover + simulatedExtra[0], 
      simulatedStrategy
    );
    
    const currentMonths = current.timeline.length;
    const simulatedMonths = simulated.timeline.length;
    
    return {
      newDate: simulated.timeline[simulatedMonths - 1]?.label || 'Debt Free!',
      newMonths: simulatedMonths,
      newInterest: simulated.totalInterest,
      monthsSaved: currentMonths - simulatedMonths,
      interestSaved: current.totalInterest - simulated.totalInterest,
      hasChanges: simulatedStrategy !== strategy || simulatedExtra[0] > 0,
    };
  }, [debtItems, leftover, strategy, simulatedStrategy, simulatedExtra]);

  // Calculate max slider value based on leftover
  const maxExtraPayment = Math.max(500, Math.min(2000, leftover * 2));

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: animationDelay, duration: 0.4 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card className="shadow-royal hover-lift h-full bg-white dark:bg-card">
        <CardHeader className="pb-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {FUNCTIONAL_COPY.strategy}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              {HEROIC_SUBTEXTS.strategy}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {activeDebts.length > 0 ? (
            <>
              {/* Section 1: Your Current Path */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Current Path
                  </span>
                </div>
                
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  {/* Total Debt Display */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Total Debt</span>
                    <span className="text-lg font-bold text-destructive">
                      {formatCurrency(totalDebt)}
                    </span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Debt-Free By</span>
                    <Badge variant="secondary" className="text-xs">
                      {strategy === 'Snowball' ? (
                        <><Snowflake className="h-3 w-3 mr-1" /> Snowball</>
                      ) : (
                        <><Flame className="h-3 w-3 mr-1" /> Avalanche</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {currentPath?.date || freedomDate}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{currentPath?.months || '—'} months</span>
                    <span>•</span>
                    <span className="text-destructive">
                      {formatCurrency(currentPath?.totalInterest || 0)} interest
                    </span>
                  </div>
                  
                  {/* Total You'll Pay */}
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Total You'll Pay</span>
                      <span className="font-medium">
                        {formatCurrency(totalDebt + (currentPath?.totalInterest || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section 2: What-If Simulator */}
              {leftover > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      What-If Simulator
                    </span>
                  </div>

                  {/* Strategy Toggle */}
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">Try a different strategy:</span>
                    <ToggleGroup 
                      type="single" 
                      value={simulatedStrategy}
                      onValueChange={(value) => value && setSimulatedStrategy(value as 'Snowball' | 'Avalanche')}
                      className="w-full justify-start gap-2"
                    >
                      <ToggleGroupItem 
                        value="Snowball" 
                        aria-label="Snowball strategy"
                        className={cn(
                          "flex-1 min-h-[44px] text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                          simulatedStrategy === 'Snowball' && strategy !== 'Snowball' && "ring-2 ring-primary ring-offset-2"
                        )}
                      >
                        <Snowflake className="h-3 w-3 mr-1" />
                        Snowball
                      </ToggleGroupItem>
                      <ToggleGroupItem 
                        value="Avalanche" 
                        aria-label="Avalanche strategy"
                        className={cn(
                          "flex-1 min-h-[44px] text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                          simulatedStrategy === 'Avalanche' && strategy !== 'Avalanche' && "ring-2 ring-primary ring-offset-2"
                        )}
                      >
                        <Flame className="h-3 w-3 mr-1" />
                        Avalanche
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  {/* Extra Payment Slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Add extra payment:</span>
                      <span className="text-sm font-bold text-primary">
                        +{formatCurrency(simulatedExtra[0])}/mo
                      </span>
                    </div>
                    <Slider
                      value={simulatedExtra}
                      onValueChange={setSimulatedExtra}
                      min={0}
                      max={maxExtraPayment}
                      step={25}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$0</span>
                      <span>{formatCurrency(maxExtraPayment)}</span>
                    </div>
                  </div>

                  {/* Results Panel */}
                  {simulatedImpact?.hasChanges && (
                    <div className={cn(
                      "p-3 rounded-lg border-2 transition-all duration-300",
                      (simulatedImpact.monthsSaved > 0 || simulatedImpact.interestSaved > 0)
                        ? "border-success bg-success/10"
                        : "border-primary bg-primary/5"
                    )}>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        With these changes:
                      </p>
                      <p className="text-lg font-bold text-primary mb-1">
                        {simulatedImpact.newDate}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        {simulatedImpact.monthsSaved > 0 && (
                          <span className="text-success font-medium">
                            -{simulatedImpact.monthsSaved} month{simulatedImpact.monthsSaved !== 1 ? 's' : ''}
                          </span>
                        )}
                        {simulatedImpact.interestSaved > 0 && (
                          <span className="text-success font-medium">
                            -{formatCurrency(simulatedImpact.interestSaved)} interest
                          </span>
                        )}
                        {simulatedImpact.monthsSaved === 0 && simulatedImpact.interestSaved <= 0 && (
                          <span className="text-muted-foreground">
                            No significant change
                          </span>
                        )}
                      </div>
                      {/* Simulated Total Paid */}
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Total Paid</span>
                          <span className="font-medium text-success">
                            {formatCurrency(totalDebt + (simulatedImpact.newInterest || 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-3 px-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    Increase income or reduce expenses to unlock the simulator.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <p className="font-medium text-success">Debt-Free!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Focus on growing your emergency fund.
              </p>
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="w-full min-h-[44px]"
            asChild
          >
            <Link to="/debts">
              View Full Strategy <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
