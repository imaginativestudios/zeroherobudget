import { useUserLocalStorage } from './useUserLocalStorage';
import { v4 as uuidv4 } from 'uuid';

export interface Debt {
  id: string;
  name: string;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  type: string;
  user_id: string;
  household_id?: string;
  created_at: string;
  updated_at: string;
}

export function useLocalDebts() {
  const [debts, setDebts, isLoading] = useUserLocalStorage<Debt[]>('debts', []);

  const addDebt = (debt: Omit<Debt, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newDebt: Debt = {
      ...debt,
      id: uuidv4(),
      user_id: 'demo-user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setDebts([...debts, newDebt]);
  };

  const updateDebt = (id: string, updates: Partial<Debt>) => {
    setDebts(
      debts.map((debt) =>
        debt.id === id
          ? { ...debt, ...updates, updated_at: new Date().toISOString() }
          : debt
      )
    );
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter((debt) => debt.id !== id));
  };

  return {
    debts,
    isLoading,
    addDebt,
    updateDebt,
    removeDebt,
  };
}
