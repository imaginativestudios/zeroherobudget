/**
 * Quest Insights Component - Progressive Behavioral Cards
 * 
 * Displays staggered, animated cards that unlock based on user milestones.
 * Part of the Dashboard's progressive disclosure system.
 */

import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SurplusPowerCard } from '@/components/behavioral/SurplusPowerCard';
import { ShadowBudgetSummary } from '@/components/behavioral/ShadowBudgetSummary';
import { FreedomTimelineWidget } from '@/components/behavioral/FreedomTimelineWidget';
import { DebtItem } from '@/lib/debtCalculations';

interface IntelFeedProps {
  canShowShadowBudget: boolean;
  canShowFreedom: boolean;
  debts: DebtItem[];
  extraBudget: number;
  strategy: 'Snowball' | 'Avalanche';
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, x: -30, scale: 0.95 },
  show: { 
    opacity: 1, x: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 }
  },
} as const;

export function IntelFeed({
  canShowShadowBudget,
  canShowFreedom,
  debts,
  extraBudget,
  strategy,
}: IntelFeedProps) {
  const visibleCardCount = 1 + (canShowShadowBudget ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-foreground">Financial Insights</h2>
        <Badge variant="outline" className="text-xs ml-2">
          {visibleCardCount + (canShowFreedom && debts.length > 0 ? 1 : 0)}/{3} unlocked
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6" role="status" aria-live="polite">
        Insights earned through financial discipline
      </p>

      {/* Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={`grid gap-4 items-stretch ${
          visibleCardCount === 1 
            ? 'grid-cols-1' 
            : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        <motion.div variants={cardVariants}>
          <SurplusPowerCard />
        </motion.div>

        {canShowShadowBudget && (
          <motion.div variants={cardVariants}>
            <ShadowBudgetSummary />
          </motion.div>
        )}
      </motion.div>

      {/* Freedom Timeline */}
      {canShowFreedom && debts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <FreedomTimelineWidget debts={debts} extraBudget={extraBudget} strategy={strategy} />
        </motion.div>
      )}
    </div>
  );
}
