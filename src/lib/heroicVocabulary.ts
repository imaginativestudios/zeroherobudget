/**
 * Adventure Vocabulary Glossary
 * 
 * Centralized copy constants for the Sophisticated Adventure theme.
 * Inspired by restoration journeys (Legend of Zelda: Breath of the Wild).
 * Use these throughout the app to maintain consistent, encouraging language.
 */

export const HEROIC_COPY = {
  // Budget/Spending Terms
  budget: 'The Atlas',
  budgets: 'Atlases',
  overspent: 'Off the Path',
  overBudget: 'Off the Path',
  underBudget: 'Ahead of the Journey',
  deficit: 'A Detour',
  spending: 'Provisions',
  
  // Debt Terms
  payDebt: 'Clear Shadow',
  debt: 'The Shadow',
  debts: 'Shadows',
  paidOff: 'Cleared',
  debtFree: 'Restored',
  
  // Status Terms
  failed: 'Course Correction Needed',
  error: 'Obstacle Encountered',
  warning: 'Path Alert',
  negative: 'A Detour',
  behind: 'Finding the Way',
  missed: 'Detour Taken',
  
  // Navigation/Section Names
  dangerZone: 'Point of No Return',
  transactions: 'Journey Log',
  achievements: 'Milestones',
  reports: 'Discoveries',
  
  // Action Terms
  clearData: 'New Journey',
  deleteAccount: 'End Journey',
  importFailed: 'Import Needs Attention',
  
  // Emergency Fund / Sanctuary Terms
  emergencyFund: "The Sanctuary",
  moat: 'Sanctuary',
  protected: 'Safe',
  moatVulnerable: 'Sanctuary Exposed',
  moatBuilding: 'Sanctuary Growing',
  moatFortified: 'Sanctuary Strengthening', 
  moatSecure: 'Sanctuary Safe',
  primaryQuest: 'Current Quest',
  starterMoat: 'The First Sanctuary',
  fortifyMoat: 'Grow Your Sanctuary',
  
  // Recovery / Restoration Terms
  breach: 'Disruption',
  breachDetected: 'Disruption Detected',
  repairs: 'Restoration',
  repairMode: 'Restoration Mode',
  tacticalShift: 'Path Adjustment',
  fortressIntegrity: 'Sanctuary Strength',
  regrouping: 'Restoring',
  repairPlan: 'Restoration Plan',
  optimizeForRepair: 'Focus on Restoration',
  compromised: 'Needs Attention',
  daysToRepair: 'Days to Restore',
  prioritizingRepairs: 'Prioritizing Restoration',
  
  // Positive Reinforcement
  greatJob: 'Well Traveled',
  excellent: 'Remarkable',
  good: 'On the Right Path',

  // Journey Levels
  squire: 'Wayfarer',
  knight: 'Sage',
  warrior: 'Pathfinder',
  hero: 'Sage',
  legend: 'Luminary',
};

/**
 * Get the adventure equivalent of a term
 */
export function getHeroicTerm(term: keyof typeof HEROIC_COPY): string {
  return HEROIC_COPY[term] || term;
}

/**
 * Replace "over budget" with adventure alternative
 */
export function getOverBudgetMessage(percentage: number): string {
  if (percentage > 50) {
    return `${percentage.toFixed(1)}% off the path`;
  }
  return `${percentage.toFixed(1)}% off the path`;
}

/**
 * Replace "under budget" with adventure alternative
 */
export function getUnderBudgetMessage(percentage: number): string {
  return `${Math.abs(percentage).toFixed(1)}% ahead of the journey`;
}

/**
 * Get status label for budget variance
 */
export function getBudgetStatusLabel(isOver: boolean, percentage: number): string {
  if (isOver) {
    return percentage > 50 ? 'Far Off Path' : 'Off the Path';
  }
  return 'Ahead of Journey';
}

/**
 * Get deficit label
 */
export function getDeficitLabel(): string {
  return 'A Detour';
}
