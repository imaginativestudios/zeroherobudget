/**
 * Demo Data Loader
 * 
 * Loads comprehensive demo data for prospective customers.
 * Uses a fixed DEMO_USER_ID to isolate demo data from real users.
 * 
 * Real users who sign up get a completely fresh, empty state.
 */

import { v4 as uuidv4 } from 'uuid';
import { format, subDays, subMonths, startOfMonth, addDays } from 'date-fns';
import { DEMO_EXPENSES, DEMO_DEBTS, DEMO_ASSETS } from './constants';

// Fixed demo user ID - completely isolated from real authenticated users
export const DEMO_USER_ID = 'demo-hero-00000000';

// Helper to generate a consistent date for the current month
const getCurrentMonthDate = (day: number) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), day);
};

// Demo subscriptions - common services people recognize
export const DEMO_SUBSCRIPTIONS = [
  { name: 'Netflix', amount: 15.99, billing_cycle: 'monthly', category: 'Entertainment', next_billing_date: format(addDays(new Date(), 5), 'yyyy-MM-dd'), is_active: true },
  { name: 'Spotify Premium', amount: 10.99, billing_cycle: 'monthly', category: 'Entertainment', next_billing_date: format(addDays(new Date(), 12), 'yyyy-MM-dd'), is_active: true },
  { name: 'Amazon Prime', amount: 14.99, billing_cycle: 'monthly', category: 'Miscellaneous', next_billing_date: format(addDays(new Date(), 8), 'yyyy-MM-dd'), is_active: true },
  { name: 'Disney+', amount: 13.99, billing_cycle: 'monthly', category: 'Entertainment', next_billing_date: format(addDays(new Date(), 18), 'yyyy-MM-dd'), is_active: true },
  { name: 'Planet Fitness', amount: 24.99, billing_cycle: 'monthly', category: 'Personal Care', next_billing_date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), is_active: true },
  { name: 'Apple iCloud', amount: 2.99, billing_cycle: 'monthly', category: 'Miscellaneous', next_billing_date: format(addDays(new Date(), 22), 'yyyy-MM-dd'), is_active: true },
  { name: 'YouTube Premium', amount: 13.99, billing_cycle: 'monthly', category: 'Entertainment', next_billing_date: format(addDays(new Date(), 15), 'yyyy-MM-dd'), is_active: true },
  { name: 'Adobe Creative Cloud', amount: 54.99, billing_cycle: 'monthly', category: 'Miscellaneous', next_billing_date: format(addDays(new Date(), 25), 'yyyy-MM-dd'), is_active: false }, // Canceled example
];

// Demo hero profile - shows progress through the journey
export const DEMO_HERO_PROFILE = {
  onboardingComplete: true,
  onboardingStep: 6 as const,
  hourlyWage: 28, // ~$58k/year - median US income
  moatTarget: 1000,
  moatCurrent: 650, // 65% progress - showing momentum
  createdAt: format(subDays(new Date(), 45), 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''), // 45 days ago
  activityLog: [
    { date: format(subDays(new Date(), 0), 'yyyy-MM-dd'), type: 'login' },
    { date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), type: 'login' },
    { date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), type: 'login' },
    { date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), type: 'transaction' },
    { date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), type: 'payment' },
  ],
};

// Demo savings vault for Moat visualization
export const DEMO_SAVINGS_VAULT = {
  balance: 650,
  target: 1000,
  deposits: [
    { amount: 200, date: format(subDays(new Date(), 30), 'yyyy-MM-dd'), note: 'Initial deposit' },
    { amount: 150, date: format(subDays(new Date(), 20), 'yyyy-MM-dd'), note: 'Bonus from work' },
    { amount: 100, date: format(subDays(new Date(), 14), 'yyyy-MM-dd'), note: 'Weekly transfer' },
    { amount: 100, date: format(subDays(new Date(), 7), 'yyyy-MM-dd'), note: 'Weekly transfer' },
    { amount: 100, date: format(subDays(new Date(), 1), 'yyyy-MM-dd'), note: 'Weekly transfer' },
  ],
  breachAcknowledged: false,
  repairMode: false,
};

// Generate realistic transactions for the demo
function generateDemoTransactions() {
  const transactions: any[] = [];
  const now = new Date();
  
  // Generate 3 months of transactions
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const monthStart = startOfMonth(subMonths(now, monthOffset));
    const monthStr = format(monthStart, 'yyyy-MM');
    
    // Income - 2 biweekly paychecks per month
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 0), 'yyyy-MM-dd'),
      description: 'Payroll Deposit - ABC Corp',
      amount: 2900,
      category: 'Income',
      flow: 'inflow',
      expense_id: null,
      notes: 'Biweekly paycheck',
    });
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 14), 'yyyy-MM-dd'),
      description: 'Payroll Deposit - ABC Corp',
      amount: 2900,
      category: 'Income',
      flow: 'inflow',
      expense_id: null,
      notes: 'Biweekly paycheck',
    });
    
    // Housing - Rent on the 1st
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 0), 'yyyy-MM-dd'),
      description: 'Landlord - Monthly Rent',
      amount: 1800,
      category: 'Housing',
      flow: 'outflow',
      expense_id: 'e1',
      notes: '',
    });
    
    // Utilities
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 5), 'yyyy-MM-dd'),
      description: 'City Electric Co.',
      amount: 142 + Math.floor(Math.random() * 30) - 15,
      category: 'Utilities',
      flow: 'outflow',
      expense_id: 'e6',
      notes: '',
    });
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 8), 'yyyy-MM-dd'),
      description: 'Natural Gas Utility',
      amount: 78 + Math.floor(Math.random() * 20) - 10,
      category: 'Utilities',
      flow: 'outflow',
      expense_id: 'e7',
      notes: '',
    });
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 10), 'yyyy-MM-dd'),
      description: 'Water & Sewer Dept',
      amount: 62,
      category: 'Utilities',
      flow: 'outflow',
      expense_id: 'e8',
      notes: '',
    });
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 3), 'yyyy-MM-dd'),
      description: 'Xfinity Internet',
      amount: 75,
      category: 'Utilities',
      flow: 'outflow',
      expense_id: 'e10',
      notes: '',
    });
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 12), 'yyyy-MM-dd'),
      description: 'Verizon Wireless',
      amount: 120,
      category: 'Utilities',
      flow: 'outflow',
      expense_id: 'e11',
      notes: '',
    });
    
    // Transportation
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 15), 'yyyy-MM-dd'),
      description: 'Kia Finance - Auto Loan',
      amount: 450,
      category: 'Transportation',
      flow: 'outflow',
      expense_id: 'e12',
      notes: '',
    });
    
    // Gas/Fuel - multiple times per month
    const gasStations = ['Shell', 'Exxon', 'Chevron', 'BP'];
    for (let i = 0; i < 4; i++) {
      transactions.push({
        id: uuidv4(),
        date: format(addDays(monthStart, 2 + i * 7), 'yyyy-MM-dd'),
        description: `${gasStations[i]} Gas Station`,
        amount: 45 + Math.floor(Math.random() * 15),
        category: 'Transportation',
        flow: 'outflow',
        expense_id: 'e13',
        notes: '',
      });
    }
    
    // Groceries - weekly shopping
    const groceryStores = ['Kroger', 'Walmart', 'Whole Foods', 'Trader Joe\'s'];
    for (let i = 0; i < 4; i++) {
      transactions.push({
        id: uuidv4(),
        date: format(addDays(monthStart, 3 + i * 7), 'yyyy-MM-dd'),
        description: groceryStores[i],
        amount: 150 + Math.floor(Math.random() * 80),
        category: 'Food',
        flow: 'outflow',
        expense_id: 'e17',
        notes: '',
      });
    }
    
    // Dining out
    const restaurants = ['Chipotle', 'Olive Garden', 'Local Pizza Shop', 'Starbucks', 'Panera Bread'];
    for (let i = 0; i < 5; i++) {
      transactions.push({
        id: uuidv4(),
        date: format(addDays(monthStart, 4 + i * 5), 'yyyy-MM-dd'),
        description: restaurants[i],
        amount: 15 + Math.floor(Math.random() * 45),
        category: 'Food',
        flow: 'outflow',
        expense_id: 'e18',
        notes: '',
      });
    }
    
    // Insurance
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 1), 'yyyy-MM-dd'),
      description: 'Blue Cross Health Insurance',
      amount: 400,
      category: 'Insurance & Healthcare',
      flow: 'outflow',
      expense_id: 'e20',
      notes: 'Monthly premium',
    });
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 18), 'yyyy-MM-dd'),
      description: 'State Farm Auto Insurance',
      amount: 150,
      category: 'Transportation',
      flow: 'outflow',
      expense_id: 'e14',
      notes: '',
    });
    
    // Subscriptions
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 5), 'yyyy-MM-dd'),
      description: 'Netflix',
      amount: 15.99,
      category: 'Entertainment',
      flow: 'outflow',
      expense_id: 'e28',
      notes: '',
    });
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 12), 'yyyy-MM-dd'),
      description: 'Spotify Premium',
      amount: 10.99,
      category: 'Entertainment',
      flow: 'outflow',
      expense_id: 'e28',
      notes: '',
    });
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 8), 'yyyy-MM-dd'),
      description: 'Amazon Prime',
      amount: 14.99,
      category: 'Miscellaneous',
      flow: 'outflow',
      expense_id: 'e38',
      notes: '',
    });
    
    // Debt payments
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 20), 'yyyy-MM-dd'),
      description: 'Best Egg Loan Payment',
      amount: 808,
      category: 'Debt Payments',
      flow: 'outflow',
      expense_id: 'e34',
      notes: 'Auto-pay',
    });
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 25), 'yyyy-MM-dd'),
      description: 'Amex Payment',
      amount: 150,
      category: 'Debt Payments',
      flow: 'outflow',
      expense_id: 'e35',
      notes: '',
    });
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 22), 'yyyy-MM-dd'),
      description: '401k Loan Repayment',
      amount: 469,
      category: 'Debt Payments',
      flow: 'outflow',
      expense_id: 'e34',
      notes: 'Payroll deduction',
    });
    
    // Savings transfer
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 1), 'yyyy-MM-dd'),
      description: 'Transfer to Emergency Fund',
      amount: 100,
      category: 'Savings & Investments',
      flow: 'outflow',
      expense_id: 'e31',
      notes: 'Building the Moat!',
    });
    
    // Entertainment/Hobbies
    transactions.push({
      id: uuidv4(),
      date: format(addDays(monthStart, 16), 'yyyy-MM-dd'),
      description: 'AMC Theaters',
      amount: 32,
      category: 'Entertainment',
      flow: 'outflow',
      expense_id: 'e30',
      notes: '',
    });
  }
  
  // Sort by date descending (most recent first)
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Convert demo expenses to the format used by localStorage hooks
function convertDemoExpenses() {
  return DEMO_EXPENSES.map((expense, index) => ({
    id: expense.id,
    name: expense.name,
    amount: expense.planned,
    category: expense.category,
    is_income: false,
    user_id: DEMO_USER_ID,
    household_id: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sort_order: index,
  }));
}

// Convert demo debts to the format used by localStorage hooks
function convertDemoDebts() {
  return DEMO_DEBTS.map(debt => ({
    id: debt.id,
    name: debt.name,
    balance: debt.balance,
    interest_rate: debt.apr,
    minimum_payment: debt.min,
    type: debt.type,
    user_id: DEMO_USER_ID,
    household_id: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

// Convert demo subscriptions to the format used by localStorage hooks
function convertDemoSubscriptions() {
  return DEMO_SUBSCRIPTIONS.map((sub, index) => ({
    id: uuidv4(),
    name: sub.name,
    amount: sub.amount,
    billing_cycle: sub.billing_cycle,
    category: sub.category,
    next_billing_date: sub.next_billing_date,
    is_active: sub.is_active,
    user_id: DEMO_USER_ID,
    household_id: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

// Convert transactions to the format used by localStorage hooks
function convertDemoTransactions() {
  const transactions = generateDemoTransactions();
  return transactions.map(tx => ({
    ...tx,
    user_id: DEMO_USER_ID,
    household_id: undefined,
    account_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

/**
 * Load all demo data into localStorage under the demo user ID.
 * This is completely isolated from real authenticated users.
 * 
 * SAFETY: Only loads demo data if no authenticated session exists.
 * Returns early with a warning if an auth session is detected.
 */
export function loadDemoData(): { loaded: boolean; summary: string } {
  try {
    // SAFETY CHECK: Detect if an auth session exists
    // Demo data should never be loaded for authenticated users
    const hasAuthSession = Object.keys(localStorage).some(key => 
      key.includes('sb-') && key.includes('auth-token')
    );
    
    if (hasAuthSession) {
      console.warn('[Demo Data] Auth session detected. Refusing to load demo data for authenticated user.');
      return { loaded: false, summary: 'Cannot load demo data while logged in. Please log out first.' };
    }
    
    // Clear any existing demo data first
    clearDemoData();
    
    // Write demo data with the demo user prefix
    const prefix = `${DEMO_USER_ID}_`;
    
    // Expenses
    const expenses = convertDemoExpenses();
    localStorage.setItem(`${prefix}expenses`, JSON.stringify(expenses));
    
    // Debts
    const debts = convertDemoDebts();
    localStorage.setItem(`${prefix}debts`, JSON.stringify(debts));
    
    // Transactions
    const transactions = convertDemoTransactions();
    localStorage.setItem(`${prefix}transactions`, JSON.stringify(transactions));
    
    // Subscriptions
    const subscriptions = convertDemoSubscriptions();
    localStorage.setItem(`${prefix}subscriptions`, JSON.stringify(subscriptions));
    
    // Hero Profile
    localStorage.setItem(`${prefix}hero_profile`, JSON.stringify(DEMO_HERO_PROFILE));
    
    // Savings Vault (Moat)
    localStorage.setItem(`${prefix}savings_vault`, JSON.stringify(DEMO_SAVINGS_VAULT));
    
    // Monthly Income
    localStorage.setItem(`${prefix}bdt_income`, JSON.stringify(5800));
    
    // Strategy
    localStorage.setItem(`${prefix}strategy`, JSON.stringify('Snowball'));
    
    // Behavioral engine state (shows some history)
    localStorage.setItem(`${prefix}behavioral_engine`, JSON.stringify({
      lastCheckIn: new Date().toISOString(),
      streakDays: 5,
      totalStrikesCompleted: 3,
      lifetimeSaved: 450,
    }));
    
    const summary = `Loaded ${expenses.length} expenses, ${debts.length} debts, ${transactions.length} transactions, ${subscriptions.length} subscriptions`;
    
    return { loaded: true, summary };
  } catch (error) {
    console.error('[Demo Data] Failed to load demo data:', error);
    return { loaded: false, summary: 'Failed to load demo data' };
  }
}

/**
 * Clear all demo data from localStorage
 */
export function clearDemoData(): void {
  const prefix = `${DEMO_USER_ID}_`;
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Check if demo data is currently loaded
 */
export function isDemoDataLoaded(): boolean {
  return localStorage.getItem(`${DEMO_USER_ID}_expenses`) !== null;
}
