import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { DEMO_USER_ID } from '@/lib/constants';
import {
  encryptAndStore,
  decryptAndLoad,
  isEncryptedStorageAvailable,
} from '@/lib/encryptedStorage';
import { supabase } from '@/integrations/supabase/client';
import type { LinkedAccountMeta } from '@/lib/mockBankProvider';
import { removePlaidItem } from '@/lib/plaidProvider';

const STORAGE_KEY = 'linked_bank_accounts';

/**
 * Linked accounts hook.
 * - Authenticated users: reads Plaid-linked accounts from Supabase `accounts`
 *   table (rows with plaid_account_id IS NOT NULL).
 * - Demo / unauthenticated users: continues to use encrypted localStorage with
 *   the mock provider.
 */
export function useLinkedAccounts() {
  const { user } = useAuth();
  const userId = user?.id ?? DEMO_USER_ID;
  const isAuthenticated = !!user;
  const [accounts, setAccounts] = useState<LinkedAccountMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [encryptionAvailable] = useState(() => isEncryptedStorageAvailable());
  // Latest accounts list, so counts never rely on a stale closure.
  const accountsRef = useRef<LinkedAccountMeta[]>([]);
  accountsRef.current = accounts;
  // Number of add/remove operations in flight; focus reloads wait for these.
  const mutationsInFlight = useRef(0);
  const lastFocusReload = useRef(0);

  const reload = useCallback(async () => {
    setIsLoading(true);

    if (isAuthenticated) {
      const { data, error } = await supabase
        .from('accounts')
        .select('id, name, type, balance, plaid_account_id, plaid_item_id, updated_at')
        .not('plaid_account_id', 'is', null);

      if (error) {
        console.error('load linked accounts error:', error);
        setAccounts([]);
      } else {
        // Fetch institution names for each item
        const itemIds = Array.from(new Set((data || []).map((a: any) => a.plaid_item_id).filter(Boolean)));
        let instMap = new Map<string, { name: string; id: string | null; lastSync: string | null; status: string | null }>();
        if (itemIds.length > 0) {
          const { data: items } = await supabase
            .from('plaid_items')
            .select('id, institution_id, institution_name, last_synced_at, status')
            .in('id', itemIds);
          instMap = new Map(
            (items || []).map((i: any) => [
              i.id,
              { name: i.institution_name || 'Bank', id: i.institution_id, lastSync: i.last_synced_at, status: i.status },
            ])
          );
        }

        const mapped: LinkedAccountMeta[] = (data || []).map((a: any) => {
          const inst = instMap.get(a.plaid_item_id);
          return {
            id: a.plaid_account_id,
            institutionId: inst?.id || a.plaid_item_id,
            institutionName: inst?.name || 'Bank',
            maskedAccountName: a.name,
            accountType: a.type,
            accessToken: `plaid-item-${a.plaid_item_id}`,
            status: inst?.status === 'login_required' ? 'expired' : 'active',
            linkedAt: inst?.lastSync || a.updated_at,
            balance: a.balance,
          };
        });
        setAccounts(mapped);
      }
      setIsLoading(false);
      return;
    }

    // Demo path
    if (!encryptionAvailable) {
      setIsLoading(false);
      return;
    }
    const data = await decryptAndLoad<LinkedAccountMeta[]>(userId, STORAGE_KEY);
    setAccounts(data || []);
    setIsLoading(false);
  }, [isAuthenticated, encryptionAvailable, userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Signed-in: refresh when the window regains focus or becomes visible, so a
  // bank link finished in another tab (Plaid OAuth) shows up here. Throttled.
  useEffect(() => {
    if (!isAuthenticated) return;
    const maybeReload = () => {
      if (document.visibilityState !== 'visible') return;
      if (mutationsInFlight.current > 0) return;
      const now = Date.now();
      if (now - lastFocusReload.current < 10_000) return;
      lastFocusReload.current = now;
      reload();
    };
    window.addEventListener('focus', maybeReload);
    document.addEventListener('visibilitychange', maybeReload);
    return () => {
      window.removeEventListener('focus', maybeReload);
      document.removeEventListener('visibilitychange', maybeReload);
    };
  }, [isAuthenticated, reload]);

  const addAccounts = useCallback(
    async (newAccounts: LinkedAccountMeta[]) => {
      // For authenticated users, the edge function already wrote to the DB —
      // we just refresh the list.
      if (isAuthenticated) {
        // Snapshot the latest known ids before refreshing, then count incoming
        // ids that were not already present.
        const existingIds = new Set(accountsRef.current.map((a) => a.id));
        mutationsInFlight.current++;
        try {
          await reload();
        } finally {
          mutationsInFlight.current--;
        }
        const added = newAccounts.filter((a) => !existingIds.has(a.id)).length;
        return { added, skipped: newAccounts.length - added };
      }

      // Demo path — keep encrypted localStorage behavior
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
          encryptAndStore(userId, STORAGE_KEY, merged);
          resolve({ added: deduped.length, skipped: newAccounts.length - deduped.length });
          return merged;
        });
      });
    },
    [isAuthenticated, reload, userId]
  );

  const removeAccount = useCallback(
    async (accountId: string) => {
      if (isAuthenticated) {
        mutationsInFlight.current++;
        try {
        // Remove the Item at Plaid and delete the plaid_items row server-side (cascades to accounts)
        const acc = accounts.find((a) => a.id === accountId);
        if (acc?.accessToken?.startsWith('plaid-item-')) {
          const itemUuid = acc.accessToken.replace('plaid-item-', '');
          try {
            await removePlaidItem(itemUuid);
          } catch (error) {
            console.error('disconnect plaid item error:', error);
          }
        } else {
          await supabase.from('accounts').delete().eq('plaid_account_id', accountId);
        }
        await reload();
        } finally {
          mutationsInFlight.current--;
        }
        return;
      }
      setAccounts((prev) => {
        const next = prev.filter((a) => a.id !== accountId);
        encryptAndStore(userId, STORAGE_KEY, next);
        return next;
      });
    },
    [isAuthenticated, accounts, reload, userId]
  );

  const updateAccountToken = useCallback(
    async (accountId: string, newToken: string) => {
      // Signed-in users: ReconnectDialog runs Plaid Link update mode and the
      // mark-plaid-item-active edge function; here we only refresh the list.
      if (isAuthenticated) {
        await reload();
        return;
      }
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
    [isAuthenticated, userId, reload]
  );

  const markExpired = useCallback(
    async (accountId: string) => {
      setAccounts((prev) => {
        const next = prev.map((a) =>
          a.id === accountId ? { ...a, status: 'expired' as const } : a
        );
        if (!isAuthenticated) encryptAndStore(userId, STORAGE_KEY, next);
        return next;
      });
    },
    [isAuthenticated, userId]
  );

  return {
    linkedAccounts: accounts,
    isLoading,
    encryptionAvailable,
    addAccounts,
    removeAccount,
    updateAccountToken,
    markExpired,
    reload,
  };
}
