import { Transaction } from '@/hooks/useLocalTransactions';
import { Expense } from '@/hooks/useLocalExpenses';
import { Debt } from '@/hooks/useLocalDebts';
import { Subscription } from '@/hooks/useLocalSubscriptions';

export interface BackupData {
  version: string;
  exportedAt: string;
  appName: string;
  data: {
    transactions: Transaction[];
    expenses: Expense[];
    debts: Debt[];
    subscriptions: Subscription[];
    accounts: any[];
    settings: {
      income?: number;
      strategy?: string;
      assets?: any[];
    };
  };
  metadata: {
    transactionCount: number;
    expenseCount: number;
    debtCount: number;
    subscriptionCount: number;
    accountCount: number;
  };
}

export interface RestoreResult {
  success: boolean;
  message: string;
  counts?: {
    transactions: number;
    expenses: number;
    debts: number;
    subscriptions: number;
    accounts: number;
  };
}

const BACKUP_VERSION = '1.0';
const APP_NAME = 'Zero Hero';

// Get user-specific localStorage key
function getUserKey(userId: string, key: string): string {
  return `${userId}_${key}`;
}

// Get all user data from localStorage
export function gatherUserData(userId: string): BackupData['data'] {
  const getItem = <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(getUserKey(userId, key));
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  return {
    transactions: getItem<Transaction[]>('transactions', []),
    expenses: getItem<Expense[]>('expenses', []),
    debts: getItem<Debt[]>('debts', []),
    subscriptions: getItem<Subscription[]>('subscriptions', []),
    accounts: getItem<any[]>('accounts', []),
    settings: {
      income: getItem<number>('monthly_income', 0),
      strategy: getItem<string>('debt_strategy', 'Snowball'),
      assets: getItem<any[]>('assets', []),
    },
  };
}

// Create a full backup object
export function createBackup(userId: string): BackupData {
  const data = gatherUserData(userId);
  
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    appName: APP_NAME,
    data,
    metadata: {
      transactionCount: data.transactions.length,
      expenseCount: data.expenses.length,
      debtCount: data.debts.length,
      subscriptionCount: data.subscriptions.length,
      accountCount: data.accounts.length,
    },
  };
}

// Download backup as JSON file
export function downloadBackup(backup: BackupData): void {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const date = new Date().toISOString().split('T')[0];
  const filename = `zero-hero-backup-${date}.json`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Validate backup file structure
export function validateBackup(data: any): { isValid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid file format' };
  }
  
  if (!data.version) {
    return { isValid: false, error: 'Missing version information' };
  }
  
  if (!data.appName || data.appName !== APP_NAME) {
    return { isValid: false, error: 'This backup is from a different application' };
  }
  
  if (!data.data || typeof data.data !== 'object') {
    return { isValid: false, error: 'Missing data section' };
  }
  
  const requiredArrays = ['transactions', 'expenses', 'debts', 'subscriptions'];
  for (const key of requiredArrays) {
    if (data.data[key] && !Array.isArray(data.data[key])) {
      return { isValid: false, error: `Invalid ${key} data` };
    }
  }
  
  return { isValid: true };
}

// Parse backup file
export async function parseBackupFile(file: File): Promise<{ backup: BackupData | null; error?: string }> {
  try {
    if (!file.name.endsWith('.json')) {
      return { backup: null, error: 'Please select a JSON file' };
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return { backup: null, error: 'File is too large (max 50MB)' };
    }
    
    const text = await file.text();
    const data = JSON.parse(text);
    
    const validation = validateBackup(data);
    if (!validation.isValid) {
      return { backup: null, error: validation.error };
    }
    
    return { backup: data as BackupData };
  } catch (e) {
    return { backup: null, error: 'Failed to parse backup file' };
  }
}

// Restore data from backup
export function restoreFromBackup(
  userId: string,
  backup: BackupData,
  options: {
    replaceExisting: boolean;
    restoreTransactions: boolean;
    restoreExpenses: boolean;
    restoreDebts: boolean;
    restoreSubscriptions: boolean;
    restoreAccounts: boolean;
    restoreSettings: boolean;
  }
): RestoreResult {
  try {
    const setItem = (key: string, value: any) => {
      localStorage.setItem(getUserKey(userId, key), JSON.stringify(value));
    };
    
    const getItem = <T>(key: string, fallback: T): T => {
      try {
        const item = localStorage.getItem(getUserKey(userId, key));
        return item ? JSON.parse(item) : fallback;
      } catch {
        return fallback;
      }
    };
    
    const counts = {
      transactions: 0,
      expenses: 0,
      debts: 0,
      subscriptions: 0,
      accounts: 0,
    };
    
    if (options.restoreTransactions && backup.data.transactions) {
      if (options.replaceExisting) {
        setItem('transactions', backup.data.transactions);
        counts.transactions = backup.data.transactions.length;
      } else {
        const existing = getItem<Transaction[]>('transactions', []);
        const merged = [...existing, ...backup.data.transactions];
        setItem('transactions', merged);
        counts.transactions = backup.data.transactions.length;
      }
    }
    
    if (options.restoreExpenses && backup.data.expenses) {
      if (options.replaceExisting) {
        setItem('expenses', backup.data.expenses);
        counts.expenses = backup.data.expenses.length;
      } else {
        const existing = getItem<Expense[]>('expenses', []);
        const merged = [...existing, ...backup.data.expenses];
        setItem('expenses', merged);
        counts.expenses = backup.data.expenses.length;
      }
    }
    
    if (options.restoreDebts && backup.data.debts) {
      if (options.replaceExisting) {
        setItem('debts', backup.data.debts);
        counts.debts = backup.data.debts.length;
      } else {
        const existing = getItem<Debt[]>('debts', []);
        const merged = [...existing, ...backup.data.debts];
        setItem('debts', merged);
        counts.debts = backup.data.debts.length;
      }
    }
    
    if (options.restoreSubscriptions && backup.data.subscriptions) {
      if (options.replaceExisting) {
        setItem('subscriptions', backup.data.subscriptions);
        counts.subscriptions = backup.data.subscriptions.length;
      } else {
        const existing = getItem<Subscription[]>('subscriptions', []);
        const merged = [...existing, ...backup.data.subscriptions];
        setItem('subscriptions', merged);
        counts.subscriptions = backup.data.subscriptions.length;
      }
    }
    
    if (options.restoreAccounts && backup.data.accounts) {
      if (options.replaceExisting) {
        setItem('accounts', backup.data.accounts);
        counts.accounts = backup.data.accounts.length;
      } else {
        const existing = getItem<any[]>('accounts', []);
        const merged = [...existing, ...backup.data.accounts];
        setItem('accounts', merged);
        counts.accounts = backup.data.accounts.length;
      }
    }
    
    if (options.restoreSettings && backup.data.settings) {
      if (backup.data.settings.income !== undefined) {
        setItem('monthly_income', backup.data.settings.income);
      }
      if (backup.data.settings.strategy) {
        setItem('debt_strategy', backup.data.settings.strategy);
      }
      if (backup.data.settings.assets) {
        setItem('assets', backup.data.settings.assets);
      }
    }
    
    return {
      success: true,
      message: 'Backup restored successfully',
      counts,
    };
  } catch (e) {
    return {
      success: false,
      message: 'Failed to restore backup',
    };
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
