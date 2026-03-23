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

/** Create a Plaid Link token via the edge function */
export async function createLinkToken(): Promise<string> {
  const data = await callEdgeFunction<{ link_token: string }>('create-link-token');
  return data.link_token;
}

/** Exchange the public token from Plaid Link for sanitized account metadata */
export async function exchangePublicToken(publicToken: string): Promise<LinkedAccountMeta[]> {
  const data = await callEdgeFunction<{ accounts: LinkedAccountMeta[] }>('exchange-plaid-token', {
    public_token: publicToken,
  });
  return data.accounts;
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
