/**
 * Plaid Link provider — calls Supabase edge functions to create link tokens
 * and exchange public tokens. Never handles raw Plaid secrets client-side.
 */

import { supabase } from '@/integrations/supabase/client';
import type { LinkedAccountMeta } from '@/lib/mockBankProvider';

async function callEdgeFunction<T>(name: string, body?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body: body ?? {} });

  if (error) {
    let message: string | undefined;
    const context = (error as { context?: unknown }).context;
    if (context instanceof Response) {
      const errBody = await context.clone().json().catch(() => ({}));
      message = errBody?.error;
    }
    throw new Error(message || `Edge function ${name} failed`);
  }
  return data as T;
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
