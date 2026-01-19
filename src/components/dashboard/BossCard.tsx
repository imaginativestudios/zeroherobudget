/**
 * Boss Card Component
 * 
 * The central focal point of the dashboard showing the current target debt
 * with a massive "Strike" button for extra payments.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Zap, 
  CreditCard, 
  Landmark, 
  TrendingDown,
  Clock,
  Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Debt } from '@/hooks/useLocalDebts';
import { StrikePaymentModal } from './StrikePaymentModal';
import { cn } from '@/lib/utils';
import { simulatePayoff } from '@/lib/debtCalculations';

interface BossCardProps {
  debt: Debt;
  strategy: 'Snowball' | 'Avalanche';
  extraBudget: number;
  allDebts: Debt[];
  onPaymentMade?: (amount: number) => void;
}

export function BossCard({ 
  debt, 
  strategy, 
  extraBudget, 
  allDebts,
  onPaymentMade 
}: BossCardProps) {
  const [strikeModalOpen, setStrikeModalOpen] = useState(false);

  // Calculate progress and estimated payoff
  const originalBalance = debt.balance; // In real app, track original balance
  const progressPercentage = 0; // Would need original balance tracking
  
  // Calculate days to slay this debt
  const debtItems = allDebts.map(d => ({
    id: d.id,
    name: d.name,
    balance: d.balance,
    min: d.minimum_payment,
    apr: d.interest_rate,
    type: d.type as 'card' | 'loan'
  }));
  
  const schedule = simulatePayoff(debtItems, extraBudget, strategy);
  const thisDebtSchedule = schedule.perDebt.find(d => d.id === debt.id);
  const monthsToPayoff = thisDebtSchedule?.months ?? null;
  
  // High interest warning
  const isHighInterest = debt.interest_rate > 20;
  
  // Get icon based on debt type
  const DebtIcon = debt.type === 'card' ? CreditCard : Landmark;

  return (
    <>
      <Card 
        className={cn(
          "relative overflow-hidden shadow-royal hover-lift h-full flex flex-col",
          isHighInterest && "ring-1 ring-destructive/20"
        )}
      >
        {/* Placeholder to match MoatBuilder badge space for consistent alignment */}
        <div className="px-6 pt-4 pb-0" aria-hidden="true">
          <span className="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold invisible">
            &nbsp;
          </span>
        </div>
        
        <CardHeader className="p-6 pb-2 pt-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                isHighInterest ? "bg-destructive/10" : "bg-primary/10"
              )}>
                <DebtIcon className={cn(
                  "w-6 h-6",
                  isHighInterest ? "text-destructive" : "text-primary"
                )} />
              </div>
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Target className="w-4 h-4 text-accent" />
                  Current Target
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {strategy === 'Avalanche' ? 'Highest Interest' : 'Lowest Balance'}
                </p>
              </div>
            </div>
            
            {isHighInterest && (
              <Badge variant="destructive" className="gap-1">
                <Flame className="w-3 h-3" />
                High Interest
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-6 pt-0 space-y-6 flex-1 flex flex-col">
          {/* Debt Name & Balance */}
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              {debt.name}
            </h3>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-bold text-primary">
                ${debt.balance.toLocaleString()}
              </span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-sm",
                  isHighInterest ? "border-destructive text-destructive" : "border-muted"
                )}
              >
                {debt.interest_rate}% APR
              </Badge>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Minimum Payment
              </p>
              <p className="text-lg font-semibold">
                ${debt.minimum_payment.toLocaleString()}/mo
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Time to Slay
              </p>
              <p className="text-lg font-semibold">
                {monthsToPayoff !== null 
                  ? `${monthsToPayoff} months` 
                  : 'Calculating...'}
              </p>
            </div>
            
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Extra Budget
              </p>
              <p className="text-lg font-semibold text-success">
                +${extraBudget.toLocaleString()}/mo
              </p>
            </div>
          </div>

          {/* Progress Bar (visual only for now) */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Journey Progress</span>
              <span className="font-medium">
                {thisDebtSchedule?.totalInterest 
                  ? `$${thisDebtSchedule.totalInterest.toLocaleString()} interest saved` 
                  : 'Begin clearing!'}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* CLEAR SHADOW Button */}
          <motion.div
            className="mt-auto pt-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="lg"
              className={cn(
                "w-full h-14 text-lg font-bold gap-3",
                "bg-gradient-to-r from-accent to-accent/80",
                "hover:from-accent/90 hover:to-accent/70",
                "shadow-lg"
              )}
              onClick={() => setStrikeModalOpen(true)}
            >
              <Zap className="w-6 h-6" />
              CLEAR SHADOW — Make Extra Payment
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      <StrikePaymentModal
        open={strikeModalOpen}
        onOpenChange={setStrikeModalOpen}
        debt={debt}
        allDebts={allDebts}
        onPaymentMade={onPaymentMade}
      />
    </>
  );
}
