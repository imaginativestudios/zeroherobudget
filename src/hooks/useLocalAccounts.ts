import { useUserLocalStorage } from './useUserLocalStorage';
import { useAuth } from './useAuth';
import { v4 as uuidv4 } from 'uuid';

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  is_active: boolean;
  user_id: string;
  household_id?: string;
  created_at: string;
  updated_at: string;
}

export function useLocalAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useUserLocalStorage<Account[]>('accounts', []);

  const addAccount = (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    const newAccount: Account = {
      ...account,
      id: uuidv4(),
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAccounts([...accounts, newAccount]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(
      accounts.map((account) =>
        account.id === id
          ? { ...account, ...updates, updated_at: new Date().toISOString() }
          : account
      )
    );
  };

  const removeAccount = (id: string) => {
    setAccounts(accounts.filter((account) => account.id !== id));
  };

  const getActiveAccounts = () => {
    return accounts.filter((account) => account.is_active);
  };

  const getAccountById = (id: string) => {
    return accounts.find((account) => account.id === id);
  };

  return {
    accounts,
    isLoading: false,
    addAccount,
    updateAccount,
    removeAccount,
    getActiveAccounts,
    getAccountById,
  };
}
