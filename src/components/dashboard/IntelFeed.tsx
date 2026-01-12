/**
 * Intel Feed Component
 * 
 * Container for dynamic behavioral cards with staggered Framer Motion animations.
 * Cards unlock progressively based on user engagement milestones.
 */

import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <h2 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary animate-pulse" />
          Intel Feed
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>

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
          className="text-center text-sm text-muted-foreground"
        >
          {!canShowConsistencyXP && (
            <p>📊 Consistency tracker unlocks after 48 hours of activity</p>
          )}
          {!canShowShadowBudget && (
            <p>👻 Shadow budget unlocks after logging 3 transactions</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
