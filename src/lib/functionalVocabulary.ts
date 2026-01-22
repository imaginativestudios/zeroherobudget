/**
 * Functional Vocabulary Glossary
 * 
 * Clarity-first copy constants for financial terms.
 * Replaces abstract fantasy terms with clear, universally understandable labels.
 * Heroic flavor is preserved in subtexts and success messages only.
 */

export const FUNCTIONAL_COPY = {
  // Budget/Spending Terms
  budget: 'Budget',
  budgets: 'Budget',
  atlas: 'Budget Planner',
  overspent: 'Over Budget',
  overBudget: 'Over Budget',
  underBudget: 'Under Budget',
  deficit: 'Deficit',
  spending: 'Expenses',
  provisions: 'Expenses',
  stamina: 'Left to Spend',
  vitality: 'Disposable Income',
  disposableIncome: 'Disposable Income',
  leftToSpend: 'Left to Spend',
  
  // Debt Terms
  payDebt: 'Pay Debt',
  debt: 'Debt',
  debts: 'Debts',
  shadow: 'Debt',
  shadows: 'Debts',
  paidOff: 'Paid Off',
  debtFree: 'Debt Free',
  shadowPath: 'Debt Strategy',
  strike: 'Extra Payment',
  clearShadow: 'Pay Debt',
  strategy: 'Payoff Strategy',
  
  // Emergency Fund Terms
  emergencyFund: 'Emergency Fund',
  moat: 'Emergency Fund',
  sanctuary: 'Emergency Fund',
  protected: 'Protected',
  moatVulnerable: 'Fund Vulnerable',
  moatBuilding: 'Fund Building',
  moatFortified: 'Fund Fortified', 
  moatSecure: 'Fund Secure',
  sanctuaryExposed: 'Fund Vulnerable',
  sanctuaryGrowing: 'Fund Building',
  sanctuarySafe: 'Fund Secure',
  
  // Status Terms
  failed: 'Needs Attention',
  error: 'Error',
  warning: 'Warning',
  negative: 'Deficit',
  behind: 'Behind',
  missed: 'Missed',
  
  // Navigation/Section Names
  dangerZone: 'Danger Zone',
  transactions: 'Transactions',
  journeyLog: 'Transactions',
  achievements: 'Achievements',
  milestones: 'Achievements',
  reports: 'Reports',
  discoveries: 'Reports',
  
  // Action Terms
  clearData: 'Clear Data',
  deleteAccount: 'Delete Account',
  importFailed: 'Import Failed',
  
  // Recovery / Status Terms
  breach: 'Setback',
  breachDetected: 'Setback Detected',
  repairs: 'Recovery',
  repairMode: 'Recovery Mode',
  tacticalShift: 'Adjustment',
  fortressIntegrity: 'Fund Health',
  regrouping: 'Recovering',
  repairPlan: 'Recovery Plan',
  optimizeForRepair: 'Focus on Recovery',
  compromised: 'Needs Attention',
  daysToRepair: 'Days to Recover',
  prioritizingRepairs: 'Prioritizing Recovery',
  
  // Positive Reinforcement
  greatJob: 'Great Job',
  excellent: 'Excellent',
  good: 'Good',

  // Levels (keep some flavor for gamification)
  squire: 'Beginner',
  knight: 'Intermediate',
  warrior: 'Advanced',
  hero: 'Expert',
  legend: 'Master',
};

/**
 * Heroic subtexts to add flavor without confusing primary labels
 */
export const HEROIC_SUBTEXTS = {
  budget: 'Your Financial Atlas',
  debts: 'Conquer the Shadow',
  emergencyFund: 'Your Financial Sanctuary',
  debtStrategy: 'Chart Your Freedom',
  strategy: 'Chart Your Freedom',
  transactions: 'Your Journey Log',
  achievements: 'Your Milestones',
  reports: 'Your Discoveries',
  leftToSpend: 'Your Remaining Vitality',
  surplus: 'Your Surplus Power',
};

/**
 * Get the functional equivalent of a term
 */
export function getFunctionalTerm(term: keyof typeof FUNCTIONAL_COPY): string {
  return FUNCTIONAL_COPY[term] || term;
}

/**
 * Get the heroic subtext for a section
 */
export function getHeroicSubtext(section: keyof typeof HEROIC_SUBTEXTS): string {
  return HEROIC_SUBTEXTS[section] || '';
}

/**
 * Replace "over budget" with functional message
 */
export function getOverBudgetMessage(percentage: number): string {
  if (percentage > 50) {
    return `${percentage.toFixed(1)}% over budget`;
  }
  return `${percentage.toFixed(1)}% over budget`;
}

/**
 * Replace "under budget" with functional message
 */
export function getUnderBudgetMessage(percentage: number): string {
  return `${Math.abs(percentage).toFixed(1)}% under budget`;
}

/**
 * Get status label for budget variance
 */
export function getBudgetStatusLabel(isOver: boolean, percentage: number): string {
  if (isOver) {
    return percentage > 50 ? 'Over Budget' : 'Slightly Over';
  }
  return 'Under Budget';
}
