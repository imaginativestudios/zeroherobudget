

## Integrate Plaid Link Sandbox Mode

### Overview
Replace the mock bank provider with Plaid's sandbox environment. Users will see Plaid's real Link UI to select institutions and authenticate with test credentials (`user_good` / `pass_good`), and the app will receive real-looking account data (names, masks, types, balances).

### Architecture

```text
Frontend                    Edge Function              Plaid Sandbox API
───────                    ─────────────              ─────────────────
1. Click "Link Account" →  create-link-token  →       /link/token/create
2. Open Plaid Link UI      (Plaid handles this natively)
3. Receive public_token →  exchange-plaid-token →     /item/public_token/exchange
                                                      /accounts/get
4. Display linked accounts ← account metadata ←
```

### Prerequisites — Plaid API Keys

You'll need a free Plaid developer account at [dashboard.plaid.com](https://dashboard.plaid.com). From the Keys page, grab:
- **PLAID_CLIENT_ID** — your client ID
- **PLAID_SECRET** — the sandbox secret key

These will be stored as Supabase edge function secrets (never exposed to the browser).

### Changes

**1. Add Supabase secrets**
- `PLAID_CLIENT_ID` and `PLAID_SECRET` via the secrets tool

**2. Create edge function `supabase/functions/create-link-token/index.ts`**
- Calls Plaid's `/link/token/create` with `products: ['auth']`, `country_codes: ['US']`, `language: 'en'`
- Uses `sandbox` environment
- Returns the `link_token` to the frontend

**3. Create edge function `supabase/functions/exchange-plaid-token/index.ts`**
- Accepts the `public_token` from Plaid Link
- Calls `/item/public_token/exchange` to get `access_token` + `item_id`
- Calls `/accounts/get` with the access token to retrieve account details (name, mask, type, subtype)
- Returns sanitized account metadata (no raw access tokens sent to client)

**4. Install `react-plaid-link` package**
- Provides the `usePlaidLink` hook that opens Plaid's native Link modal

**5. Create `src/lib/plaidProvider.ts`**
- `createLinkToken()` — calls the edge function, returns link token
- `exchangePublicToken(publicToken)` — calls the edge function, returns `LinkedAccountMeta[]`
- Maps Plaid account data to existing `LinkedAccountMeta` interface (adds support for more account types: credit, loan, investment)

**6. Update `src/components/linked-accounts/BankLinkingFlow.tsx`**
- Replace the manual institution search step with Plaid Link:
  - On consent, call `createLinkToken()`, then open Plaid Link via `usePlaidLink`
  - On success callback, call `exchangePublicToken()` to get accounts
  - On exit/error, show the error step
- Simplify step indicator to: Privacy → Connecting → Done
- Keep the existing consent screen, success screen, and error screen

**7. Update `LinkedAccountMeta` type**
- Expand `accountType` union to include `'credit' | 'loan' | 'investment'` (Plaid returns these)
- Add optional `balance` field
- Keep backward compatible with existing encrypted storage data

**8. Keep mock provider as fallback**
- Add a feature flag check: if `PLAID_CLIENT_ID` secret is not configured, fall back to the existing mock flow
- This lets the app work in both modes during development

### Security
- Plaid secrets stored server-side only (edge functions)
- Raw `access_token` never sent to the browser — only masked account metadata
- Edge functions validate JWT auth before processing
- Public tokens are one-time-use and expire quickly

### What the user sees (sandbox)
- Plaid's polished bank selection UI with ~10,000 institutions
- Test login: username `user_good`, password `pass_good`
- Returns realistic account data (Chase Checking ••0000, etc.)

