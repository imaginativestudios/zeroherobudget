export interface Transaction {
  id: string;
  date: string; // ISO date string
  description: string;
  amount: number;
  category: string;
  expenseId?: string; // Link to budget expense for comparison
  notes?: string;
}

export interface MonthlyActuals {
  [expenseId: string]: number; // Total actual spending for each expense category
}