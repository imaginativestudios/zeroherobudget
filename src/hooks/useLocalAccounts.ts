import { useCallback, useEffect, useState } from 'react';
import { useUserLocalStorage } from './useUserLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { DEMO_USER_ID } from '@/lib/constants';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  is_active: boolean;
  user_id: string;
  household_id?: string;
  plaid_account_id?: string | null;
  plaid_item_id?: string | null;
  created_at: string;
  updated_at: string;
}

const mapRowToAccount = (row: any): Account => ({
  id: row.id,
  name: row.name,
  type: row.type,
  balance: Number(row.balance),
  is_active: row.is_active,
  user_id: row.user_id,
  household_id: row.household_id ?? undefined,
  plaid_account_id: row.plaid_account_id ?? null,
  plaid_item_id: row.plaid_item_id ?? null,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export function useLocalAccounts() {
  const { user } = useAuth();
  const isAuthed = !!user;

  // Demo path
  const [localAccounts, setLocalAccounts] = useUserLocalStorage<Account[]>('accounts', []);

  // Authed path
  const [remoteAccounts, setRemoteAccounts] = useState<Account[]>([]);
  const [isRemoteLoading, setIsRemoteLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!isAuthed) return;
    setIsRemoteLoading(true);
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('load accounts error:', error);
      setRemoteAccounts([]);
    } else {
      setRemoteAccounts((data || []).map(mapRowToAccount));
    }
    setIsRemoteLoading(false);
  }, [isAuthed]);

  useEffect(() => {
    if (isAuthed) reload();
  }, [isAuthed, reload]);

  // Default account fallback (demo only — Supabase path may have 0 accounts before linking)
  useEffect(() => {
    if (!isAuthed && localAccounts.length === 0) {
      const defaultAccount: Account = {
        id: 'default-checking',
        name: 'Main Checking',
        type: 'checking',
        balance: 0,
        is_active: true,
        user_id: DEMO_USER_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setLocalAccounts([defaultAccount]);
    }
  }, [isAuthed, localAccounts.length, setLocalAccounts]);

  const accounts = isAuthed ? remoteAccounts : localAccounts;
  const isLoading = isAuthed ? isRemoteLoading : false;

  const addAccount = async (
    account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (isAuthed) {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          name: account.name,
          type: account.type,
          balance: account.balance,
          is_active: account.is_active,
          household_id: account.household_id ?? null,
        })
        .select('*')
        .single();
      if (error) {
        console.error('addAccount error:', error);
        return;
      }
      setRemoteAccounts((prev) => [...prev, mapRowToAccount(data)]);
      return;
    }

    const newAccount: Account = {
      ...account,
      id: uuidv4(),
      user_id: DEMO_USER_ID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLocalAccounts([...localAccounts, newAccount]);
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    if (isAuthed) {
      const patch: any = { ...updates };
      delete patch.id;
      delete patch.user_id;
      delete patch.created_at;
      delete patch.updated_at;
      const { data, error } = await supabase
        .from('accounts')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single();
      if (error) {
        console.error('updateAccount error:', error);
        return;
      }
      setRemoteAccounts((prev) =>
        prev.map((a) => (a.id === id ? mapRowToAccount(data) : a))
      );
      return;
    }

    setLocalAccounts(
      localAccounts.map((account) =>
        account.id === id
          ? { ...account, ...updates, updated_at: new Date().toISOString() }
          : account
      )
    );
  };

  const removeAccount = async (id: string) => {
    if (isAuthed) {
      const { error } = await supabase.from('accounts').delete().eq('id', id);
      if (error) {
        console.error('removeAccount error:', error);
        return;
      }
      setRemoteAccounts((prev) => prev.filter((a) => a.id !== id));
      return;
    }
    setLocalAccounts(localAccounts.filter((account) => account.id !== id));
  };

  const getActiveAccounts = () => accounts.filter((account) => account.is_active);
  const getAccountById = (id: string) => accounts.find((account) => account.id === id);

  return {
    accounts,
    isLoading,
    reload,
    addAccount,
    updateAccount,
    removeAccount,
    getActiveAccounts,
    getAccountById,
  };
}
