import { Transaction, Account, Expense, Debt, Asset } from './csvUtils';

// Demo financial data for testing
export const DEMO_INCOME = 75000;

export const DEMO_EXPENSES: Expense[] = [
  { id: "e1", name: "Rent/Mortgage", planned: 2500, notes: "Monthly housing payment", category: "Housing" },
  { id: "e2", name: "Car Payment", planned: 450, notes: "Honda Civic lease", category: "Transportation" },
  { id: "e3", name: "Insurance", planned: 300, notes: "Auto + renters insurance", category: "Insurance" },
  { id: "e4", name: "Groceries", planned: 600, notes: "Weekly grocery shopping", category: "Food" },
  { id: "e5", name: "Utilities", planned: 200, notes: "Electric, gas, water", category: "Utilities" },
  { id: "e6", name: "Phone & Internet", planned: 120, notes: "Mobile + home internet", category: "Utilities" },
  { id: "e7", name: "Dining Out", planned: 400, notes: "Restaurants and takeout", category: "Food" },
  { id: "e8", name: "Entertainment", planned: 200, notes: "Movies, streaming, hobbies", category: "Entertainment" },
  { id: "e9", name: "Shopping", planned: 300, notes: "Clothing, household items", category: "Shopping" },
  { id: "e10", name: "Gas", planned: 180, notes: "Weekly fuel costs", category: "Transportation" },
];

export const DEMO_DEBTS: Debt[] = [
  { id: "d1", name: "Student Loan", balance: 25000, apr: 4.5, min: 280, type: "loan", _orig: 30000 },
  { id: "d2", name: "Credit Card - Chase", balance: 3200, apr: 19.99, min: 85, type: "card", _orig: 3200 },
  { id: "d3", name: "Credit Card - Capital One", balance: 1800, apr: 22.49, min: 45, type: "card", _orig: 1800 },
  { id: "d4", name: "Personal Loan", balance: 8500, apr: 12.5, min: 195, type: "loan", _orig: 10000 },
];

export const DEMO_ASSETS: Asset[] = [
  { id: "a1", name: "Checking Account", value: 3500 },
  { id: "a2", name: "Savings Account", value: 12000 },
  { id: "a3", name: "401k", value: 45000 },
  { id: "a4", name: "Investment Account", value: 8500 },
  { id: "a5", name: "Car Value", value: 18000 },
];

export const DEMO_ACCOUNTS: Account[] = [
  { id: "demo-checking", name: "Main Checking", type: "checking", balance: 3500, isActive: true },
  { id: "demo-savings", name: "Emergency Savings", type: "savings", balance: 12000, isActive: true },
  { id: "demo-credit", name: "Chase Freedom", type: "credit", balance: -3200, isActive: true },
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  // Recent income
  { id: "t1", date: "2025-01-15", description: "Paycheck - Acme Corp", amount: 2800, category: "Salary", accountId: "demo-checking", flow: "in" },
  { id: "t2", date: "2025-01-01", description: "Paycheck - Acme Corp", amount: 2800, category: "Salary", accountId: "demo-checking", flow: "in" },
  
  // Recent expenses
  { id: "t3", date: "2025-01-20", description: "Whole Foods", amount: 85.43, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e4" },
  { id: "t4", date: "2025-01-19", description: "Shell Gas Station", amount: 45.20, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e10" },
  { id: "t5", date: "2025-01-18", description: "Netflix", amount: 15.99, category: "Entertainment", accountId: "demo-checking", flow: "out", expenseId: "e8" },
  { id: "t6", date: "2025-01-17", description: "Domino's Pizza", amount: 28.75, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e7" },
  { id: "t7", date: "2025-01-16", description: "Target", amount: 127.89, category: "Shopping", accountId: "demo-checking", flow: "out", expenseId: "e9" },
  { id: "t8", date: "2025-01-15", description: "Electric Bill - PG&E", amount: 89.45, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e5" },
  { id: "t9", date: "2025-01-14", description: "Verizon", amount: 65.00, category: "Utilities", accountId: "demo-checking", flow: "out", expenseId: "e6" },
  { id: "t10", date: "2025-01-12", description: "Safeway", amount: 92.16, category: "Food", accountId: "demo-checking", flow: "out", expenseId: "e4" },
  
  // Credit card transactions
  { id: "t11", date: "2025-01-19", description: "Amazon Purchase", amount: 67.50, category: "Shopping", accountId: "demo-credit", flow: "out", expenseId: "e9" },
  { id: "t12", date: "2025-01-17", description: "Credit Card Payment", amount: 200.00, category: "Debt Payment", accountId: "demo-checking", flow: "out" },
  
  // Monthly recurring
  { id: "t13", date: "2025-01-01", description: "Rent Payment", amount: 2500.00, category: "Housing", accountId: "demo-checking", flow: "out", expenseId: "e1" },
  { id: "t14", date: "2025-01-05", description: "Honda Financial", amount: 450.00, category: "Transportation", accountId: "demo-checking", flow: "out", expenseId: "e2" },
  { id: "t15", date: "2025-01-10", description: "Insurance Premium", amount: 300.00, category: "Insurance", accountId: "demo-checking", flow: "out", expenseId: "e3" },
];

// Function to set up demo data in localStorage
export function setupDemoData(): void {
  localStorage.setItem("bdt_income", JSON.stringify(DEMO_INCOME));
  localStorage.setItem("bdt_expenses", JSON.stringify(DEMO_EXPENSES));
  localStorage.setItem("bdt_debts", JSON.stringify(DEMO_DEBTS));
  localStorage.setItem("bdt_assets", JSON.stringify(DEMO_ASSETS));
  localStorage.setItem("bdt_accounts", JSON.stringify(DEMO_ACCOUNTS));
  localStorage.setItem("bdt_transactions", JSON.stringify(DEMO_TRANSACTIONS));
  localStorage.setItem("bdt_strategy", JSON.stringify("Avalanche"));
}

// Function to clear demo data
export function clearDemoData(): void {
  const keys = [
    "bdt_income",
    "bdt_expenses", 
    "bdt_debts",
    "bdt_assets",
    "bdt_accounts",
    "bdt_transactions",
    "bdt_strategy"
  ];
  
  keys.forEach(key => localStorage.removeItem(key));
}

// Check if demo data is already set up
export function isDemoDataSetup(): boolean {
  const income = localStorage.getItem("bdt_income");
  return income ? JSON.parse(income) === DEMO_INCOME : false;
}