import { useEffect } from 'react';
import { useUserLocalStorage } from './useUserLocalStorage';
import { useAuth } from './useAuth';
import { v4 as uuidv4 } from 'uuid';
import { DEMO_USER_ID } from '@/lib/constants';

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

  // Create default account if none exist (supports demo mode)
  useEffect(() => {
    if (accounts.length === 0) {
      const effectiveUserId = user?.id ?? DEMO_USER_ID;
      const defaultAccount: Account = {
        id: 'default-checking',
        name: 'Main Checking',
        type: 'checking',
        balance: 0,
        is_active: true,
        user_id: effectiveUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setAccounts([defaultAccount]);
    }
  }, [accounts.length, user, setAccounts]);

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
