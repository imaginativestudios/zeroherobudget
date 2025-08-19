export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash' | 'investment';
  balance: number;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  date: string; // ISO date string
  description: string;
  amount: number;
  category: string;
  accountId: string; // Account this transaction belongs to
  flow: 'in' | 'out'; // Money flowing in or out
  expenseId?: string; // Link to budget expense for comparison
  notes?: string;
}

export interface MonthlyActuals {
  [expenseId: string]: number; // Total actual spending for each expense category
}