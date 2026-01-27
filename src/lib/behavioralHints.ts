/**
 * Behavioral Hints Engine
 * 
 * Generates context-aware AI guidance based on user's financial state.
 * Uses priority system to surface the most relevant hints.
 */

export interface BehavioralHint {
  id: string;
  type: 'opportunity' | 'warning' | 'celebration' | 'tip';
  title: string;
  message: string;
  action?: {
    label: string;
    route: string;
  };
  priority: number; // 1-10, higher = more important
}

export interface HintGeneratorData {
  moatProgress: number;
  moatTarget: number;
  moatCurrent: number;
  leftover: number;
  totalDebt: number;
  highestApr: number;
  strategy: 'Snowball' | 'Avalanche';
  avalancheSavings: number; // Interest saved by using Avalanche vs Snowball
  survivalOverBudget: boolean;
  debtCount: number;
  hasHighInterestDebt: boolean; // APR > 20%
}

/**
 * Generate prioritized behavioral hints based on user's financial state
 */
export function generateBehavioralHints(data: HintGeneratorData): BehavioralHint[] {
  const hints: BehavioralHint[] = [];

  // CRITICAL: Emergency fund vulnerable AND has surplus to address it
  if (data.moatProgress < 25 && data.leftover > 100) {
    hints.push({
      id: 'moat-vulnerable',
      type: 'warning',
      title: 'Build Your Safety Net',
      message: `Your emergency fund is at ${data.moatProgress.toFixed(0)}%. Consider directing some of your ${formatCurrency(data.leftover)} monthly surplus here first for financial security.`,
      action: {
        label: 'View Emergency Fund',
        route: '/budgets',
      },
      priority: 10,
    });
  }

  // HIGH: Avalanche would save significant interest
  if (data.strategy === 'Snowball' && data.avalancheSavings > 500) {
    hints.push({
      id: 'avalanche-opportunity',
      type: 'opportunity',
      title: 'Potential Interest Savings',
      message: `Switching to the Avalanche strategy could save you ${formatCurrency(data.avalancheSavings)} in interest. The What-If Simulator can show you the impact.`,
      action: {
        label: 'Try Simulator',
        route: '/debts',
      },
      priority: 8,
    });
  }

  // MEDIUM: Emergency fund complete - accelerate debt payoff
  if (data.moatProgress >= 100 && data.totalDebt > 0 && data.leftover > 0) {
    hints.push({
      id: 'moat-complete-attack',
      type: 'tip',
      title: 'Ready to Accelerate',
      message: `Your emergency fund is secure! Your ${formatCurrency(data.leftover)} surplus can now aggressively target your ${formatCurrency(data.totalDebt)} in debt.`,
      action: {
        label: 'View Strategy',
        route: '/debts',
      },
      priority: 6,
    });
  }

  // MEDIUM: High interest debt warning
  if (data.hasHighInterestDebt && data.strategy === 'Snowball') {
    hints.push({
      id: 'high-interest-warning',
      type: 'warning',
      title: 'High Interest Alert',
      message: `You have debt at ${data.highestApr.toFixed(1)}% APR. High-interest debt grows quickly—consider Avalanche strategy to minimize interest.`,
      action: {
        label: 'Compare Strategies',
        route: '/debts',
      },
      priority: 7,
    });
  }

  // MEDIUM: Budget exceeded on essentials
  if (data.survivalOverBudget) {
    hints.push({
      id: 'survival-over-budget',
      type: 'warning',
      title: 'Essential Spending Alert',
      message: 'Your essential spending exceeded your budget this month. Review expenses to free up more for your goals.',
      action: {
        label: 'Review Budget',
        route: '/budgets',
      },
      priority: 5,
    });
  }

  // LOW: No leftover for goals
  if (data.leftover <= 0 && (data.totalDebt > 0 || data.moatProgress < 100)) {
    hints.push({
      id: 'no-surplus',
      type: 'tip',
      title: 'Find Extra Room',
      message: 'Your budget is tight with no surplus for debt or savings. Look for expenses to trim or ways to boost income.',
      action: {
        label: 'Review Budget',
        route: '/budgets',
      },
      priority: 4,
    });
  }

  // CELEBRATION: Debt-free
  if (data.totalDebt === 0 && data.debtCount === 0) {
    hints.push({
      id: 'debt-free',
      type: 'celebration',
      title: 'Debt-Free!',
      message: 'Congratulations! You have no outstanding debt. Focus on building wealth and growing your emergency fund.',
      priority: 3,
    });
  }

  // CELEBRATION: Emergency fund milestone
  if (data.moatProgress >= 50 && data.moatProgress < 75) {
    hints.push({
      id: 'moat-halfway',
      type: 'celebration',
      title: 'Halfway There!',
      message: 'Your emergency fund is over 50% complete. Great discipline—keep building that safety net!',
      priority: 2,
    });
  }

  // TIP: Good balance between fund and debt payoff
  if (data.moatProgress >= 25 && data.moatProgress < 100 && data.leftover > 200 && data.totalDebt > 0) {
    hints.push({
      id: 'balanced-approach',
      type: 'tip',
      title: 'Balanced Approach',
      message: `Consider splitting your ${formatCurrency(data.leftover)} surplus between emergency fund and debt payoff for optimal progress.`,
      priority: 3,
    });
  }

  // Sort by priority (highest first) and return top hints
  return hints.sort((a, b) => b.priority - a.priority);
}

/**
 * Get the top N hints to display
 */
export function getTopHints(hints: BehavioralHint[], count: number = 2): BehavioralHint[] {
  return hints.slice(0, count);
}

// Helper function for formatting currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
