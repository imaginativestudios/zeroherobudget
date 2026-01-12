/**
 * Behavioral Event Trigger Engine - Phase 1: Logic & State Management
 * 
 * This module provides core calculations for proactive debt-repayment coaching:
 * - Surplus Power: Money available after survival expenses and debt minimums
 * - Shadow Budget: True cost of discretionary spending in terms of debt payoff
 * - Consistency Score: Streak tracking for positive financial behaviors
 */

import { Expense } from '@/hooks/useLocalExpenses';
import { Debt } from '@/hooks/useLocalDebts';
import { Transaction } from '@/hooks/useLocalTransactions';
import { format, differenceInDays, parseISO, startOfDay, subDays } from 'date-fns';

// Categories considered "survival" expenses (non-negotiable)
const SURVIVAL_CATEGORIES = [
  'Housing',
  'Utilities',
  'Food',
  'Insurance & Healthcare',
  'Transportation',
];

export interface SurplusPowerResult {
  totalIncome: number;
  survivalExpenses: number;
  debtMinimums: number;
  surplusPower: number;
  surplusPercentage: number;
  isPositive: boolean;
  heroMessage: string;
}

export interface ShadowCostResult {
  originalAmount: number;
  shadowCost: number;
  potentialSavings: number;
  monthsToPayoff: number;
  interestRate: number;
  heroTip: string;
}

export interface ConsistencyScoreResult {
  currentStreak: number;
  longestStreak: number;
  todayLogged: boolean;
  lastLogDate: string | null;
  streakLevel: 'novice' | 'apprentice' | 'warrior' | 'hero' | 'legend';
  heroMessage: string;
}

export interface BudgetComplianceResult {
  isUnderBudget: boolean;
  budgetedAmount: number;
  actualSpending: number;
  variance: number;
  variancePercentage: number;
  daysCompliant: number;
}

/**
 * Calculate Surplus Power - the money available for aggressive debt payoff
 * Formula: Income - (Survival Expenses + Debt Minimums)
 */
export function calculateSurplusPower(
  expenses: Expense[],
  debts: Debt[],
  monthlyIncome: number
): SurplusPowerResult {
  // Calculate total income from expense items marked as income
  const incomeFromExpenses = expenses
    .filter(e => e.is_income)
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalIncome = monthlyIncome > 0 ? monthlyIncome : incomeFromExpenses;

  // Calculate survival expenses (only non-income items in survival categories)
  const survivalExpenses = expenses
    .filter(e => !e.is_income && SURVIVAL_CATEGORIES.includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);

  // Calculate total minimum debt payments
  const debtMinimums = debts.reduce((sum, d) => sum + d.minimum_payment, 0);

  // Calculate surplus power
  const surplusPower = totalIncome - survivalExpenses - debtMinimums;
  const surplusPercentage = totalIncome > 0 ? (surplusPower / totalIncome) * 100 : 0;
  const isPositive = surplusPower > 0;

  // Generate contextual hero message
  let heroMessage: string;
  if (surplusPower <= 0) {
    heroMessage = "🔴 Alert: Your survival costs exceed your income. Let's find areas to cut or ways to boost income.";
  } else if (surplusPercentage < 10) {
    heroMessage = "🟡 Tight margins! Every dollar of surplus counts. Consider the Shadow Budget before discretionary spending.";
  } else if (surplusPercentage < 25) {
    heroMessage = `🟢 You have $${surplusPower.toFixed(0)} in Surplus Power! This could accelerate your debt payoff significantly.`;
  } else {
    heroMessage = `🦸 Hero Status! Your $${surplusPower.toFixed(0)} surplus is ${surplusPercentage.toFixed(0)}% of income. You're positioned for rapid debt elimination!`;
  }

  return {
    totalIncome,
    survivalExpenses,
    debtMinimums,
    surplusPower,
    surplusPercentage,
    isPositive,
    heroMessage,
  };
}

/**
 * Calculate Shadow Cost - the true cost of discretionary spending
 * Shows what an expense truly costs if that money was instead used for debt payoff
 * 
 * @param amount - The discretionary expense amount
 * @param highestInterestRate - The highest APR among debts (as decimal, e.g., 0.24 for 24%)
 * @param months - Time horizon for calculation (default 12 months)
 */
export function calculateShadowCost(
  amount: number,
  highestInterestRate: number,
  months: number = 12
): ShadowCostResult {
  if (amount <= 0 || highestInterestRate <= 0) {
    return {
      originalAmount: amount,
      shadowCost: amount,
      potentialSavings: 0,
      monthsToPayoff: 0,
      interestRate: highestInterestRate * 100,
      heroTip: "No debt impact to calculate.",
    };
  }

  // Calculate compound interest that would accrue on this amount if left as debt
  // Using monthly compounding: FV = PV * (1 + r/12)^n
  const monthlyRate = highestInterestRate / 12;
  const futureValue = amount * Math.pow(1 + monthlyRate, months);
  const shadowCost = futureValue;
  const potentialSavings = futureValue - amount;

  // Estimate how many months this amount could accelerate debt payoff
  // Simplified: additional months of principal reduction
  const monthsToPayoff = months;

  // Generate contextual hero tip
  const percentage = ((potentialSavings / amount) * 100).toFixed(0);
  let heroTip: string;
  
  if (potentialSavings > amount * 0.2) {
    heroTip = `⚠️ Shadow Alert: This $${amount.toFixed(0)} purchase really costs $${shadowCost.toFixed(0)} when you factor in ${(highestInterestRate * 100).toFixed(1)}% APR debt. That's ${percentage}% more!`;
  } else if (potentialSavings > amount * 0.1) {
    heroTip = `💭 Consider: Redirecting this $${amount.toFixed(0)} to debt saves you $${potentialSavings.toFixed(0)} in interest over ${months} months.`;
  } else {
    heroTip = `📊 FYI: This $${amount.toFixed(0)} has a shadow cost of $${shadowCost.toFixed(0)} when considering debt interest.`;
  }

  return {
    originalAmount: amount,
    shadowCost,
    potentialSavings,
    monthsToPayoff,
    interestRate: highestInterestRate * 100,
    heroTip,
  };
}

/**
 * Get the highest interest rate from a list of debts
 */
export function getHighestInterestRate(debts: Debt[]): number {
  if (debts.length === 0) return 0;
  return Math.max(...debts.map(d => d.interest_rate)) / 100; // Convert from percentage to decimal
}

/**
 * Calculate Consistency Score - tracks positive financial behavior streaks
 * Monitors consecutive days of transaction logging or budget compliance
 */
export function calculateConsistencyScore(
  transactions: Transaction[],
  storedStreak?: { currentStreak: number; longestStreak: number; lastLogDate: string | null }
): ConsistencyScoreResult {
  const today = startOfDay(new Date());
  
  // Get unique dates with transactions
  const transactionDates = new Set(
    transactions.map(t => format(parseISO(t.date), 'yyyy-MM-dd'))
  );

  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
  
  const todayLogged = transactionDates.has(todayStr);
  
  // Calculate current streak by looking backwards from today/yesterday
  let currentStreak = 0;
  let checkDate = todayLogged ? today : subDays(today, 1);
  
  // Only start counting if today or yesterday has a transaction
  if (todayLogged || transactionDates.has(yesterdayStr)) {
    while (transactionDates.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
  }

  // Get longest streak (preserve from storage or calculate)
  const longestStreak = storedStreak?.longestStreak 
    ? Math.max(storedStreak.longestStreak, currentStreak)
    : currentStreak;

  // Get last log date
  const sortedDates = [...transactionDates].sort().reverse();
  const lastLogDate = sortedDates[0] || null;

  // Determine streak level
  let streakLevel: ConsistencyScoreResult['streakLevel'];
  if (currentStreak >= 30) {
    streakLevel = 'legend';
  } else if (currentStreak >= 14) {
    streakLevel = 'hero';
  } else if (currentStreak >= 7) {
    streakLevel = 'warrior';
  } else if (currentStreak >= 3) {
    streakLevel = 'apprentice';
  } else {
    streakLevel = 'novice';
  }

  // Generate motivational message
  let heroMessage: string;
  switch (streakLevel) {
    case 'legend':
      heroMessage = `🏆 LEGENDARY! ${currentStreak} days of consistent tracking! You've mastered financial awareness.`;
      break;
    case 'hero':
      heroMessage = `🦸 Hero streak! ${currentStreak} days strong. Your consistency is building unstoppable momentum!`;
      break;
    case 'warrior':
      heroMessage = `⚔️ Warrior mode! ${currentStreak} day streak. Keep fighting for financial freedom!`;
      break;
    case 'apprentice':
      heroMessage = `📈 Great start! ${currentStreak} days logged. You're building a powerful habit.`;
      break;
    default:
      if (!todayLogged) {
        heroMessage = "💪 Log today's transactions to start building your streak!";
      } else {
        heroMessage = "🌱 Day 1 begins! Every hero's journey starts with a single step.";
      }
  }

  return {
    currentStreak,
    longestStreak,
    todayLogged,
    lastLogDate,
    streakLevel,
    heroMessage,
  };
}

/**
 * Check budget compliance for survival categories
 * Returns whether user is staying under their budgeted survival expenses
 */
export function checkBudgetCompliance(
  expenses: Expense[],
  transactions: Transaction[],
  monthStr: string
): BudgetComplianceResult {
  // Get budgeted survival expenses
  const survivalBudget = expenses
    .filter(e => !e.is_income && SURVIVAL_CATEGORIES.includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);

  // Get actual survival spending this month
  const actualSpending = transactions
    .filter(t => {
      const isCurrentMonth = t.date.startsWith(monthStr);
      const isSurvivalCategory = SURVIVAL_CATEGORIES.includes(t.category);
      return isCurrentMonth && t.flow === 'out' && isSurvivalCategory;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const variance = survivalBudget - actualSpending;
  const variancePercentage = survivalBudget > 0 ? (variance / survivalBudget) * 100 : 0;
  const isUnderBudget = actualSpending <= survivalBudget;

  // Calculate days compliant (simplified - just current status)
  const daysCompliant = isUnderBudget ? 1 : 0;

  return {
    isUnderBudget,
    budgetedAmount: survivalBudget,
    actualSpending,
    variance,
    variancePercentage,
    daysCompliant,
  };
}

/**
 * Get survival categories constant for external use
 */
export function getSurvivalCategories(): string[] {
  return [...SURVIVAL_CATEGORIES];
}
