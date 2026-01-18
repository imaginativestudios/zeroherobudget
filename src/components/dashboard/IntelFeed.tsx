/**
 * Quest Insights Component - Progressive Behavioral Cards
 * 
 * Displays staggered, animated cards that unlock based on user milestones.
 * Part of the Dashboard's progressive disclosure system.
 */

import { motion } from 'framer-motion';
import { Compass, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SurplusPowerCard } from '@/components/behavioral/SurplusPowerCard';
import { StreakTrackerWidget } from '@/components/behavioral/StreakTrackerWidget';
import { ShadowBudgetSummary } from '@/components/behavioral/ShadowBudgetSummary';
import { FreedomTimelineWidget } from '@/components/behavioral/FreedomTimelineWidget';
import { DebtItem } from '@/lib/debtCalculations';

interface IntelFeedProps {
  canShowConsistencyXP: boolean;
  canShowShadowBudget: boolean;
  canShowFreedom: boolean;
  debts: DebtItem[];
  extraBudget: number;
  strategy: 'Snowball' | 'Avalanche';
}

// Animation variants for staggered card entrance
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
} as const;

const cardVariants = {
  hidden: { 
    opacity: 0, 
    x: -30, 
    scale: 0.95 
  },
  show: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { 
      type: "spring" as const, 
      stiffness: 300, 
      damping: 25 
    }
  },
} as const;

export function IntelFeed({
  canShowConsistencyXP,
  canShowShadowBudget,
  canShowFreedom,
  debts,
  extraBudget,
  strategy,
}: IntelFeedProps) {
  // Count visible cards for grid layout
  const visibleCardCount = 1 + // Surplus Power (always visible)
    (canShowConsistencyXP ? 1 : 0) +
    (canShowShadowBudget ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-foreground">Quest Insights</h2>
        <Badge variant="outline" className="text-xs ml-2">
          {visibleCardCount}/4 unlocked
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6" role="status" aria-live="polite">
        Your journey's wisdom—insights earned through financial discipline
      </p>

      {/* Cards Grid with Staggered Animation */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={`grid gap-4 items-stretch ${
          visibleCardCount === 1 
            ? 'grid-cols-1' 
            : visibleCardCount === 2 
              ? 'grid-cols-1 sm:grid-cols-2' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {/* Surplus Power - Always Visible */}
        <motion.div variants={cardVariants}>
          <SurplusPowerCard />
        </motion.div>

        {/* Consistency XP Bar - Visible after 48 hours */}
        {canShowConsistencyXP && (
          <motion.div variants={cardVariants}>
            <StreakTrackerWidget />
          </motion.div>
        )}

        {/* Shadow Budget - Visible after 3+ transactions */}
        {canShowShadowBudget && (
          <motion.div variants={cardVariants}>
            <ShadowBudgetSummary />
          </motion.div>
        )}
      </motion.div>

      {/* Freedom Timeline - Full Width, Visible when debts exist */}
      {canShowFreedom && debts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <FreedomTimelineWidget
            debts={debts}
            extraBudget={extraBudget}
            strategy={strategy}
          />
        </motion.div>
      )}

      {/* Unlock Hints */}
      {(!canShowConsistencyXP || !canShowShadowBudget) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 mt-4"
        >
          {!canShowConsistencyXP && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
              <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consistency XP</p>
                <p className="text-xs text-muted-foreground/70">Wisdom unlocks after 48 hours on your quest</p>
              </div>
            </div>
          )}
          {!canShowShadowBudget && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
              <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shadow Budget</p>
                <p className="text-xs text-muted-foreground/70">Reveal the shadow after 3 transactions logged</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
