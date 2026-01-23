/**
 * Behavioral Engine - Core Calculations
 * 
 * Implements proactive debt-repayment coaching through:
 * 1. Surplus Power: Available discretionary income after essentials + debt minimums
 * 2. Shadow Cost: True cost of purchases when factoring debt interest
 * 3. Consistency Score: Enhanced multi-factor score (Participation + Budget Adherence + Momentum)
 * 4. Budget Compliance: Survival spending vs. budget tracking
 * 5. Strategy Level-Up: Determines when to suggest Avalanche over Snowball
 */

import { Expense } from '@/hooks/useLocalExpenses';
import { Debt } from '@/hooks/useLocalDebts';
import { Transaction } from '@/hooks/useLocalTransactions';
import { format, differenceInDays, parseISO, startOfDay, subDays, startOfWeek, endOfWeek } from 'date-fns';

// Categories considered "survival" expenses (non-negotiable)
const SURVIVAL_CATEGORIES = [
  'Housing',
  'Utilities',
  'Food',
  'Insurance & Healthcare',
  'Transportation',
];

// ============= CONSISTENCY SCORE WEIGHTS =============
export const CONSISTENCY_WEIGHTS = {
  participation: 0.4,
  budgetAdherence: 0.4,
  momentum: 0.2,
};

// ============= RESULT INTERFACES =============

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

export interface EnhancedConsistencyScoreResult {
  // Component scores (0-1 scale)
  participation: number;       // P_s: Active days / 7
  budgetAdherence: number;     // B_a: 1 if under budget, else budgeted/spent
  momentum: number;            // M_q: min(paid_debts * 0.1, 0.5)
  
  // Weights for transparency
  weights: typeof CONSISTENCY_WEIGHTS;
  
  // Final composite score (0-100)
  score: number;
  
  // Derived state
  streakLevel: 'novice' | 'apprentice' | 'warrior' | 'hero' | 'legend';
  heroMessage: string;
  
  // Existing streak data (preserve for UI)
  currentStreak: number;
  longestStreak: number;
  todayLogged: boolean;
  lastLogDate: string | null;
  
  // Raw data for debugging/display
  activeDaysCount: number;
  paidDebtsCount: number;
  survivalBudgetStatus: 'under' | 'over' | 'on-target';
  survivalSpent: number;
  survivalBudgeted: number;
}

export interface BudgetComplianceResult {
  isUnderBudget: boolean;
  budgetedAmount: number;
  actualSpending: number;
  variance: number;
  variancePercentage: number;
  daysCompliant: number;
}

// ============= SURPLUS POWER CALCULATION =============

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

// ============= SHADOW COST CALCULATION =============

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

// ============= PARTICIPATION CALCULATION (P_s) =============

/**
 * Calculate Participation Score (P_s)
 * Tracks activity over the last 7 days
 * Activity = app opened OR transaction logged
 * 
 * Formula: Active Days / 7
 */
export function calculateParticipation(
  transactions: Transaction[],
  activityLog: string[] // ISO dates when app was opened
): { score: number; activeDaysCount: number; activeDays: string[] } {
  const today = startOfDay(new Date());
  const sevenDaysAgo = subDays(today, 6); // Include today = 7 days
  
  // Get unique active days from transactions
  const transactionDays = new Set(
    transactions
      .filter(t => {
        const date = startOfDay(parseISO(t.date));
        return date >= sevenDaysAgo && date <= today;
      })
      .map(t => format(parseISO(t.date), 'yyyy-MM-dd'))
  );
  
  // Merge with app-open activity log
  const activityDays = new Set([
    ...transactionDays,
    ...activityLog.filter(d => {
      try {
        const date = startOfDay(parseISO(d));
        return date >= sevenDaysAgo && date <= today;
      } catch {
        return false;
      }
    }).map(d => format(parseISO(d), 'yyyy-MM-dd'))
  ]);
  
  const activeDaysCount = activityDays.size;
  const score = activeDaysCount / 7;
  
  return {
    score,
    activeDaysCount,
    activeDays: [...activityDays],
  };
}

// ============= BUDGET ADHERENCE CALCULATION (B_a) =============

/**
 * Calculate Budget Adherence (B_a)
 * For survival categories only (Housing, Food, Utilities, etc.)
 * 
 * If spent <= budgeted: B_a = 1
 * If spent > budgeted: B_a = budgeted / spent (capped at 0)
 */
export function calculateBudgetAdherence(
  expenses: Expense[],
  transactions: Transaction[],
  weekStartDate?: Date
): { score: number; status: 'under' | 'over' | 'on-target'; spent: number; budgeted: number } {
  const now = weekStartDate || new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
  
  // Get weekly survival budget (monthly / ~4.33)
  const monthlySurvivalBudget = expenses
    .filter(e => !e.is_income && SURVIVAL_CATEGORIES.includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);
  const weeklyBudget = monthlySurvivalBudget / 4.33;
  
  // Get actual survival spending this week
  const weeklySpent = transactions
    .filter(t => {
      try {
        const date = parseISO(t.date);
        return date >= weekStart && 
               date <= weekEnd && 
               t.flow === 'out' && 
               SURVIVAL_CATEGORIES.includes(t.category);
      } catch {
        return false;
      }
    })
    .reduce((sum, t) => sum + t.amount, 0);
  
  let score: number;
  let status: 'under' | 'over' | 'on-target';
  
  if (weeklyBudget === 0) {
    // No survival budget set - default to full score
    score = 1;
    status = 'on-target';
  } else if (weeklySpent <= weeklyBudget) {
    score = 1;
    status = weeklySpent === weeklyBudget ? 'on-target' : 'under';
  } else {
    // Over budget: score is ratio of budget to spent
    score = Math.max(0, weeklyBudget / weeklySpent);
    status = 'over';
  }
  
  return { score, status, spent: weeklySpent, budgeted: weeklyBudget };
}

// ============= MOMENTUM CALCULATION (M_q) =============

/**
 * Calculate Momentum (M_q)
 * Based on number of debts marked as paid (balance = 0)
 * 
 * Formula: min(paid_debts_count * 0.1, 0.5)
 * Max contribution: 0.5 (5 or more paid debts)
 */
export function calculateMomentum(
  debts: Debt[]
): { score: number; paidDebtsCount: number } {
  const paidDebts = debts.filter(d => d.balance === 0);
  const paidDebtsCount = paidDebts.length;
  
  const score = Math.min(paidDebtsCount * 0.1, 0.5);
  
  return { score, paidDebtsCount };
}

// ============= LEGACY CONSISTENCY SCORE (Streak-based) =============

/**
 * Calculate streak-based Consistency Score (preserved for backward compatibility)
 * Tracks daily transaction logging streaks
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
      heroMessage = `🏆 Exceptional! ${currentStreak} days of consistent tracking. You've mastered financial awareness.`;
      break;
    case 'hero':
      heroMessage = `🌟 Impressive consistency! ${currentStreak} days strong. Your discipline is building unstoppable momentum!`;
      break;
    case 'warrior':
      heroMessage = `💪 Strong consistency! ${currentStreak} day streak. Keep pushing toward financial freedom!`;
      break;
    case 'apprentice':
      heroMessage = `📈 Great start! ${currentStreak} days logged. You're building a powerful habit.`;
      break;
    default:
      if (!todayLogged) {
        heroMessage = "💪 Log today's transactions to start building your streak!";
      } else {
        heroMessage = "🌱 Day 1 begins! Every journey starts with a single step.";
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

// ============= ENHANCED CONSISTENCY SCORE =============

/**
 * Generate hero message based on consistency score components
 */
function generateConsistencyHeroMessage(
  score: number,
  streakLevel: string,
  participation: { activeDaysCount: number },
  budgetAdherence: { status: string }
): string {
  if (score >= 90) {
    return `🏆 Exceptional! You've achieved a ${score.toFixed(0)}% Consistency Score. Your financial discipline is unmatched!`;
  } else if (score >= 75) {
    return `⚔️ Impressive! ${score.toFixed(0)}% Consistency Score. You're ready to level up your strategy!`;
  } else if (score >= 50) {
    return `🛡️ Strong consistency at ${score.toFixed(0)}%. Keep logging daily to build momentum!`;
  } else if (score >= 25) {
    if (participation.activeDaysCount < 4) {
      return `📊 Active ${participation.activeDaysCount}/7 days. Open the app daily to boost your score!`;
    }
    if (budgetAdherence.status === 'over') {
      return `💡 Essential spending is over budget. Review expenses to improve adherence.`;
    }
    return `🌱 Building habits at ${score.toFixed(0)}%. Keep logging to unlock higher levels!`;
  }
  return `🎯 Start your journey! Log transactions daily to build consistency.`;
}

/**
 * Calculate Enhanced Consistency Score
 * Combines all three components with specified weights
 * 
 * Final Score = (P_s × 0.4) + (B_a × 0.4) + (M_q × 0.2) × 100
 */
export function calculateEnhancedConsistencyScore(
  transactions: Transaction[],
  expenses: Expense[],
  debts: Debt[],
  activityLog: string[],
  storedStreak?: { currentStreak: number; longestStreak: number; lastLogDate: string | null }
): EnhancedConsistencyScoreResult {
  // Calculate components
  const participation = calculateParticipation(transactions, activityLog);
  const budgetAdherence = calculateBudgetAdherence(expenses, transactions);
  const momentum = calculateMomentum(debts);
  
  // Calculate weighted score (0-1) then scale to 0-100
  const rawScore = 
    (participation.score * CONSISTENCY_WEIGHTS.participation) +
    (budgetAdherence.score * CONSISTENCY_WEIGHTS.budgetAdherence) +
    (momentum.score * CONSISTENCY_WEIGHTS.momentum);
  
  const score = rawScore * 100;
  
  // Determine streak level based on score
  let streakLevel: EnhancedConsistencyScoreResult['streakLevel'];
  if (score >= 90) streakLevel = 'legend';
  else if (score >= 75) streakLevel = 'hero';
  else if (score >= 50) streakLevel = 'warrior';
  else if (score >= 25) streakLevel = 'apprentice';
  else streakLevel = 'novice';
  
  // Generate hero message
  const heroMessage = generateConsistencyHeroMessage(score, streakLevel, participation, budgetAdherence);
  
  // Calculate streak data (preserve existing logic)
  const streakData = calculateConsistencyScore(transactions, storedStreak);
  
  return {
    participation: participation.score,
    budgetAdherence: budgetAdherence.score,
    momentum: momentum.score,
    weights: CONSISTENCY_WEIGHTS,
    score,
    streakLevel,
    heroMessage,
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    todayLogged: streakData.todayLogged,
    lastLogDate: streakData.lastLogDate,
    activeDaysCount: participation.activeDaysCount,
    paidDebtsCount: momentum.paidDebtsCount,
    survivalBudgetStatus: budgetAdherence.status,
    survivalSpent: budgetAdherence.spent,
    survivalBudgeted: budgetAdherence.budgeted,
  };
}

// ============= SHOULD LEVEL UP =============

/**
 * Determine if user should level up from Snowball to Avalanche strategy
 * 
 * Returns true if:
 * - Consistency Score > 75
 * - Current strategy is 'snowball'
 * 
 * This triggers the UI to suggest Debt Avalanche as a more optimized approach
 */
export function shouldLevelUp(
  consistencyScore: number,
  currentStrategy: 'snowball' | 'avalanche' | string
): boolean {
  return consistencyScore > 75 && currentStrategy.toLowerCase() === 'snowball';
}

// ============= BUDGET COMPLIANCE =============

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

// ============= UTILITY FUNCTIONS =============

/**
 * Get survival categories constant for external use
 */
export function getSurvivalCategories(): string[] {
  return [...SURVIVAL_CATEGORIES];
}
