// Data clearing utilities for local storage

export interface ClearDataOptions {
  transactions: boolean;
  expenses: boolean;
  debts: boolean;
  subscriptions: boolean;
  accounts: boolean;
  settings: boolean;
}

const LOCAL_STORAGE_KEYS = [
  'transactions',
  'expenses', 
  'debts',
  'subscriptions',
  'accounts',
  'bdt_income',
  'bdt_strategy',
  'bdt_expenses',
  'bdt_assets',
  'bdt_debts',
  'bdt_group_order',
  'achievements',
  'onboarding_complete',
  'privacy_notice_dismissed',
];

export function clearAllUserData(userId: string): void {
  LOCAL_STORAGE_KEYS.forEach(key => {
    const userKey = `${userId}_${key}`;
    localStorage.removeItem(userKey);
  });
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
    clearedCount++;
  }
  
  if (options.subscriptions) {
    localStorage.removeItem(`${userId}_subscriptions`);
    clearedCount++;
  }
  
  if (options.accounts) {
    localStorage.removeItem(`${userId}_accounts`);
    localStorage.removeItem(`${userId}_bdt_assets`);
    clearedCount++;
  }
  
  if (options.settings) {
    localStorage.removeItem(`${userId}_bdt_income`);
    localStorage.removeItem(`${userId}_bdt_strategy`);
    localStorage.removeItem(`${userId}_achievements`);
    localStorage.removeItem(`${userId}_onboarding_complete`);
    clearedCount++;
  }
  
  return clearedCount;
}
