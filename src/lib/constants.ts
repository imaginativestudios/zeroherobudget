import { Expense, Debt, Asset } from './csvUtils';

// Default empty values for new users

// Demo data - comprehensive household budget
export const DEMO_EXPENSES: Expense[] = [
  // Housing
  { id: "e1", name: "Rent/Mortgage", planned: 1800, notes: "", category: "Housing" },
  { id: "e2", name: "Property Tax", planned: 250, notes: "", category: "Housing" },
  { id: "e3", name: "Home Insurance", planned: 125, notes: "", category: "Housing" },
  { id: "e4", name: "HOA Fees", planned: 75, notes: "", category: "Housing" },
  { id: "e5", name: "Repairs & Maintenance", planned: 100, notes: "", category: "Housing" },
  
  // Utilities
  { id: "e6", name: "Electric", planned: 150, notes: "", category: "Utilities" },
  { id: "e7", name: "Gas/Heating", planned: 80, notes: "", category: "Utilities" },
  { id: "e8", name: "Water & Sewer", planned: 65, notes: "", category: "Utilities" },
  { id: "e9", name: "Trash/Recycling", planned: 35, notes: "", category: "Utilities" },
  { id: "e10", name: "Internet", planned: 75, notes: "", category: "Utilities" },
  { id: "e11", name: "Cell Phone", planned: 120, notes: "", category: "Utilities" },
  
  // Transportation
  { id: "e12", name: "Car Payment", planned: 450, notes: "", category: "Transportation" },
  { id: "e13", name: "Gas/Fuel", planned: 200, notes: "", category: "Transportation" },
  { id: "e14", name: "Auto Insurance", planned: 150, notes: "", category: "Transportation" },
  { id: "e15", name: "Maintenance & Repairs", planned: 100, notes: "", category: "Transportation" },
  { id: "e16", name: "Parking/Tolls", planned: 50, notes: "", category: "Transportation" },
  
  // Food
  { id: "e17", name: "Groceries", planned: 800, notes: "", category: "Food" },
  { id: "e18", name: "Dining Out", planned: 300, notes: "", category: "Food" },
  { id: "e19", name: "Coffee/Snacks", planned: 75, notes: "", category: "Food" },
  
  // Insurance & Healthcare
  { id: "e20", name: "Health Insurance", planned: 400, notes: "", category: "Insurance & Healthcare" },
  { id: "e21", name: "Life Insurance", planned: 50, notes: "", category: "Insurance & Healthcare" },
  { id: "e22", name: "Medical Expenses", planned: 100, notes: "", category: "Insurance & Healthcare" },
  { id: "e23", name: "Prescriptions", planned: 50, notes: "", category: "Insurance & Healthcare" },
  { id: "e24", name: "Dental/Vision", planned: 25, notes: "", category: "Insurance & Healthcare" },
  
  // Personal Care
  { id: "e25", name: "Clothing", planned: 150, notes: "", category: "Personal Care" },
  { id: "e26", name: "Personal Care/Toiletries", planned: 50, notes: "", category: "Personal Care" },
  { id: "e27", name: "Haircuts/Grooming", planned: 40, notes: "", category: "Personal Care" },
  
  // Entertainment
  { id: "e28", name: "Streaming Services", planned: 60, notes: "", category: "Entertainment" },
  { id: "e29", name: "Hobbies", planned: 100, notes: "", category: "Entertainment" },
  { id: "e30", name: "Events/Activities", planned: 75, notes: "", category: "Entertainment" },
  
  // Savings & Investments
  { id: "e31", name: "Emergency Fund", planned: 500, notes: "", category: "Savings & Investments" },
  { id: "e32", name: "Retirement (401k/IRA)", planned: 600, notes: "", category: "Savings & Investments" },
  { id: "e33", name: "Other Savings", planned: 200, notes: "", category: "Savings & Investments" },
  
  // Debt Payments
  { id: "e34", name: "Student Loans", planned: 350, notes: "", category: "Debt Payments" },
  { id: "e35", name: "Credit Card Payment", planned: 200, notes: "", category: "Debt Payments" },
  
  // Miscellaneous
  { id: "e36", name: "Gifts", planned: 75, notes: "", category: "Miscellaneous" },
  { id: "e37", name: "Pet Care", planned: 100, notes: "", category: "Miscellaneous" },
  { id: "e38", name: "Subscriptions", planned: 50, notes: "", category: "Miscellaneous" },
  { id: "e39", name: "Donations", planned: 50, notes: "", category: "Miscellaneous" },
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