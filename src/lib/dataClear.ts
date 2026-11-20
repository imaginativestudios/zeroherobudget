import { safeLocalStorage } from '@/lib/safeStorage';
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
  'budget_seeded',
  
  // Backup metadata
  'last_backup',
];

// Household view mode uses a different key format
const HOUSEHOLD_VIEW_KEY = 'household-view-mode';

export function clearAllUserData(userId: string): void {
  // Clear standard user-prefixed keys
  LOCAL_STORAGE_KEYS.forEach(key => {
    const userKey = `${userId}_${key}`;
    safeLocalStorage.removeItem(userKey);
  });
  
  // Clear household view mode (uses different format)
  safeLocalStorage.removeItem(`${HOUSEHOLD_VIEW_KEY}-${userId}`);
}

export function clearSelectiveData(userId: string, options: ClearDataOptions): number {
  let clearedCount = 0;
  
  if (options.transactions) {
    safeLocalStorage.removeItem(`${userId}_transactions`);
    clearedCount++;
  }
  
  if (options.expenses) {
    safeLocalStorage.removeItem(`${userId}_expenses`);
    safeLocalStorage.removeItem(`${userId}_bdt_expenses`);
    safeLocalStorage.removeItem(`${userId}_bdt_group_order`);
    clearedCount++;
  }
  
  if (options.debts) {
    safeLocalStorage.removeItem(`${userId}_debts`);
    safeLocalStorage.removeItem(`${userId}_bdt_debts`);
    // Clear achievement baseline since it's debt-related
    safeLocalStorage.removeItem(`${userId}_initial-debt-total`);
    clearedCount++;
  }
  
  if (options.subscriptions) {
    safeLocalStorage.removeItem(`${userId}_subscriptions`);
    safeLocalStorage.removeItem(`${userId}_bdt_subscription_matches`);
    clearedCount++;
  }
  
  if (options.accounts) {
    safeLocalStorage.removeItem(`${userId}_accounts`);
    safeLocalStorage.removeItem(`${userId}_bdt_assets`);
    clearedCount++;
  }
  
  if (options.settings) {
    // Income and strategy
    safeLocalStorage.removeItem(`${userId}_bdt_income`);
    safeLocalStorage.removeItem(`${userId}_bdt_strategy`);
    
    // Achievements
    safeLocalStorage.removeItem(`${userId}_achievements`);
    safeLocalStorage.removeItem(`${userId}_unlocked-achievements`);
    safeLocalStorage.removeItem(`${userId}_achievement-timestamps`);
    
    // Behavioral engine state
    safeLocalStorage.removeItem(`${userId}_bdt_consistency_streak`);
    safeLocalStorage.removeItem(`${userId}_bdt_shadow_cost_last_triggered`);
    safeLocalStorage.removeItem(`${userId}_bdt_shadow_cost_shown_tx_ids`);
    safeLocalStorage.removeItem(`${userId}_bdt_surplus_strike_last_triggered`);
    safeLocalStorage.removeItem(`${userId}_bdt_strategy_pivot_shown`);
    safeLocalStorage.removeItem(`${userId}_bdt_consistency_history`);
    
    // Onboarding & UI
    safeLocalStorage.removeItem(`${userId}_onboarding_complete`);
    safeLocalStorage.removeItem(`${userId}_privacy_notice_dismissed`);
    safeLocalStorage.removeItem(`${userId}_pwa-banner-dismissed`);
    safeLocalStorage.removeItem(`${userId}_budget_seeded`);
    
    // Backup metadata
    safeLocalStorage.removeItem(`${userId}_last_backup`);
    
    // Household view mode
    safeLocalStorage.removeItem(`${HOUSEHOLD_VIEW_KEY}-${userId}`);
    
    clearedCount++;
  }
  
  return clearedCount;
}
