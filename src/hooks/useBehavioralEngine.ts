/**
 * Behavioral Engine Hook
 * 
 * Provides reactive access to behavioral calculations and triggers.
 * Monitors local data changes and provides contextual coaching insights.
 */

import { useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { useLocalExpenses } from './useLocalExpenses';
import { useLocalDebts } from './useLocalDebts';
import { useLocalTransactions } from './useLocalTransactions';
import { useIncome } from './useLocalSettings';
import { useUserLocalStorage } from './useUserLocalStorage';
import {
  calculateSurplusPower,
  calculateShadowCost,
  calculateConsistencyScore,
  checkBudgetCompliance,
  getHighestInterestRate,
  getSurvivalCategories,
  SurplusPowerResult,
  ShadowCostResult,
  ConsistencyScoreResult,
  BudgetComplianceResult,
} from '@/lib/behavioralEngine';

export interface StoredStreakData {
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
}

export interface BehavioralEngineResult {
  // Core calculations
  surplusPower: SurplusPowerResult;
  consistencyScore: ConsistencyScoreResult;
  budgetCompliance: BudgetComplianceResult;
  highestInterestRate: number;
  
  // Shadow cost calculator
  getShadowCost: (amount: number) => ShadowCostResult;
  
  // Utility data
  survivalCategories: string[];
  currentMonth: string;
  
  // Loading states
  isLoading: boolean;
  
  // Hero Tips based on current state
  heroTips: string[];
  
  // Shadow Budget alerts for recent transactions
  shadowAlerts: Array<{
    transactionId: string;
    description: string;
    amount: number;
    shadowCost: ShadowCostResult;
  }>;
}

export function useBehavioralEngine(): BehavioralEngineResult {
  const { expenses, isLoading: expensesLoading } = useLocalExpenses();
  const { debts, isLoading: debtsLoading } = useLocalDebts();
  const { transactions, isLoading: transactionsLoading } = useLocalTransactions();
  const [income] = useIncome();
  const [storedStreak, setStoredStreak] = useUserLocalStorage<StoredStreakData>(
    'bdt_consistency_streak',
    { currentStreak: 0, longestStreak: 0, lastLogDate: null }
  );

  const currentMonth = format(new Date(), 'yyyy-MM');
  const isLoading = expensesLoading || debtsLoading || transactionsLoading;

  // Calculate surplus power
  const surplusPower = useMemo(() => {
    return calculateSurplusPower(expenses, debts, income);
  }, [expenses, debts, income]);

  // Get highest interest rate for shadow cost calculations
  const highestInterestRate = useMemo(() => {
    return getHighestInterestRate(debts);
  }, [debts]);

  // Shadow cost calculator function
  const getShadowCost = useCallback((amount: number): ShadowCostResult => {
    return calculateShadowCost(amount, highestInterestRate);
  }, [highestInterestRate]);

  // Calculate consistency score
  const consistencyScore = useMemo(() => {
    const result = calculateConsistencyScore(transactions, storedStreak);
    
    // Update stored streak if it changed
    if (
      result.currentStreak !== storedStreak.currentStreak ||
      result.longestStreak !== storedStreak.longestStreak ||
      result.lastLogDate !== storedStreak.lastLogDate
    ) {
      setStoredStreak({
        currentStreak: result.currentStreak,
        longestStreak: result.longestStreak,
        lastLogDate: result.lastLogDate,
      });
    }
    
    return result;
  }, [transactions, storedStreak, setStoredStreak]);

  // Check budget compliance
  const budgetCompliance = useMemo(() => {
    return checkBudgetCompliance(expenses, transactions, currentMonth);
  }, [expenses, transactions, currentMonth]);

  // Generate shadow alerts for recent non-survival spending
  const shadowAlerts = useMemo(() => {
    if (highestInterestRate <= 0) return [];
    
    const survivalCategories = getSurvivalCategories();
    const recentNonSurvival = transactions
      .filter(t => {
        const isRecent = t.date.startsWith(currentMonth);
        const isExpense = t.flow === 'out';
        const isDiscretionary = !survivalCategories.includes(t.category);
        return isRecent && isExpense && isDiscretionary;
      })
      .slice(0, 5); // Last 5 discretionary expenses

    return recentNonSurvival.map(t => ({
      transactionId: t.id,
      description: t.description,
      amount: t.amount,
      shadowCost: calculateShadowCost(t.amount, highestInterestRate),
    }));
  }, [transactions, highestInterestRate, currentMonth]);

  // Compile hero tips based on current state
  const heroTips = useMemo(() => {
    const tips: string[] = [];

    // Surplus power tip
    tips.push(surplusPower.heroMessage);

    // Consistency tip
    tips.push(consistencyScore.heroMessage);

    // Budget compliance tip with heroic vocabulary
    if (!budgetCompliance.isUnderBudget) {
      tips.push(
        `⚠️ Survival deployment is $${Math.abs(budgetCompliance.variance).toFixed(0)} in Tactical Overstretch. Review essential expenses.`
      );
    } else if (budgetCompliance.variance > 0) {
      tips.push(
        `✅ You're $${budgetCompliance.variance.toFixed(0)} in Strategic Surplus on survival! Consider redirecting to slay debts.`
      );
    }

    // Shadow budget reminder if there are discretionary expenses
    if (shadowAlerts.length > 0 && highestInterestRate > 0) {
      const totalShadowCost = shadowAlerts.reduce(
        (sum, alert) => sum + alert.shadowCost.shadowCost,
        0
      );
      const totalOriginal = shadowAlerts.reduce(
        (sum, alert) => sum + alert.amount,
        0
      );
      tips.push(
        `💭 Your ${shadowAlerts.length} recent discretionary purchases cost $${totalOriginal.toFixed(0)} but have a shadow cost of $${totalShadowCost.toFixed(0)}.`
      );
    }

    return tips;
  }, [surplusPower, consistencyScore, budgetCompliance, shadowAlerts, highestInterestRate]);

  return {
    surplusPower,
    consistencyScore,
    budgetCompliance,
    highestInterestRate: highestInterestRate * 100, // Return as percentage
    getShadowCost,
    survivalCategories: getSurvivalCategories(),
    currentMonth,
    isLoading,
    heroTips,
    shadowAlerts,
  };
}
