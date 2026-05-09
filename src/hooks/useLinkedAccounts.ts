import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { DEMO_USER_ID } from '@/lib/constants';
import {
  encryptAndStore,
  decryptAndLoad,
  isEncryptedStorageAvailable,
} from '@/lib/encryptedStorage';
import { supabase } from '@/integrations/supabase/client';
import type { LinkedAccountMeta } from '@/lib/mockBankProvider';

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
        let instMap = new Map<string, { name: string; id: string | null; lastSync: string | null }>();
        if (itemIds.length > 0) {
          const { data: items } = await supabase
            .from('plaid_items')
            .select('id, institution_id, institution_name, last_synced_at')
            .in('id', itemIds);
          instMap = new Map(
            (items || []).map((i: any) => [
              i.id,
              { name: i.institution_name || 'Bank', id: i.institution_id, lastSync: i.last_synced_at },
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
            status: 'active',
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

  const addAccounts = useCallback(
    async (newAccounts: LinkedAccountMeta[]) => {
      // For authenticated users, the edge function already wrote to the DB —
      // we just refresh the list.
      if (isAuthenticated) {
        await reload();
        // Compute a simple added/skipped count by intersecting ids with current state
        const existingIds = new Set(accounts.map((a) => a.id));
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
    [isAuthenticated, reload, accounts, userId]
  );

  const removeAccount = useCallback(
    async (accountId: string) => {
      if (isAuthenticated) {
        // Find the plaid_item_id for this account, then delete the item (cascades to accounts)
        const acc = accounts.find((a) => a.id === accountId);
        if (acc?.accessToken?.startsWith('plaid-item-')) {
          const itemUuid = acc.accessToken.replace('plaid-item-', '');
          const { error } = await supabase.from('plaid_items').delete().eq('id', itemUuid);
          if (error) console.error('disconnect plaid item error:', error);
        } else {
          await supabase.from('accounts').delete().eq('plaid_account_id', accountId);
        }
        await reload();
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
      if (isAuthenticated) return; // Reconnection is handled by Plaid Link update mode + edge fn
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
    [isAuthenticated, userId]
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
