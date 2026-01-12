/**
 * Heroic Vocabulary Glossary
 * 
 * Centralized copy constants for the Hero's Journey theme.
 * Use these throughout the app to maintain consistent, encouraging language.
 */

export const HEROIC_COPY = {
  // Budget/Spending Terms
  budget: 'War Map',
  budgets: 'War Maps',
  overspent: 'Tactical Overstretch',
  overBudget: 'Tactical Overstretch',
  underBudget: 'Strategic Surplus',
  deficit: 'Temporary Retreat',
  spending: 'Deployment',
  
  // Debt Terms
  payDebt: 'Slay Balance',
  debt: 'Balance Foe',
  debts: 'Balance Foes',
  paidOff: 'Vanquished',
  debtFree: 'Victorious',
  
  // Status Terms
  failed: 'Regrouping Needed',
  error: 'Obstacle Encountered',
  warning: 'Tactical Alert',
  negative: 'Temporary Retreat',
  behind: 'Regrouping Phase',
  missed: 'Detour Taken',
  
  // Navigation/Section Names
  dangerZone: 'Point of No Return',
  transactions: 'Quest Log',
  achievements: 'Victories',
  reports: 'Intel',
  
  // Action Terms
  clearData: 'Reset Quest',
  deleteAccount: 'End Journey',
  importFailed: 'Import Needs Regrouping',
  
// Emergency Fund / Defense Terms
  emergencyFund: "The Hero's Moat",
  moat: 'Moat',
  protected: 'Protected',
  moatVulnerable: 'Castle Vulnerable',
  moatBuilding: 'Defenses Rising',
  moatFortified: 'Walls Strengthening', 
  moatSecure: 'Moat Secure',
  primaryQuest: 'Primary Quest',
  starterMoat: 'The Starter Moat',
  fortifyMoat: 'Fortify Your Moat',
  
  // Positive Reinforcement
  greatJob: 'Heroic Work',
  excellent: 'Legendary',
  good: 'Valiant',
};

/**
 * Get the heroic equivalent of a negative term
 */
export function getHeroicTerm(term: keyof typeof HEROIC_COPY): string {
  return HEROIC_COPY[term] || term;
}

/**
 * Replace "over budget" with heroic alternative
 */
export function getOverBudgetMessage(percentage: number): string {
  if (percentage > 50) {
    return `in Tactical Overstretch by ${percentage.toFixed(1)}%`;
  }
  return `${percentage.toFixed(1)}% in Tactical Overstretch`;
}

/**
 * Replace "under budget" with heroic alternative
 */
export function getUnderBudgetMessage(percentage: number): string {
  return `${Math.abs(percentage).toFixed(1)}% in Strategic Surplus`;
}

/**
 * Get status label for budget variance
 */
export function getBudgetStatusLabel(isOver: boolean, percentage: number): string {
  if (isOver) {
    return percentage > 50 ? 'Critical Overstretch' : 'Tactical Overstretch';
  }
  return 'Strategic Surplus';
}

/**
 * Get deficit label
 */
export function getDeficitLabel(): string {
  return 'Temporary Retreat';
}
