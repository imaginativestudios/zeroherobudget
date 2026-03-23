

## Fix Plaid Link Issues: "Connecting to undefined" and Auth Method

Two bugs found plus a sandbox UX clarification:

### Bug 1: "Connecting to undefined…" loading text
In `BankLinkingFlow.tsx` line 214, when `handleConsent` sets `step = 'connecting'`, `usePlaid` is still `null` (not yet determined). Since `null` is falsy, it falls to the else branch and renders `selectedInstitution?.name` which is `undefined`.

**Fix**: Change the connecting text condition to handle the `null` (checking) state:
```
usePlaid === false ? `Connecting to ${selectedInstitution?.name}…` : 'Connecting to your bank…'
```

### Bug 2: `getClaims()` does not exist in supabase-js v2
Both edge functions use `supabase.auth.getClaims(token)` which is not a valid method. Replace with `supabase.auth.getUser()` in both:
- `supabase/functions/create-link-token/index.ts` (lines 33-41)
- `supabase/functions/exchange-plaid-token/index.ts` (lines 41-47)

### Bug 3: "Invalid phone number" is a sandbox UX issue
Plaid sandbox MFA asks for a phone number. The test value is `111-111-1111` and verification code `1234`. Add a hint in the `PlaidLinkStep` component so testers know which credentials to use.

### Files changed
1. **`supabase/functions/create-link-token/index.ts`** — replace `getClaims` with `getUser()`
2. **`supabase/functions/exchange-plaid-token/index.ts`** — same auth fix
3. **`src/components/linked-accounts/BankLinkingFlow.tsx`** — fix "undefined" in connecting text
4. **`src/components/linked-accounts/PlaidLinkStep.tsx`** — add sandbox test credentials hint

