## Current state (audit)

What works today:
- `create-link-token` and `exchange-plaid-token` edge functions are deployed and authenticated
- Plaid Link UI launches, user picks a bank, returns sanitized account list (name, mask, type, current balance)
- `PLAID_CLIENT_ID` / `PLAID_SECRET` are configured

What's broken / missing:
1. **Accounts don't reach the database.** `addAccounts` writes to encrypted **localStorage only** (`useLinkedAccounts.ts`). The `accounts` Supabase table is never touched. Open the app on another device → accounts gone.
2. **Plaid `access_token` is thrown away.** `exchange-plaid-token` stores `"plaid-item-${itemId}"` (an opaque label) instead of the real token. Without persisting the real token server-side, we can never sync transactions or refresh balances later.
3. **No transaction sync.** There is no edge function calling `/transactions/sync`. Transactions in the app are only those the user enters manually or imports via CSV.
4. **No balance refresh.** Balance is captured once at link time. Never updated.
5. **Sandbox-only.** `PLAID_BASE = https://sandbox.plaid.com` is hardcoded. Real users hitting real banks will fail until we switch to `production.plaid.com` (and get Plaid production approval).

So: a user can complete the Link flow, see "Account Linked!", but no real transactions appear anywhere in Budget / Transactions / Dashboard.

## Plan to make it real

### 1. Persist Plaid items server-side (DB migration)
New table `plaid_items`:
- `id`, `user_id`, `household_id`, `item_id` (Plaid), `access_token` (encrypted), `institution_id`, `institution_name`, `cursor` (for transactions/sync), `created_at`, `last_synced_at`, `status`
- RLS: user can SELECT/DELETE own; INSERT/UPDATE only via service role (edge functions)
- Access token never returned to client

Add `plaid_account_id` column to existing `accounts` table to link a row to a Plaid account.

### 2. Update `exchange-plaid-token`
- Insert one row in `plaid_items` (with the real access_token) using service role
- Insert/upsert one row per account into `accounts` (name, type, balance, plaid_account_id, user_id, household_id)
- Return the saved account list (no tokens)

### 3. Replace localStorage with DB in `useLinkedAccounts`
- Read from `accounts` table filtered by `plaid_account_id IS NOT NULL`
- Remove encrypted-localStorage path for linked accounts (keep mock fallback gated by `usePlaid === false`)
- Disconnect = delete `plaid_items` row (cascade) + DELETE `/item/remove` via new edge function

### 4. New edge function `sync-plaid-transactions`
- Loops over caller's `plaid_items`, calls `/transactions/sync` with stored cursor
- Upserts into `transactions` (mapped to existing schema: date, amount, description, category, account_id, flow)
- Updates `accounts.balance` from `/accounts/balance/get`
- Saves new `cursor` and `last_synced_at`
- Triggered: (a) on demand via "Sync now" button on `/data`, (b) scheduled daily via existing `pg_cron` pattern

### 5. AI categorization on sync
- Reuse existing `categorize-transaction` function for each new transaction (or batch) so they land in the correct budget category

### 6. UI surfacing
- `/data` page: "Last synced X ago" + "Sync now" button
- Transactions page: badge on Plaid-sourced rows, can't be deleted (only hidden) to keep cursor consistent
- Dashboard balance widgets read from refreshed `accounts.balance`

### 7. Production readiness (separate, ask before doing)
- Switch `PLAID_BASE` to env-driven (`PLAID_ENV=sandbox|production`)
- Apply for Plaid production access (Plaid review process, ~1–2 weeks)
- Until approved, restrict bank linking to `?beta=true` or admins

## Technical notes

```text
Frontend                Edge Function              Plaid                  Database
--------                -------------              -----                  --------
PlaidLink ───public_token──▶ exchange-plaid-token
                              │── /item/exchange ──▶
                              │◀── access_token ────
                              │── /accounts/get ────▶
                              │◀── accounts ────────
                              ├──────────────── INSERT plaid_items
                              └──────────────── UPSERT accounts

[Sync now]   ──────▶ sync-plaid-transactions
                      │── /transactions/sync ─▶
                      │◀── added/modified ────
                      └──────────────── UPSERT transactions, UPDATE balance
```

Encryption of `access_token` at rest: use Supabase Vault or a `pgcrypto` symmetric key stored as a secret (not in DB). I'll confirm approach before writing the migration.

## Out of scope (intentionally)

- Webhook-driven sync (`TRANSACTIONS:DEFAULT_UPDATE`) — can add later, daily cron is fine for v1
- Investments / liabilities products — depository + credit only first
- Multi-currency — USD only for now (matches Plaid US-only setup)
