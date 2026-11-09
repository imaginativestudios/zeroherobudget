/**
 * Plaid Link provider — calls Supabase edge functions to create link tokens
 * and exchange public tokens. Never handles raw Plaid secrets client-side.
 */

import { supabase } from '@/integrations/supabase/client';
import type { LinkedAccountMeta } from '@/lib/mockBankProvider';

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;

async function callEdgeFunction<T>(name: string, body?: Record<string, unknown>): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  const url = `https://${PROJECT_ID}.supabase.co/functions/v1/${name}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken ?? ''}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Edge function ${name} failed (${res.status})`);
  }
  return res.json();
}

/** Shown when bank linking needs a subscription (server returns subscription_required). */
export const BANK_LINKING_SUBSCRIPTION_MESSAGE =
  'Linking your bank comes with a Zero Hero subscription. Start your 7-day free trial, then $10/month or $99/year.';

/** Create a Plaid Link token via the edge function */
export async function createLinkToken(itemId?: string): Promise<string> {
  const data = await callEdgeFunction<{ link_token: string }>(
    'create-link-token',
    itemId ? { item_id: itemId } : undefined
  );
  return data.link_token;
}

/** Exchange the public token from Plaid Link for sanitized account metadata */
export async function exchangePublicToken(publicToken: string): Promise<LinkedAccountMeta[]> {
  const data = await callEdgeFunction<{ accounts: LinkedAccountMeta[] }>('exchange-plaid-token', {
    public_token: publicToken,
  });
  return data.accounts;
}

/** Session key holding the link token so /plaid-oauth can resume Link after a bank redirect */
export const PLAID_LINK_TOKEN_KEY = 'plaid_link_token';
/** Session key set only during update mode (reconnect), so /plaid-oauth marks the item active instead of exchanging */
export const PLAID_UPDATE_ITEM_KEY = 'plaid_update_item_id';

/** Remove a bank connection at Plaid and delete it from the account */
export async function removePlaidItem(itemId: string): Promise<void> {
  await callEdgeFunction('remove-plaid-item', { item_id: itemId });
}

/** Mark a reconnected (update-mode) bank connection active again */
export async function markPlaidItemActive(itemId: string): Promise<void> {
  await callEdgeFunction('mark-plaid-item-active', { item_id: itemId });
}

/** Trigger a Plaid transaction sync for the current user */
export async function syncPlaidTransactions(): Promise<{
  items: number;
  added: number;
  modified: number;
  removed: number;
}> {
  return callEdgeFunction('sync-plaid-transactions');
}

/** Check if Plaid is configured (link token creation succeeds) */
export async function isPlaidConfigured(): Promise<boolean> {
  try {
    await createLinkToken();
    return true;
  } catch {
    return false;
  }
}
