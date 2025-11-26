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
}

export function useLocalExpenses() {
  const [expenses, setExpenses] = useUserLocalStorage<Expense[]>('expenses', []);

  const addExpense = (expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      user_id: 'demo-user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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

  return {
    expenses,
    isLoading: false,
    addExpense,
    updateExpense,
    removeExpense,
  };
}
