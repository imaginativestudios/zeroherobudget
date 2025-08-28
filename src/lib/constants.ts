import { Expense, Debt, Asset } from './csvUtils';

// Demo account constants
export const DEMO_EMAIL = 'demo@example.com';

// Demo data - same as original defaults
export const DEMO_EXPENSES: Expense[] = [
  { id: "e1", name: "Mortgages (IL + CT)", planned: 3322, notes: "IL + CT", category: "Housing" },
  { id: "e2", name: "Loans (Best Egg + 401k + Kia)", planned: 1775, notes: "", category: "Debt" },
  { id: "e3", name: "HELOC", planned: 64, notes: "", category: "Debt" },
  { id: "e4", name: "Essentials", planned: 3000, notes: "Groceries, utilities, insurance", category: "Essentials" },
  { id: "e5", name: "Child Support Out", planned: 500, notes: "", category: "Family" },
  { id: "e6", name: "Discretionary", planned: 8500, notes: "Restaurants, shopping, transfers", category: "Discretionary" },
];

export const DEMO_DEBTS: Debt[] = [
  { id: "d1", name: "Best Egg Loan", balance: 14000, apr: 12.0, min: 808, type: "loan", _orig: 14000 },
  { id: "d2", name: "401k Loan", balance: 16000, apr: 0.0, min: 469, type: "loan", _orig: 16000 },
  { id: "d3", name: "Kia Auto Loan", balance: 18000, apr: 5.5, min: 499, type: "loan", _orig: 18000 },
  { id: "c1", name: "Amex", balance: 3500, apr: 23.99, min: 90, type: "card", _orig: 3500 },
  { id: "c2", name: "Chase Freedom", balance: 2800, apr: 19.49, min: 75, type: "card", _orig: 2800 },
];

export const DEMO_ASSETS: Asset[] = [
  { id: "a1", name: "Cash & Checking", value: 15000 },
  { id: "a2", name: "Investments", value: 25000 },
  { id: "a3", name: "Home Equity", value: 120000 },
  { id: "a4", name: "Other", value: 0 },
];

// Default empty values for new users
export const DEFAULT_EXPENSES: Expense[] = [];
export const SAMPLE_DEBTS: Debt[] = [];
export const DEFAULT_ASSETS: Asset[] = [];

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(isFinite(value) ? value : 0);
};