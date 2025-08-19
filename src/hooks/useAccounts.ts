import { useLocalStorage } from './useLocalStorage';
import { Account } from '@/types/transactions';

const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'default-checking',
    name: 'Main Checking',
    type: 'checking',
    balance: 0,
    isActive: true,
  },
];

export function useAccounts() {
  const [accounts, setAccounts] = useLocalStorage<Account[]>('bdt_accounts', DEFAULT_ACCOUNTS);

  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: crypto.randomUUID(),
    };
    setAccounts([...accounts, newAccount]);
    return newAccount;
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(accounts.map(a => 
      a.id === id ? { ...a, ...updates } : a
    ));
  };

  const removeAccount = (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id));
  };

  const getActiveAccounts = (): Account[] => {
    return accounts.filter(a => a.isActive);
  };

  const getAccountById = (id: string): Account | undefined => {
    return accounts.find(a => a.id === id);
  };

  return {
    accounts,
    addAccount,
    updateAccount,
    removeAccount,
    getActiveAccounts,
    getAccountById,
  };
}