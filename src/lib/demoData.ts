import { Expense, Debt, Asset } from './csvUtils';
import { Account, Transaction } from '@/types/transactions';
import { DEMO_EXPENSES, DEMO_DEBTS, DEMO_ASSETS } from './constants';

export const DEMO_INCOME = 8500;

export const DEMO_ACCOUNTS: Account[] = [
  { id: "demo-checking", name: "Main Checking", type: "checking", balance: 0, isActive: true },
  { id: "demo-savings", name: "Emergency Savings", type: "savings", balance: 0, isActive: true },
  { id: "demo-credit", name: "Chase Freedom", type: "credit", balance: 0, isActive: true },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  // Recent income - bi-weekly paychecks
  { id: "t1", date: "2025-01-15", description: "Paycheck - Acme Corp", amount: 4250, category: "Salary", accountId: "demo-checking", flow: "in" },
  { id: "t2", date: "2025-01-01", description: "Paycheck - Acme Corp", amount: 4250, category: "Salary", accountId: "demo-checking", flow: "in" },
  
  // Recent expenses - Food
  { id: "t3", date: "2025-01-20", description: "Whole Foods", amount: 156.43, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e17" },
  { id: "t4", date: "2025-01-18", description: "Starbucks", amount: 12.50, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e19" },
  { id: "t5", date: "2025-01-17", description: "Chipotle", amount: 28.75, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e18" },
  { id: "t6", date: "2025-01-15", description: "Trader Joe's", amount: 89.23, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e17" },
  { id: "t7", date: "2025-01-12", description: "Safeway", amount: 123.16, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e17" },
  
  // Transportation
  { id: "t8", date: "2025-01-19", description: "Shell Gas Station", amount: 65.20, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e13" },
  { id: "t9", date: "2025-01-10", description: "Jiffy Lube", amount: 45.00, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e15" },
  
  // Entertainment
  { id: "t10", date: "2025-01-18", description: "Netflix", amount: 15.99, category: "Entertainment", accountId: "demo-checking", flow: "out", expenseId: "e28" },
  { id: "t11", date: "2025-01-18", description: "Spotify", amount: 10.99, category: "Entertainment", accountId: "demo-checking", flow: "out", expenseId: "e28" },
  { id: "t12", date: "2025-01-14", description: "AMC Theatres", amount: 42.00, category: "Entertainment", accountId: "demo-checking", flow: "out", expenseId: "e30" },
  
  // Personal Care
  { id: "t13", date: "2025-01-16", description: "Target", amount: 67.89, category: "Personal Care", accountId: "demo-checking", flow: "out", expenseId: "e26" },
  { id: "t14", date: "2025-01-11", description: "Great Clips", amount: 18.00, category: "Personal Care", accountId: "demo-checking", flow: "out", expenseId: "e27" },
  
  // Monthly recurring - Housing
  { id: "t15", date: "2025-01-01", description: "Mortgage Payment", amount: 1800, category: "Housing", accountId: "demo-checking", flow: "out", expenseId: "e1" },
  { id: "t16", date: "2025-01-01", description: "Property Tax", amount: 250, category: "Housing", accountId: "demo-checking", flow: "out", expenseId: "e2" },
  { id: "t17", date: "2025-01-01", description: "Home Insurance", amount: 125, category: "Housing", accountId: "demo-checking", flow: "out", expenseId: "e3" },
  
  // Utilities
  { id: "t18", date: "2025-01-15", description: "Electric Bill - PG&E", amount: 145.45, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e6" },
  { id: "t19", date: "2025-01-14", description: "Verizon Wireless", amount: 120.00, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e11" },
  { id: "t20", date: "2025-01-10", description: "Comcast Internet", amount: 75.00, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e10" },
  { id: "t21", date: "2025-01-08", description: "Gas Company", amount: 78.50, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e7" },
  
  // Transportation recurring
  { id: "t22", date: "2025-01-05", description: "Honda Finance", amount: 450, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e12" },
  { id: "t23", date: "2025-01-05", description: "State Farm Auto", amount: 150, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e14" },
  
  // Insurance & Healthcare
  { id: "t24", date: "2025-01-01", description: "Health Insurance Premium", amount: 400, category: "Insurance & Healthcare", accountId: "demo-checking", flow: "out", expenseId: "e20" },
  { id: "t25", date: "2025-01-10", description: "CVS Pharmacy", amount: 45.00, category: "Insurance & Healthcare", accountId: "demo-checking", flow: "out", expenseId: "e23" },
  
  // Debt Payments
  { id: "t26", date: "2025-01-05", description: "Student Loan Payment", amount: 350, category: "Debt Payments", accountId: "demo-checking", flow: "out", expenseId: "e34" },
  { id: "t27", date: "2025-01-05", description: "Credit Card Payment", amount: 200, category: "Debt Payments", accountId: "demo-checking", flow: "out", expenseId: "e35" },
  
  // Savings
  { id: "t28", date: "2025-01-01", description: "Transfer to Emergency Fund", amount: 500, category: "Savings & Investments", accountId: "demo-checking", flow: "out", expenseId: "e31" },
  { id: "t29", date: "2025-01-01", description: "401k Contribution", amount: 600, category: "Savings & Investments", accountId: "demo-checking", flow: "out", expenseId: "e32" },
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