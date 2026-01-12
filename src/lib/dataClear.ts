// Data clearing utilities for local storage

export interface ClearDataOptions {
  transactions: boolean;
  expenses: boolean;
  debts: boolean;
  subscriptions: boolean;
  accounts: boolean;
  settings: boolean;
}

// All user-specific localStorage keys that should be cleared
const LOCAL_STORAGE_KEYS = [
  // Core financial data
  'transactions',
  'expenses', 
  'debts',
  'subscriptions',
  'accounts',
  
  // Settings & preferences
  'bdt_income',
  'bdt_strategy',
  'bdt_expenses',
  'bdt_assets',
  'bdt_debts',
  'bdt_group_order',
  
  // Behavioral engine data
  'bdt_consistency_streak',
  'bdt_shadow_cost_last_triggered',
  'bdt_shadow_cost_shown_tx_ids',
  'bdt_surplus_strike_last_triggered',
  'bdt_strategy_pivot_shown',
  'bdt_consistency_history',
  
  // Subscription matching
  'bdt_subscription_matches',
  
  // Achievements & gamification
  'achievements',
  'initial-debt-total',
  'unlocked-achievements',
  'achievement-timestamps',
  
  // Onboarding & UI state
  'onboarding_complete',
  'privacy_notice_dismissed',
  'pwa-banner-dismissed',
  
  // Backup metadata
  'last_backup',
];

// Household view mode uses a different key format
const HOUSEHOLD_VIEW_KEY = 'household-view-mode';

export function clearAllUserData(userId: string): void {
  // Clear standard user-prefixed keys
  LOCAL_STORAGE_KEYS.forEach(key => {
    const userKey = `${userId}_${key}`;
    localStorage.removeItem(userKey);
  });
  
  // Clear household view mode (uses different format)
  localStorage.removeItem(`${HOUSEHOLD_VIEW_KEY}-${userId}`);
}

export function clearSelectiveData(userId: string, options: ClearDataOptions): number {
  let clearedCount = 0;
  
  if (options.transactions) {
    localStorage.removeItem(`${userId}_transactions`);
    clearedCount++;
  }
  
  if (options.expenses) {
    localStorage.removeItem(`${userId}_expenses`);
    localStorage.removeItem(`${userId}_bdt_expenses`);
    localStorage.removeItem(`${userId}_bdt_group_order`);
    clearedCount++;
  }
  
  if (options.debts) {
    localStorage.removeItem(`${userId}_debts`);
    localStorage.removeItem(`${userId}_bdt_debts`);
    // Clear achievement baseline since it's debt-related
    localStorage.removeItem(`${userId}_initial-debt-total`);
    clearedCount++;
  }
  
  if (options.subscriptions) {
    localStorage.removeItem(`${userId}_subscriptions`);
    localStorage.removeItem(`${userId}_bdt_subscription_matches`);
    clearedCount++;
  }
  
  if (options.accounts) {
    localStorage.removeItem(`${userId}_accounts`);
    localStorage.removeItem(`${userId}_bdt_assets`);
    clearedCount++;
  }
  
  if (options.settings) {
    // Income and strategy
    localStorage.removeItem(`${userId}_bdt_income`);
    localStorage.removeItem(`${userId}_bdt_strategy`);
    
    // Achievements
    localStorage.removeItem(`${userId}_achievements`);
    localStorage.removeItem(`${userId}_unlocked-achievements`);
    localStorage.removeItem(`${userId}_achievement-timestamps`);
    
    // Behavioral engine state
    localStorage.removeItem(`${userId}_bdt_consistency_streak`);
    localStorage.removeItem(`${userId}_bdt_shadow_cost_last_triggered`);
    localStorage.removeItem(`${userId}_bdt_shadow_cost_shown_tx_ids`);
    localStorage.removeItem(`${userId}_bdt_surplus_strike_last_triggered`);
    localStorage.removeItem(`${userId}_bdt_strategy_pivot_shown`);
    localStorage.removeItem(`${userId}_bdt_consistency_history`);
    
    // Onboarding & UI
    localStorage.removeItem(`${userId}_onboarding_complete`);
    localStorage.removeItem(`${userId}_privacy_notice_dismissed`);
    localStorage.removeItem(`${userId}_pwa-banner-dismissed`);
    
    // Backup metadata
    localStorage.removeItem(`${userId}_last_backup`);
    
    // Household view mode
    localStorage.removeItem(`${HOUSEHOLD_VIEW_KEY}-${userId}`);
    
    clearedCount++;
  }
  
  return clearedCount;
}
