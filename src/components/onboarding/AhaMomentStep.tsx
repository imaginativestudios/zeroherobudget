import { motion } from 'framer-motion';
import { Calendar, Clock, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { HeroTip } from './HeroTip';
import { calculateFreedomImpact, translateToHumanTime } from '@/lib/debtInsights';
import { DebtItem } from '@/lib/debtCalculations';

interface AhaMomentStepProps {
  hourlyWage: number | null;
  debt: {
    name: string;
    balance: number;
    apr: number;
    minimumPayment: number;
  } | null;
  onContinue: () => void;
  isDemoMode?: boolean;
}

export function AhaMomentStep({ hourlyWage, debt, onContinue, isDemoMode }: AhaMomentStepProps) {
  // Calculate freedom metrics if we have debt data
  const hasDebt = debt && debt.balance > 0;
  
  let freedomDate = 'Your journey begins!';
  let hoursReclaimed = 0;
  let interestSaved = 0;
  let targetDebtName = '';
  
  if (hasDebt) {
    const debtItem: DebtItem = {
      id: 'primary',
      name: debt.name,
      balance: debt.balance,
      apr: debt.apr,
      min: debt.minimumPayment,
      type: 'credit_card',
    };
    
    // Calculate impact with a modest $100 extra payment
    const impact = calculateFreedomImpact([debtItem], 0, 100, 'Snowball');
    freedomDate = impact.baselineFreedomDateFormatted;
    interestSaved = impact.totalInterestSaved;
    targetDebtName = debt.name;
    
    // Translate to hours using their hourly wage
    const humanTime = translateToHumanTime(
      impact.baselineInterest, 
      hourlyWage || 25
    );
    hoursReclaimed = Math.round(humanTime.hours);
  }
  
  const wage = hourlyWage || 25;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', duration: 0.5 }}
      className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg"
    >
      {/* Icon */}
      <motion.div 
        className="flex justify-center mb-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-accent/20 rounded-full flex items-center justify-center">
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div 
        className="text-center mb-6 sm:mb-8"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          Your Freedom Path
        </h1>
        <p className="text-muted-foreground">
          Based on what you told us, here's your path to financial freedom
        </p>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 mb-6"
      >
        {hasDebt ? (
          <>
            {/* Freedom Date Card */}
            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Freedom Date
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {freedomDate}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                When you'll pay off {targetDebtName}
              </p>
            </div>

            {/* Hours Reclaimed Card */}
            <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Work Hours Reclaimed
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {hoursReclaimed.toLocaleString()} Hours
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                By avoiding interest at ${wage}/hour
              </p>
            </div>

            {/* First Target Card */}
            <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/20">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-destructive" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  First Target
                </span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {targetDebtName}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ${debt.balance.toLocaleString()} @ {debt.apr}% APR
              </p>
            </div>
          </>
        ) : (
          /* No Debt - Clean Slate Message */
          <div className="bg-primary/10 rounded-xl p-6 border border-primary/20 text-center">
            <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-2">
              You're Starting Strong!
            </h3>
            <p className="text-muted-foreground">
              You can add debts later, or focus on building your emergency fund first.
              {hourlyWage && (
                <span className="block mt-2 text-accent font-medium">
                  At ${hourlyWage}/hour, every dollar you save is time you're buying back.
                </span>
              )}
            </p>
          </div>
        )}
      </motion.div>

      {/* Hero Tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <HeroTip>
          Every day you track is a day closer to financial freedom.
        </HeroTip>
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Button
          onClick={onContinue}
          className="w-full h-12"
          size="lg"
        >
          {isDemoMode ? 'Continue to Demo' : 'Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
