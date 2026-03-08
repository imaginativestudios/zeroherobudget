/**
 * Behavioral Engine Hook (Simplified)
 * 
 * Provides reactive access to 2 core concepts:
 * 1. Shadow Cost — true cost of purchases with debt interest
 * 2. Freedom Date — projected debt-free timeline
 * 
 * Plus surplus power and budget compliance for dashboard display.
 */

import { useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { useLocalExpenses } from './useLocalExpenses';
import { useLocalDebts } from './useLocalDebts';
import { useLocalTransactions } from './useLocalTransactions';
import { useIncome } from './useLocalSettings';
import {
  calculateSurplusPower,
  calculateShadowCost,
  checkBudgetCompliance,
  getHighestInterestRate,
  getSurvivalCategories,
  SurplusPowerResult,
  ShadowCostResult,
  BudgetComplianceResult,
} from '@/lib/debtInsights';

export interface BehavioralEngineResult {
  surplusPower: SurplusPowerResult;
  budgetCompliance: BudgetComplianceResult;
  highestInterestRate: number;
  getShadowCost: (amount: number) => ShadowCostResult;
  survivalCategories: string[];
  currentMonth: string;
  isLoading: boolean;
  heroTips: string[];
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

  const currentMonth = format(new Date(), 'yyyy-MM');
  const isLoading = expensesLoading || debtsLoading || transactionsLoading;

  const surplusPower = useMemo(() => {
    return calculateSurplusPower(expenses, debts, income);
  }, [expenses, debts, income]);

  const highestInterestRate = useMemo(() => {
    return getHighestInterestRate(debts);
  }, [debts]);

  const getShadowCost = useCallback((amount: number): ShadowCostResult => {
    return calculateShadowCost(amount, highestInterestRate);
  }, [highestInterestRate]);

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
      .slice(0, 5);

    return recentNonSurvival.map(t => ({
      transactionId: t.id,
      description: t.description,
      amount: t.amount,
      shadowCost: calculateShadowCost(t.amount, highestInterestRate),
    }));
  }, [transactions, highestInterestRate, currentMonth]);

  // Simplified hero tips: surplus power + budget compliance + shadow budget
  const heroTips = useMemo(() => {
    const tips: string[] = [];

    tips.push(surplusPower.heroMessage);

    if (!budgetCompliance.isUnderBudget) {
      tips.push(
        `⚠️ Essential spending is $${Math.abs(budgetCompliance.variance).toFixed(0)} over budget. Review expenses to find savings.`
      );
    } else if (budgetCompliance.variance > 0) {
      tips.push(
        `✅ You're $${budgetCompliance.variance.toFixed(0)} under budget on essentials! Consider putting the extra toward debt.`
      );
    }

    if (shadowAlerts.length > 0 && highestInterestRate > 0) {
      const totalShadowCost = shadowAlerts.reduce((sum, alert) => sum + alert.shadowCost.shadowCost, 0);
      const totalOriginal = shadowAlerts.reduce((sum, alert) => sum + alert.amount, 0);
      tips.push(
        `💭 Your ${shadowAlerts.length} recent discretionary purchases cost $${totalOriginal.toFixed(0)} but have a shadow cost of $${totalShadowCost.toFixed(0)}.`
      );
    }

    return tips;
  }, [surplusPower, budgetCompliance, shadowAlerts, highestInterestRate]);

  return {
    surplusPower,
    budgetCompliance,
    highestInterestRate: highestInterestRate * 100,
    getShadowCost,
    survivalCategories: getSurvivalCategories(),
    currentMonth,
    isLoading,
    heroTips,
    shadowAlerts,
  };
}
