## What's actually happening

Your bank **is** linked correctly — but Plaid-synced data lives in a different place from where the app reads transactions, so it looks like nothing is syncing.

**The disconnect:**

```text
Plaid Link ──► exchange-plaid-token ──► Supabase: plaid_items + accounts
                                                          │
                                        sync-plaid-transactions
                                                          │
                                                          ▼
                                          Supabase: public.transactions  ← Plaid data lands here

  Dashboard / Transactions / Budget pages
                │
                ▼
       useTransactions()  ──►  localStorage key "bdt_transactions"  ← App reads from here
       useAccounts()      ──►  localStorage key "bdt_accounts"
```

Plaid writes to Supabase. The app reads from localStorage. The two never meet.

Only the **Linked Accounts** card (`useLinkedAccounts`) reads from Supabase, which is why the link looks successful — but every other surface (Dashboard totals, Transactions list, Budget actuals, etc.) is blind to it.

I also confirmed against the live DB: there are **0 rows in `plaid_items`, `accounts`, and `transactions`** right now. So either no link has actually completed end-to-end against the current Supabase project yet, or you tested in demo/unauthenticated mode (which uses the mock provider + localStorage and never calls Plaid).

## Plan

### 1. Verify which mode you're in (quick, before any code changes)
- Confirm you're signed in (not the demo `DEMO_USER_ID` path) when you linked the bank.
- Re-run the link with the browser network panel open and confirm `exchange-plaid-token` returns 200 with an `accounts` array.
- I'll then check `plaid_items` / `accounts` in Supabase to confirm rows landed.

If rows are there, the only remaining problem is step 2 below. If rows are not there, we fix the link flow first.

### 2. Make `useTransactions` and `useAccounts` Supabase-aware (the real fix)

Mirror the pattern already used by `useLinkedAccounts`:

- **Authenticated users** → read/write `public.transactions` and `public.accounts` via the Supabase client (respecting RLS / household sharing). Keep the same hook API (`addTransaction`, `getTransactionsByMonth`, `getMonthlyActuals`, etc.) so no page changes are needed.
- **Demo / unauthenticated users** → keep the existing `useUserLocalStorage('bdt_transactions' / 'bdt_accounts')` behavior unchanged.

Specifics:
- Switch reads to a Supabase query, cached in React state, refetched on auth change and after mutations.
- Map DB columns ↔ existing `Transaction` / `Account` types (notably `flow: 'income' | 'expense'` in DB vs `'in' | 'out'` in the app — pick one and normalize at the boundary).
- Mutations (`addTransaction`, `addTransactionsBulk`, `updateTransaction`, `removeTransaction`) write to Supabase for authed users; balance updates go through the `accounts` table.
- Preserve the existing `expenseId` link used by `getMonthlyActuals` (add column if missing — I'll check before migrating).

### 3. Auto-sync on link + on app load
- After `exchange-plaid-token` succeeds, the flow already calls `syncPlaidTransactions()` — keep that.
- Add a lightweight "sync on Dashboard mount if last_synced_at > 1h ago" so transactions stay fresh without a manual refresh button.
- The existing pg_cron trigger (if you want it) can run `sync-plaid-transactions` daily for all active items — `CRON_SECRET` is already configured.

### 4. One-time backfill for existing demo data (optional)
If you've been entering transactions in demo mode in this browser, I can offer a one-click "Import my local transactions into my account" action so nothing is lost. Skip if not needed.

## Technical notes

- No schema changes are expected — `transactions`, `accounts`, `plaid_items` already exist with the right shape. I'll confirm `transactions.expense_id` exists; if not, that's the only migration needed.
- RLS already scopes `transactions` / `accounts` to the user + household, so the household view toggle keeps working automatically.
- `useTransactions` is consumed in many places; the contract stays identical so call sites don't change.

## Open questions before I build

1. When you said "bank account is linked", were you **signed in** (real account), or testing on the public demo? This determines whether step 1 finds anything.
2. Do you want the offer-to-import-local-data step (#4), or skip it since this is pre-launch?
