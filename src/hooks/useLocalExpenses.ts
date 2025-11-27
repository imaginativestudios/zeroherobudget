import { useUserLocalStorage } from './useUserLocalStorage';
import { v4 as uuidv4 } from 'uuid';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  is_income: boolean;
  user_id: string;
  household_id?: string;
  created_at: string;
  updated_at: string;
  sort_order: number;
}

export function useLocalExpenses() {
  const [expenses, setExpenses] = useUserLocalStorage<Expense[]>('expenses', []);

  // Sort expenses by sort_order
  const sortedExpenses = [...expenses].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const addExpense = (expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sort_order'>) => {
    const maxSortOrder = expenses.reduce((max, e) => Math.max(max, e.sort_order ?? 0), -1);
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      user_id: 'demo-user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sort_order: maxSortOrder + 1,
    };
    setExpenses([...expenses, newExpense]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id
          ? { ...expense, ...updates, updated_at: new Date().toISOString() }
          : expense
      )
    );
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const setExpensesOrder = (orderedIds: string[]) => {
    const updatedExpenses = expenses.map(expense => ({
      ...expense,
      sort_order: orderedIds.indexOf(expense.id),
      updated_at: new Date().toISOString()
    }));
    setExpenses(updatedExpenses);
  };

  return {
    expenses: sortedExpenses,
    isLoading: false,
    addExpense,
    updateExpense,
    removeExpense,
    setExpensesOrder,
  };
}
