import { Expense, Debt, Asset } from './csvUtils';
import { Account, Transaction } from '@/types/transactions';
import { DEMO_EXPENSES, DEMO_DEBTS, DEMO_ASSETS } from './constants';

export const DEMO_INCOME = 18254;

export const DEMO_ACCOUNTS: Account[] = [
  { id: "demo-checking", name: "Main Checking", type: "checking", balance: 0, isActive: true },
  { id: "demo-savings", name: "Emergency Savings", type: "savings", balance: 0, isActive: true },
  { id: "demo-credit", name: "Chase Freedom", type: "credit", balance: 0, isActive: true },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  // Recent income
  { id: "t1", date: "2025-01-15", description: "Paycheck - Acme Corp", amount: 9127, category: "Salary", accountId: "demo-checking", flow: "in" },
  { id: "t2", date: "2025-01-01", description: "Paycheck - Acme Corp", amount: 9127, category: "Salary", accountId: "demo-checking", flow: "in" },
  
  // Recent expenses from demo data
  { id: "t3", date: "2025-01-20", description: "Whole Foods", amount: 150.43, category: "Essentials", accountId: "demo-checking", flow: "out", expenseId: "e4" },
  { id: "t4", date: "2025-01-19", description: "Shell Gas Station", amount: 75.20, category: "Discretionary", accountId: "demo-checking", flow: "out", expenseId: "e6" },
  { id: "t5", date: "2025-01-18", description: "Netflix", amount: 15.99, category: "Discretionary", accountId: "demo-checking", flow: "out", expenseId: "e6" },
  { id: "t6", date: "2025-01-17", description: "Domino's Pizza", amount: 42.75, category: "Discretionary", accountId: "demo-checking", flow: "out", expenseId: "e6" },
  { id: "t7", date: "2025-01-16", description: "Target", amount: 187.89, category: "Discretionary", accountId: "demo-checking", flow: "out", expenseId: "e6" },
  { id: "t8", date: "2025-01-15", description: "Electric Bill - PG&E", amount: 145.45, category: "Essentials", accountId: "demo-checking", flow: "out", expenseId: "e4" },
  { id: "t9", date: "2025-01-14", description: "Verizon", amount: 95.00, category: "Essentials", accountId: "demo-checking", flow: "out", expenseId: "e4" },
  { id: "t10", date: "2025-01-12", description: "Safeway", amount: 123.16, category: "Essentials", accountId: "demo-checking", flow: "out", expenseId: "e4" },
  
  // Monthly recurring from demo expenses
  { id: "t13", date: "2025-01-01", description: "Mortgage Payment IL", amount: 1661, category: "Housing", accountId: "demo-checking", flow: "out", expenseId: "e1" },
  { id: "t14", date: "2025-01-01", description: "Mortgage Payment CT", amount: 1661, category: "Housing", accountId: "demo-checking", flow: "out", expenseId: "e1" },
  { id: "t15", date: "2025-01-05", description: "Best Egg Loan", amount: 808, category: "Debt", accountId: "demo-checking", flow: "out", expenseId: "e2" },
  { id: "t16", date: "2025-01-05", description: "401k Loan", amount: 469, category: "Debt", accountId: "demo-checking", flow: "out", expenseId: "e2" },
  { id: "t17", date: "2025-01-05", description: "Kia Auto Loan", amount: 499, category: "Debt", accountId: "demo-checking", flow: "out", expenseId: "e2" },
  { id: "t18", date: "2025-01-10", description: "HELOC Payment", amount: 64, category: "Debt", accountId: "demo-checking", flow: "out", expenseId: "e3" },
  { id: "t19", date: "2025-01-15", description: "Child Support", amount: 500, category: "Family", accountId: "demo-checking", flow: "out", expenseId: "e5" },
];

// Function to set up demo data in localStorage
export function setupDemoData(userId: string): void {
  localStorage.setItem(`${userId}_bdt_income`, JSON.stringify(DEMO_INCOME));
  localStorage.setItem(`${userId}_bdt_expenses`, JSON.stringify(DEMO_EXPENSES));
  localStorage.setItem(`${userId}_bdt_debts`, JSON.stringify(DEMO_DEBTS));
  localStorage.setItem(`${userId}_bdt_assets`, JSON.stringify(DEMO_ASSETS));
  localStorage.setItem(`${userId}_bdt_accounts`, JSON.stringify(DEMO_ACCOUNTS));
  localStorage.setItem(`${userId}_bdt_transactions`, JSON.stringify(DEMO_TRANSACTIONS));
  localStorage.setItem(`${userId}_bdt_strategy`, JSON.stringify("Avalanche"));
}

// Function to clear demo data
export function clearDemoData(userId: string): void {
  localStorage.removeItem(`${userId}_bdt_income`);
  localStorage.removeItem(`${userId}_bdt_expenses`);
  localStorage.removeItem(`${userId}_bdt_debts`);
  localStorage.removeItem(`${userId}_bdt_assets`);
  localStorage.removeItem(`${userId}_bdt_accounts`);
  localStorage.removeItem(`${userId}_bdt_transactions`);
  localStorage.removeItem(`${userId}_bdt_group_order`);
  localStorage.removeItem(`${userId}_bdt_strategy`);
  localStorage.removeItem(`${userId}_bdt_subscriptions`);
}

// Check if demo data is already set up
export function isDemoDataSetup(userId: string): boolean {
  const storedIncome = localStorage.getItem(`${userId}_bdt_income`);
  return storedIncome !== null && JSON.parse(storedIncome) > 0;
}