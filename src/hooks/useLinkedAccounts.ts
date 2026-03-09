import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [encryptionAvailable] = useState(() => isEncryptedStorageAvailable());

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

  const persistRef = useRef<(next: LinkedAccountMeta[]) => Promise<void>>();
  persistRef.current = async (next: LinkedAccountMeta[]) => {
    setAccounts(next);
    await encryptAndStore(userId, STORAGE_KEY, next);
  };

  const addAccounts = useCallback(
    async (newAccounts: LinkedAccountMeta[]) => {
      return new Promise<{ added: number; skipped: number }>((resolve) => {
        setAccounts((prev) => {
          const deduped = newAccounts.filter(
            (newAcc) =>
              !prev.some(
                (existing) =>
                  existing.institutionId === newAcc.institutionId &&
                  existing.maskedAccountName === newAcc.maskedAccountName
              )
          );
          const merged = [...prev, ...deduped];
          // Persist outside state updater
          encryptAndStore(userId, STORAGE_KEY, merged);
          resolve({ added: deduped.length, skipped: newAccounts.length - deduped.length });
          return merged;
        });
      });
    },
    [userId]
  );

  const removeAccount = useCallback(
    async (accountId: string) => {
      setAccounts((prev) => {
        const next = prev.filter((a) => a.id !== accountId);
        encryptAndStore(userId, STORAGE_KEY, next);
        return next;
      });
    },
    [userId]
  );

  const updateAccountToken = useCallback(
    async (accountId: string, newToken: string) => {
      setAccounts((prev) => {
        const next = prev.map((a) =>
          a.id === accountId
            ? { ...a, accessToken: newToken, status: 'active' as const, linkedAt: new Date().toISOString() }
            : a
        );
        encryptAndStore(userId, STORAGE_KEY, next);
        return next;
      });
    },
    [userId]
  );

  const markExpired = useCallback(
    async (accountId: string) => {
      setAccounts((prev) => {
        const next = prev.map((a) =>
          a.id === accountId ? { ...a, status: 'expired' as const } : a
        );
        encryptAndStore(userId, STORAGE_KEY, next);
        return next;
      });
    },
    [userId]
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
