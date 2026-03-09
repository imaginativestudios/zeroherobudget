import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { DEMO_USER_ID } from '@/lib/constants';
import {
  encryptAndStore,
  decryptAndLoad,
  isEncryptedStorageAvailable,
} from '@/lib/encryptedStorage';
import type { LinkedAccountMeta } from '@/lib/mockBankProvider';

const STORAGE_KEY = 'linked_bank_accounts';

export function useLinkedAccounts() {
  const { user } = useAuth();
  const userId = user?.id ?? DEMO_USER_ID;
  const [accounts, setAccounts] = useState<LinkedAccountMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [encryptionAvailable] = useState(isEncryptedStorageAvailable);

  // Load accounts from encrypted storage
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    (async () => {
      if (!encryptionAvailable) {
        setIsLoading(false);
        return;
      }
      const data = await decryptAndLoad<LinkedAccountMeta[]>(userId, STORAGE_KEY);
      if (!cancelled) {
        setAccounts(data ?? []);
        setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId, encryptionAvailable]);

  const persist = useCallback(
    async (next: LinkedAccountMeta[]) => {
      setAccounts(next);
      await encryptAndStore(userId, STORAGE_KEY, next);
    },
    [userId]
  );

  const addAccounts = useCallback(
    async (newAccounts: LinkedAccountMeta[]) => {
      const merged = [...accounts, ...newAccounts];
      await persist(merged);
    },
    [accounts, persist]
  );

  const removeAccount = useCallback(
    async (accountId: string) => {
      await persist(accounts.filter((a) => a.id !== accountId));
    },
    [accounts, persist]
  );

  const updateAccountToken = useCallback(
    async (accountId: string, newToken: string) => {
      await persist(
        accounts.map((a) =>
          a.id === accountId
            ? { ...a, accessToken: newToken, status: 'active' as const, linkedAt: new Date().toISOString() }
            : a
        )
      );
    },
    [accounts, persist]
  );

  const markExpired = useCallback(
    async (accountId: string) => {
      await persist(
        accounts.map((a) =>
          a.id === accountId ? { ...a, status: 'expired' as const } : a
        )
      );
    },
    [accounts, persist]
  );

  return {
    linkedAccounts: accounts,
    isLoading,
    encryptionAvailable,
    addAccounts,
    removeAccount,
    updateAccountToken,
    markExpired,
  };
}
