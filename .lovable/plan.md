

## Link Bank Account — Plan

This is a significant feature. Given the project's **local-first architecture** (no banking data on servers), the existing account system (manual entry via `useLocalAccounts`), and the fact that this is a **Vite + React web app** (no native Keychain/Keystore available), the implementation will simulate a third-party bank-linking provider (like Plaid) using a mock OAuth flow, and store linked account metadata in encrypted localStorage.

---

### Architecture

```text
┌─────────────────────────────────────────────────┐
│  User's Device (Browser)                        │
│                                                 │
│  ┌──────────────┐   ┌────────────────────────┐  │
│  │ Link Bank UI │──▶│ Mock Plaid OAuth Flow  │  │
│  │ (consent +   │   │ (simulated redirect)   │  │
│  │  privacy)    │   └──────────┬─────────────┘  │
│  └──────────────┘              │                │
│                     ┌──────────▼─────────────┐  │
│                     │ Encrypted LocalStorage │  │
│                     │ - institution name     │  │
│                     │ - masked account ••1234│  │
│                     │ - account type         │  │
│                     │ - link token (opaque)  │  │
│                     │ - linked_at timestamp  │  │
│                     └────────────────────────┘  │
│                                                 │
│  Server stores: NOTHING sensitive               │
└─────────────────────────────────────────────────┘
```

### What gets built

**1. Encrypted storage utility** (`src/lib/encryptedStorage.ts`)
- AES-GCM encryption using Web Crypto API with a key derived from user ID + app salt
- Wraps localStorage with encrypt/decrypt for linked bank data
- Never stores raw sensitive data in plain localStorage

**2. Hook: `useLinkedAccounts`** (`src/hooks/useLinkedAccounts.ts`)
- CRUD for linked bank accounts using encrypted storage
- Stores only: institution name, masked account name (••1234), account type, opaque access token, status (active/expired), linked timestamp
- No balances, no routing numbers, no transaction history

**3. Mock bank provider** (`src/lib/mockBankProvider.ts`)
- Simulates a Plaid-like OAuth flow: `initLinkSession()` returns a mock link token, `exchangeToken()` returns masked account metadata
- Simulates token expiry for re-auth testing
- Returns realistic institution names and masked account numbers

**4. Page: Link Bank Account flow** (`src/pages/LinkBank.tsx`)
- Multi-step flow:
  1. **Privacy & consent screen** — plain-language explanation of what's stored, what's not, device-loss warning
  2. **Institution search** — mock search with common bank names
  3. **OAuth simulation** — loading state simulating redirect to bank
  4. **Success** — shows linked accounts with masked details
  5. **Error states** — connection failed, session expired, user cancelled

**5. Linked Accounts management UI** (`src/components/linked-accounts/`)
- `LinkedAccountsList.tsx` — table/cards showing linked institutions, masked names, status badges
- `LinkedAccountCard.tsx` — single account with reconnect/disconnect actions
- `ConsentScreen.tsx` — privacy explanation with explicit "I understand" consent
- `ReconnectDialog.tsx` — re-auth flow for expired connections
- `DisconnectDialog.tsx` — confirmation with explanation of what happens
- `DeviceLossWarning.tsx` — inline alert explaining data loss on app deletion

**6. Entry points**
- Add "Link Bank Account" button to `/accounts` page
- Add "Linked Accounts" section to Account Settings page
- Route: `/link-bank` in App.tsx

### Screen list

| Screen | Purpose |
|--------|---------|
| Consent & Privacy | Explain data handling before linking |
| Institution Search | Pick a bank (mock list) |
| Connecting... | Loading state during OAuth simulation |
| Success | Show newly linked account |
| Error | Connection failed with retry |
| Linked Accounts List | View all linked accounts |
| Reconnect Dialog | Re-authenticate expired connection |
| Disconnect Dialog | Confirm removal with data warning |

### Security & privacy notes

- **Web Crypto API** (AES-GCM) encrypts all linked account data at rest in localStorage
- Encryption key derived from authenticated user ID — data is inaccessible without login
- No sensitive data in console logs, network requests, or analytics
- Mock access tokens are opaque strings — never contain real credentials
- Device-loss warning: "If you clear browser data or uninstall the app, linked account information will be permanently deleted. You can always re-link."
- Consent copy covers: what we see, what stays on device, what's never on our servers

### Sample consent copy

> **Why link a bank account?**
> Linking lets you see your account names and types inside the app — no more manual entry.
>
> **What's stored on your device:**
> Institution name, account nickname (masked), and account type.
>
> **What's NOT stored on our servers:**
> Account numbers, routing numbers, balances, or transaction history. We never see or store your banking credentials.
>
> **How to disconnect:**
> You can unlink any account at any time from Settings → Linked Accounts.

### Edge cases

- User has no existing accounts — link flow creates a local account entry automatically
- OAuth simulation times out — show error with retry button
- User navigates away mid-flow — state resets, no partial data saved
- Multiple linked accounts from same institution — each shown separately
- Browser private/incognito mode — warn that data won't persist
- Encrypted storage key unavailable (no user session) — gracefully fall back to read-only with warning

### Developer notes

- `Web Crypto API` (`crypto.subtle`) is available in all modern browsers and service workers
- AES-GCM with 256-bit key derived via PBKDF2 from `userId + APP_SALT`
- IV generated per encryption operation, stored alongside ciphertext
- On user logout, encrypted data remains but is inaccessible without the key
- Future: swap mock provider for real Plaid/MX integration by replacing `mockBankProvider.ts`

