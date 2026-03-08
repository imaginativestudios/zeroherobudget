/**
 * Recovery Engine
 * 
 * Core logic for emergency fund recovery detection and planning.
 */

import { Expense } from '@/hooks/useLocalExpenses';

// Survival categories - essential spending that shouldn't be cut
const SURVIVAL_CATEGORIES = [
  'Housing',
  'Utilities', 
  'Transportation',
  'Food',
  'Insurance & Healthcare',
];

export type RecoveryStatus = 'SECURE' | 'REGROUPING' | 'VULNERABLE';

export interface RecoveryState {
  status: RecoveryStatus;
  breachAmount: number;
  breachPercentage: number;
  fortressIntegrity: number; // Percentage of moat remaining (0-100)
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

/**
 * Calculate the current recovery state based on moat balance
 */
export function calculateRecoveryState(
  moatCurrent: number,
  moatTarget: number,
  wasSecure: boolean,
  lastSecureDate: string | null
): RecoveryState {
  const fortressIntegrity = moatTarget > 0 
    ? Math.round((moatCurrent / moatTarget) * 100) 
    : 0;
  
  // Determine status
  let status: RecoveryStatus;
  
  if (moatCurrent >= moatTarget) {
    status = 'SECURE';
  } else if (moatCurrent === 0) {
    status = 'VULNERABLE';
  } else if (wasSecure && moatCurrent < moatTarget) {
    // Was previously complete but now dropped below
    status = 'REGROUPING';
  } else if (moatCurrent < moatTarget * 0.5) {
    // Below 50% is also concerning
    status = 'VULNERABLE';
  } else {
    // Building up but not yet complete
    status = 'REGROUPING';
  }
  
  const breachAmount = Math.max(0, moatTarget - moatCurrent);
  const breachPercentage = moatTarget > 0 
    ? Math.round((breachAmount / moatTarget) * 100) 
    : 0;
  
  return {
    status,
    breachAmount,
    breachPercentage,
    fortressIntegrity,
    previouslySecure: wasSecure,
    lastSecureDate,
  };
}

/**
 * Get discretionary (non-essential) expenses that can be cut
 */
export function getDiscretionaryExpenses(expenses: Expense[]): Expense[] {
  return expenses.filter(expense => 
    !expense.is_income && 
    !SURVIVAL_CATEGORIES.includes(expense.category)
  );
}

/**
 * Calculate a repair plan with suggested cuts
 */
export function calculateRepairPlan(
  expenses: Expense[],
  breachAmount: number,
  cutPercentage: number = 0.15
): RepairPlan {
  const discretionary = getDiscretionaryExpenses(expenses);
  
  // Calculate totals by category
  const categoryTotals = discretionary.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const nonEssentialTotal = Object.values(categoryTotals).reduce((sum, amt) => sum + amt, 0);
  const suggestedCutAmount = nonEssentialTotal * cutPercentage;
  
  // Calculate daily savings from the cut
  const dailySavingsRate = suggestedCutAmount / 30;
  
  // Calculate days to repair
  const daysToRepair = dailySavingsRate > 0 
    ? Math.ceil(breachAmount / dailySavingsRate) 
    : Infinity;
  
  const weeksToRepair = Math.ceil(daysToRepair / 7);
  
  // Build per-category breakdown
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

/**
 * Format days to a human-readable timeline
 */
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

/**
 * Get heroic message based on status
 */
export function getStatusMessage(status: RecoveryStatus, fortressIntegrity: number): string {
  switch (status) {
    case 'SECURE':
      return 'Your Fortress stands strong! The Moat is complete.';
    case 'REGROUPING':
      return `Tactical Alert: Fortress Integrity at ${fortressIntegrity}%. Prioritizing repairs.`;
    case 'VULNERABLE':
      return 'Critical Alert: Your defenses are exposed. Immediate action required.';
    default:
      return '';
  }
}
