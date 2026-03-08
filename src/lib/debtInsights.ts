/**
 * Debt Insights - Consolidated Financial Engine
 * 
 * Single module exposing 2 user-facing concepts:
 * 1. Shadow Cost — the true cost of purchases when factoring debt interest
 * 2. Freedom Date — projected debt-free timeline and scenario modeling
 * 
 * Plus supporting utilities for budget health, recovery, and behavioral triggers.
 */

import { Expense } from '@/hooks/useLocalExpenses';
import { Debt } from '@/hooks/useLocalDebts';
import { Transaction } from '@/hooks/useLocalTransactions';
import { DebtItem, getDetailedPaymentSchedule } from './debtCalculations';
import { addMonths, format } from 'date-fns';

// =====================================================================
// CONSTANTS
// =====================================================================

const SURVIVAL_CATEGORIES = [
  'Housing',
  'Utilities',
  'Food',
  'Insurance & Healthcare',
  'Transportation',
];

// Trigger cooldown periods in milliseconds
export const TRIGGER_COOLDOWNS = {
  SHADOW_COST: 5 * 60 * 1000,        // 5 minutes between shadow cost toasts
  SURPLUS_STRIKE: 24 * 60 * 60 * 1000, // Once per day for surplus modal
};

// Local storage keys for trigger state
export const TRIGGER_STORAGE_KEYS = {
  SHADOW_COST_LAST: 'bdt_shadow_cost_last_triggered',
  SHADOW_COST_TX_IDS: 'bdt_shadow_cost_shown_tx_ids',
  SURPLUS_STRIKE_LAST: 'bdt_surplus_strike_last_triggered',
};

// =====================================================================
// INTERFACES
// =====================================================================

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

export interface BudgetComplianceResult {
  isUnderBudget: boolean;
  budgetedAmount: number;
  actualSpending: number;
  variance: number;
  variancePercentage: number;
  daysCompliant: number;
}

export interface FreedomImpactResult {
  baselineMonths: number;
  baselineInterest: number;
  baselineFreedomDate: Date;
  newMonths: number;
  newInterest: number;
  newFreedomDate: Date;
  monthsSaved: number;
  totalInterestSaved: number;
  baselineFreedomDateFormatted: string;
  newFreedomDateFormatted: string;
  targetDebt: { name: string; balance: number; apr: number } | null;
}

export interface HumanTimeResult {
  hours: number;
  days: number;
  weeks: number;
  displayString: string;
  heroMessage: string;
}

export interface SliderImpactPoint {
  amount: number;
  months: number;
  date: string;
  interestSaved: number;
  freedomDate: Date;
}

export interface TriggerState {
  shadowCostLastTriggered: number | null;
  shadowCostShownTxIds: string[];
  surplusStrikeLastTriggered: number | null;
}

// Recovery types
export type RecoveryStatus = 'SECURE' | 'REGROUPING' | 'VULNERABLE';

export interface RecoveryState {
  status: RecoveryStatus;
  breachAmount: number;
  breachPercentage: number;
  fortressIntegrity: number;
  previouslySecure: boolean;
  lastSecureDate: string | null;
}

export interface CategoryCut {
  category: string;
  currentSpend: number;
  suggestedCut: number;
  newAmount: number;
}

export interface RepairPlan {
  nonEssentialTotal: number;
  suggestedCutPercentage: number;
  suggestedCutAmount: number;
  dailySavingsRate: number;
  daysToRepair: number;
  weeksToRepair: number;
  affectedCategories: CategoryCut[];
}

// =====================================================================
// SECTION 1: SHADOW COST
// =====================================================================

/**
 * Calculate Shadow Cost — the true cost of discretionary spending
 * when factoring compound interest on existing debt.
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

  const monthlyRate = highestInterestRate / 12;
  const futureValue = amount * Math.pow(1 + monthlyRate, months);
  const potentialSavings = futureValue - amount;
  const percentage = ((potentialSavings / amount) * 100).toFixed(0);

  let heroTip: string;
  if (potentialSavings > amount * 0.2) {
    heroTip = `⚠️ Shadow Alert: This $${amount.toFixed(0)} purchase really costs $${futureValue.toFixed(0)} when you factor in ${(highestInterestRate * 100).toFixed(1)}% APR debt. That's ${percentage}% more!`;
  } else if (potentialSavings > amount * 0.1) {
    heroTip = `💭 Consider: Redirecting this $${amount.toFixed(0)} to debt saves you $${potentialSavings.toFixed(0)} in interest over ${months} months.`;
  } else {
    heroTip = `📊 FYI: This $${amount.toFixed(0)} has a shadow cost of $${futureValue.toFixed(0)} when considering debt interest.`;
  }

  return {
    originalAmount: amount,
    shadowCost: futureValue,
    potentialSavings,
    monthsToPayoff: months,
    interestRate: highestInterestRate * 100,
    heroTip,
  };
}

/**
 * Get the highest interest rate from a list of debts (returns decimal, e.g. 0.24)
 */
export function getHighestInterestRate(debts: Debt[]): number {
  if (debts.length === 0) return 0;
  return Math.max(...debts.map(d => d.interest_rate)) / 100;
}

/**
 * Calculate the "true cost" of a purchase considering opportunity cost of debt payment
 */
export function calculateTrueCost(
  purchaseAmount: number,
  debts: DebtItem[],
  currentExtraBudget: number,
  strategy: 'Snowball' | 'Avalanche' = 'Snowball'
): {
  purchaseAmount: number;
  trueCost: number;
  opportunityCost: number;
  monthsDelayed: number;
} {
  const activeDebts = debts.filter(d => d.balance > 0);

  if (activeDebts.length === 0 || purchaseAmount <= 0) {
    return { purchaseAmount, trueCost: purchaseAmount, opportunityCost: 0, monthsDelayed: 0 };
  }

  const withPayment = getDetailedPaymentSchedule(activeDebts, currentExtraBudget + purchaseAmount, strategy);
  const withoutPayment = getDetailedPaymentSchedule(activeDebts, currentExtraBudget, strategy);
  const interestDifference = withoutPayment.summary.totalInterest - withPayment.summary.totalInterest;
  const monthsDelayed = withoutPayment.summary.totalMonths - withPayment.summary.totalMonths;

  return {
    purchaseAmount,
    trueCost: purchaseAmount + interestDifference,
    opportunityCost: interestDifference,
    monthsDelayed: Math.abs(monthsDelayed),
  };
}

// =====================================================================
// SECTION 2: FREEDOM DATE
// =====================================================================

function createEmptyImpactResult(): FreedomImpactResult {
  const today = new Date();
  return {
    baselineMonths: 0, baselineInterest: 0, baselineFreedomDate: today,
    newMonths: 0, newInterest: 0, newFreedomDate: today,
    monthsSaved: 0, totalInterestSaved: 0,
    baselineFreedomDateFormatted: 'Already Free!',
    newFreedomDateFormatted: 'Already Free!',
    targetDebt: null,
  };
}

/**
 * Calculate the impact of an additional payment amount on debt freedom
 */
export function calculateFreedomImpact(
  debts: DebtItem[],
  currentExtraBudget: number,
  additionalAmount: number,
  strategy: 'Snowball' | 'Avalanche' = 'Snowball'
): FreedomImpactResult {
  const activeDebts = debts.filter(d => d.balance > 0);
  if (activeDebts.length === 0) return createEmptyImpactResult();

  const baselineSchedule = getDetailedPaymentSchedule(activeDebts, currentExtraBudget, strategy);
  const newSchedule = getDetailedPaymentSchedule(activeDebts, currentExtraBudget + additionalAmount, strategy);

  const today = new Date();
  const baselineFreedomDate = addMonths(today, baselineSchedule.summary.totalMonths);
  const newFreedomDate = addMonths(today, newSchedule.summary.totalMonths);

  const sortedDebts = [...activeDebts].sort((a, b) =>
    strategy === 'Avalanche' ? b.apr - a.apr : a.balance - b.balance
  );

  return {
    baselineMonths: baselineSchedule.summary.totalMonths,
    baselineInterest: baselineSchedule.summary.totalInterest,
    baselineFreedomDate,
    newMonths: newSchedule.summary.totalMonths,
    newInterest: newSchedule.summary.totalInterest,
    newFreedomDate,
    monthsSaved: baselineSchedule.summary.totalMonths - newSchedule.summary.totalMonths,
    totalInterestSaved: baselineSchedule.summary.totalInterest - newSchedule.summary.totalInterest,
    baselineFreedomDateFormatted: baselineSchedule.summary.totalMonths > 0
      ? format(baselineFreedomDate, 'MMM yyyy') : 'Already Free!',
    newFreedomDateFormatted: newSchedule.summary.totalMonths > 0
      ? format(newFreedomDate, 'MMM yyyy') : 'Already Free!',
    targetDebt: sortedDebts[0] ? { name: sortedDebts[0].name, balance: sortedDebts[0].balance, apr: sortedDebts[0].apr } : null,
  };
}

/**
 * Translate interest saved into human-meaningful time metrics
 */
export function translateToHumanTime(
  interestSaved: number,
  hourlyWage: number = 25
): HumanTimeResult {
  if (hourlyWage <= 0 || interestSaved <= 0) {
    return { hours: 0, days: 0, weeks: 0, displayString: 'No time saved', heroMessage: 'Every dollar counts on your journey!' };
  }

  const hours = interestSaved / hourlyWage;
  const days = hours / 8;
  const weeks = days / 5;

  let displayString: string;
  let heroMessage: string;

  if (weeks >= 2) {
    displayString = `${weeks.toFixed(1)} Weeks of Freedom`;
    heroMessage = `That's ${weeks.toFixed(1)} weeks you won't have to work just to pay interest!`;
  } else if (days >= 2) {
    displayString = `${days.toFixed(1)} Days of Freedom`;
    heroMessage = `Skip this expense and reclaim ${days.toFixed(1)} days of your life from debt!`;
  } else if (hours >= 1) {
    displayString = `${Math.round(hours)} Hours of Life`;
    heroMessage = `This purchase costs ${Math.round(hours)} hours of work when you factor in debt interest.`;
  } else {
    const minutes = Math.round(hours * 60);
    displayString = `${minutes} Minutes of Your Time`;
    heroMessage = 'Even small amounts add up on your path to freedom!';
  }

  return { hours, days, weeks, displayString, heroMessage };
}

/**
 * Calculate freedom impact for a range of slider values
 */
export function calculateSliderImpact(
  debts: DebtItem[],
  currentExtraBudget: number,
  maxAmount: number = 1000,
  step: number = 50,
  strategy: 'Snowball' | 'Avalanche' = 'Snowball'
): SliderImpactPoint[] {
  const activeDebts = debts.filter(d => d.balance > 0);
  if (activeDebts.length === 0) return [];

  const baseline = getDetailedPaymentSchedule(activeDebts, currentExtraBudget, strategy);
  const today = new Date();
  const sliderValues = Array.from({ length: Math.floor(maxAmount / step) + 1 }, (_, i) => i * step);

  return sliderValues.map(amount => {
    const schedule = getDetailedPaymentSchedule(activeDebts, currentExtraBudget + amount, strategy);
    const freedomDate = addMonths(today, schedule.summary.totalMonths);
    return {
      amount,
      months: schedule.summary.totalMonths,
      date: schedule.summary.totalMonths > 0 ? format(freedomDate, 'MMM yyyy') : 'Free!',
      interestSaved: baseline.summary.totalInterest - schedule.summary.totalInterest,
      freedomDate,
    };
  });
}

// =====================================================================
// SECTION 3: BUDGET HEALTH
// =====================================================================

export function getSurvivalCategories(): string[] {
  return [...SURVIVAL_CATEGORIES];
}

/**
 * Calculate Surplus Power — money available for aggressive debt payoff
 */
export function calculateSurplusPower(
  expenses: Expense[],
  debts: Debt[],
  monthlyIncome: number
): SurplusPowerResult {
  const incomeFromExpenses = expenses.filter(e => e.is_income).reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = monthlyIncome > 0 ? monthlyIncome : incomeFromExpenses;
  const survivalExpenses = expenses
    .filter(e => !e.is_income && SURVIVAL_CATEGORIES.includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);
  const debtMinimums = debts.reduce((sum, d) => sum + d.minimum_payment, 0);
  const surplusPower = totalIncome - survivalExpenses - debtMinimums;
  const surplusPercentage = totalIncome > 0 ? (surplusPower / totalIncome) * 100 : 0;
  const isPositive = surplusPower > 0;

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

  return { totalIncome, survivalExpenses, debtMinimums, surplusPower, surplusPercentage, isPositive, heroMessage };
}

/**
 * Check budget compliance for survival categories
 */
export function checkBudgetCompliance(
  expenses: Expense[],
  transactions: Transaction[],
  monthStr: string
): BudgetComplianceResult {
  const survivalBudget = expenses
    .filter(e => !e.is_income && SURVIVAL_CATEGORIES.includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);
  const actualSpending = transactions
    .filter(t => t.date.startsWith(monthStr) && t.flow === 'out' && SURVIVAL_CATEGORIES.includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);

  const variance = survivalBudget - actualSpending;
  const variancePercentage = survivalBudget > 0 ? (variance / survivalBudget) * 100 : 0;
  const isUnderBudget = actualSpending <= survivalBudget;

  return { isUnderBudget, budgetedAmount: survivalBudget, actualSpending, variance, variancePercentage, daysCompliant: isUnderBudget ? 1 : 0 };
}

// =====================================================================
// SECTION 4: RECOVERY ENGINE
// =====================================================================

export function calculateRecoveryState(
  moatCurrent: number,
  moatTarget: number,
  wasSecure: boolean,
  lastSecureDate: string | null
): RecoveryState {
  const fortressIntegrity = moatTarget > 0 ? Math.round((moatCurrent / moatTarget) * 100) : 0;

  let status: RecoveryStatus;
  if (moatCurrent >= moatTarget) {
    status = 'SECURE';
  } else if (moatCurrent === 0) {
    status = 'VULNERABLE';
  } else if (wasSecure && moatCurrent < moatTarget) {
    status = 'REGROUPING';
  } else if (moatCurrent < moatTarget * 0.5) {
    status = 'VULNERABLE';
  } else {
    status = 'REGROUPING';
  }

  const breachAmount = Math.max(0, moatTarget - moatCurrent);
  const breachPercentage = moatTarget > 0 ? Math.round((breachAmount / moatTarget) * 100) : 0;

  return { status, breachAmount, breachPercentage, fortressIntegrity, previouslySecure: wasSecure, lastSecureDate };
}

export function getDiscretionaryExpenses(expenses: Expense[]): Expense[] {
  return expenses.filter(e => !e.is_income && !SURVIVAL_CATEGORIES.includes(e.category));
}

export function calculateRepairPlan(
  expenses: Expense[],
  breachAmount: number,
  cutPercentage: number = 0.15
): RepairPlan {
  const discretionary = getDiscretionaryExpenses(expenses);
  const categoryTotals = discretionary.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const nonEssentialTotal = Object.values(categoryTotals).reduce((sum, amt) => sum + amt, 0);
  const suggestedCutAmount = nonEssentialTotal * cutPercentage;
  const dailySavingsRate = suggestedCutAmount / 30;
  const daysToRepair = dailySavingsRate > 0 ? Math.ceil(breachAmount / dailySavingsRate) : Infinity;
  const weeksToRepair = Math.ceil(daysToRepair / 7);

  const affectedCategories: CategoryCut[] = Object.entries(categoryTotals)
    .filter(([_, amount]) => amount > 0)
    .map(([category, currentSpend]) => ({
      category,
      currentSpend,
      suggestedCut: currentSpend * cutPercentage,
      newAmount: currentSpend * (1 - cutPercentage),
    }))
    .sort((a, b) => b.currentSpend - a.currentSpend);

  return {
    nonEssentialTotal,
    suggestedCutPercentage: cutPercentage * 100,
    suggestedCutAmount,
    dailySavingsRate,
    daysToRepair: isFinite(daysToRepair) ? daysToRepair : 0,
    weeksToRepair: isFinite(weeksToRepair) ? weeksToRepair : 0,
    affectedCategories,
  };
}

export function formatRepairTimeline(days: number): string {
  if (days === 0) return 'No data available';
  if (days <= 7) return `${days} day${days === 1 ? '' : 's'}`;
  if (days <= 30) {
    const weeks = Math.ceil(days / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }
  const months = Math.ceil(days / 30);
  return `${months} month${months === 1 ? '' : 's'}`;
}

export function getStatusMessage(status: RecoveryStatus, fortressIntegrity: number): string {
  switch (status) {
    case 'SECURE': return 'Your emergency fund is fully funded. Well done.';
    case 'REGROUPING': return `Fund health at ${fortressIntegrity}%. Focus on rebuilding.`;
    case 'VULNERABLE': return 'Your emergency fund needs immediate attention.';
    default: return '';
  }
}

// =====================================================================
// SECTION 5: TRIGGER UTILITIES
// =====================================================================

export function isDiscretionaryCategory(category: string): boolean {
  return !SURVIVAL_CATEGORIES.includes(category);
}

export function canTrigger(lastTriggered: number | null, cooldownMs: number): boolean {
  if (lastTriggered === null) return true;
  return Date.now() - lastTriggered >= cooldownMs;
}

export function calculateFreedomDateDelay(amount: number, monthlyDebtPayment: number): number {
  if (monthlyDebtPayment <= 0) return 0;
  return Math.round((amount / monthlyDebtPayment) * 30);
}

// =====================================================================
// SECTION 6: DEBT COACH TIPS
// =====================================================================

export interface CoachTip {
  id: string;
  icon: string;
  title: string;
  description: string;
  priority: number;
}

export function generateDebtCoachTips(
  debts: DebtItem[],
  extraBudget: number,
  strategy: 'Snowball' | 'Avalanche'
): CoachTip[] {
  const activeDebts = debts.filter(d => d.balance > 0);
  if (activeDebts.length === 0) return [];

  const tips: CoachTip[] = [];
  const totalDebt = activeDebts.reduce((s, d) => s + d.balance, 0);
  const avgApr = activeDebts.reduce((s, d) => s + d.apr, 0) / activeDebts.length;
  const highAprDebts = activeDebts.filter(d => d.apr > 20);
  const smallDebts = activeDebts.filter(d => d.balance < 500);

  // High-APR alert
  if (highAprDebts.length > 0) {
    const worst = highAprDebts.sort((a, b) => b.apr - a.apr)[0];
    tips.push({
      id: 'high-apr',
      icon: '🔥',
      title: 'High-Interest Alert',
      description: `${worst.name} has a ${worst.apr}% APR. Consider a balance transfer or targeting this debt first to stop the bleeding.`,
      priority: 1,
    });
  }

  // Small balance quick win
  if (smallDebts.length > 0) {
    const easiest = smallDebts.sort((a, b) => a.balance - b.balance)[0];
    tips.push({
      id: 'quick-win',
      icon: '⚡',
      title: 'Quick Win Available',
      description: `${easiest.name} is only $${easiest.balance.toFixed(0)}. Knock it out for a motivational boost!`,
      priority: 2,
    });
  }

  // Extra payment impact
  if (extraBudget === 0) {
    const testSchedule = getDetailedPaymentSchedule(activeDebts, 0, strategy);
    const boostSchedule = getDetailedPaymentSchedule(activeDebts, 100, strategy);
    const interestSaved = testSchedule.summary.totalInterest - boostSchedule.summary.totalInterest;
    const monthsSaved = testSchedule.summary.totalMonths - boostSchedule.summary.totalMonths;
    if (interestSaved > 0) {
      tips.push({
        id: 'extra-payment',
        icon: '💰',
        title: 'Extra $100/mo Impact',
        description: `Adding just $100/mo saves you $${interestSaved.toFixed(0)} in interest and gets you debt-free ${monthsSaved} month${monthsSaved !== 1 ? 's' : ''} sooner.`,
        priority: 3,
      });
    }
  }

  // Refinance opportunity
  if (totalDebt > 10000 && avgApr > 15) {
    tips.push({
      id: 'refinance',
      icon: '🏦',
      title: 'Consider Consolidation',
      description: `With $${(totalDebt / 1000).toFixed(0)}k in debt at ${avgApr.toFixed(1)}% avg APR, a consolidation loan at a lower rate could save you significantly.`,
      priority: 4,
    });
  }

  // Strategy-specific motivation
  if (strategy === 'Snowball') {
    tips.push({
      id: 'snowball-motivation',
      icon: '❄️',
      title: 'Snowball Momentum',
      description: 'You\'re using the Snowball method — great for building momentum. Each payoff frees up more cash for the next target!',
      priority: 5,
    });
  } else {
    tips.push({
      id: 'avalanche-math',
      icon: '📐',
      title: 'Mathematically Optimal',
      description: 'The Avalanche method minimizes total interest paid. You\'re making the smartest financial move!',
      priority: 5,
    });
  }

  // Round-up suggestion
  const targetDebt = [...activeDebts].sort(
    strategy === 'Avalanche' ? (a, b) => b.apr - a.apr : (a, b) => a.balance - b.balance
  )[0];
  if (targetDebt) {
    const roundedMin = Math.ceil(targetDebt.min / 50) * 50;
    const diff = roundedMin - targetDebt.min;
    if (diff > 0 && diff <= 25) {
      tips.push({
        id: 'round-up',
        icon: '🔄',
        title: 'Round Up Your Payment',
        description: `Round your $${targetDebt.min} payment on ${targetDebt.name} up to $${roundedMin} — just $${diff.toFixed(0)} more per month can shave months off your payoff.`,
        priority: 6,
      });
    }
  }

  return tips.sort((a, b) => a.priority - b.priority).slice(0, 5);
}

export function formatTriggerCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getStoredTriggerState(): TriggerState {
  try {
    return {
      shadowCostLastTriggered: JSON.parse(localStorage.getItem(TRIGGER_STORAGE_KEYS.SHADOW_COST_LAST) || 'null'),
      shadowCostShownTxIds: JSON.parse(localStorage.getItem(TRIGGER_STORAGE_KEYS.SHADOW_COST_TX_IDS) || '[]'),
      surplusStrikeLastTriggered: JSON.parse(localStorage.getItem(TRIGGER_STORAGE_KEYS.SURPLUS_STRIKE_LAST) || 'null'),
    };
  } catch {
    return { shadowCostLastTriggered: null, shadowCostShownTxIds: [], surplusStrikeLastTriggered: null };
  }
}

export function updateTriggerState(updates: Partial<TriggerState>): void {
  try {
    if (updates.shadowCostLastTriggered !== undefined) {
      localStorage.setItem(TRIGGER_STORAGE_KEYS.SHADOW_COST_LAST, JSON.stringify(updates.shadowCostLastTriggered));
    }
    if (updates.shadowCostShownTxIds !== undefined) {
      localStorage.setItem(TRIGGER_STORAGE_KEYS.SHADOW_COST_TX_IDS, JSON.stringify(updates.shadowCostShownTxIds));
    }
    if (updates.surplusStrikeLastTriggered !== undefined) {
      localStorage.setItem(TRIGGER_STORAGE_KEYS.SURPLUS_STRIKE_LAST, JSON.stringify(updates.surplusStrikeLastTriggered));
    }
  } catch (error) {
    console.error('Failed to update trigger state:', error);
  }
}
