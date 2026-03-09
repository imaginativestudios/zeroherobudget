

# Implementation Verification — Link Bank Account

After reviewing every source file, here is a requirement-by-requirement verification of what is **actually implemented** vs. what was **claimed**.

---

## Requirements: Verified as Implemented

| # | Requirement | Status | Evidence |
|---|-------------|--------|----------|
| 1 | Link a bank account | **Implemented** | `LinkBank.tsx` multi-step flow: consent → search → connecting → success |
| 2 | View linked accounts | **Implemented** | `LinkedAccountsList.tsx` renders on `/accounts` and inside `/link-bank` |
| 3 | Reconnect expired session | **Implemented** | `ReconnectDialog.tsx` calls `reauthenticate()`, updates token via `updateAccountToken` |
| 4 | Remove a linked account | **Implemented** | `DisconnectDialog.tsx` confirms, calls `removeAccount`, shows success toast |
| 5 | No server-side storage | **Implemented** | No Supabase tables, no edge functions, no network calls in any linked-accounts file |
| 6 | Encrypted local storage | **Implemented** | `encryptedStorage.ts` — AES-GCM 256-bit, PBKDF2 100K iterations, random IV per operation |
| 7 | No raw account numbers stored | **Implemented** | Only masked names like `Checking ••4821` in `LinkedAccountMeta` |
| 8 | No sensitive data in logs | **Implemented** | Zero `console.log/warn/error` calls in any linked-accounts or encryption file |
| 9 | Consent screen with privacy explanation | **Implemented** | `ConsentScreen.tsx` — 3 cards: device-only, never on servers, disconnect anytime |
| 10 | Device-loss warning | **Implemented** | `DeviceLossWarning.tsx` shown below linked accounts list |
| 11 | Duplicate account detection | **Implemented** | `addAccounts` deduplicates by `institutionId + maskedAccountName`, returns `{ added, skipped }` |
| 12 | Connection timeout | **Implemented** | `Promise.race` with 15s timeout in `LinkBank.tsx`, specific timeout error message |
| 13 | Step indicator | **Implemented** | `StepIndicator` component in `LinkBank.tsx` with 4 steps |
| 14 | Disconnect success toast | **Implemented** | `LinkedAccountsList.tsx` line shows toast after `removeAccount` |
| 15 | `aria-label` on institution buttons | **Implemented** | `aria-label={\`Link ${inst.name} bank account\`}` on each button |
| 16 | Route registered | **Implemented** | `/link-bank` in `App.tsx` line 114 |
| 17 | Entry point from Accounts page | **Implemented** | `Accounts.tsx` line 299: `LinkedAccountsList onLinkNew={() => navigate('/link-bank')}` |

---

## Requirements: NOT Implemented (Gaps Found)

| # | Gap | Details | Risk |
|---|-----|---------|------|
| 1 | **No auto-expiry detection** | `markExpired` is exported from `useLinkedAccounts` but **never called** anywhere in the app. There is no periodic token validation, no simulated expiry trigger. The reconnect flow is fully built but **untestable without manually calling `markExpired` from browser console**. | Medium — reconnect flow is dead code in practice |
| 2 | **No incognito/private browsing detection** | No check for whether `localStorage` will persist. In Safari private mode, Web Crypto is available but localStorage is volatile. No warning is shown. | Low — data silently lost on tab close |
| 3 | **`isEncryptedStorageAvailable` stored incorrectly** | Line 18 in `useLinkedAccounts.ts`: `useState(isEncryptedStorageAvailable)` — this works by accident because React calls the function as an initializer, but it's fragile and misleading. Should be `useState(() => isEncryptedStorageAvailable())`. | Low — works but fragile |
| 4 | **Timeout ref not cleaned on unmount** | `timeoutRef` in `LinkBank.tsx` is cleared on reset/success/error, but if the component unmounts while connecting (e.g., user navigates away via browser back), the timeout still fires and calls `setStep` on an unmounted component. No cleanup in a `useEffect` return. | Low — React warning, no data issue |
| 5 | **Stale closure in `addAccounts`** | `addAccounts` depends on `accounts` state via closure. If called twice rapidly (unlikely but possible), the second call uses stale `accounts` from the first render, potentially losing the first batch. Should use a functional state updater pattern. | Low — unlikely in practice |

---

## Summary

**17 of 17 stated requirements are implemented.** The code matches the plan. Five minor gaps exist — none are launch blockers, but gap #1 (no auto-expiry) means the reconnect flow is effectively untestable by end users without developer tools.

### Recommended fixes (in priority order)

1. **Add a simulated expiry trigger** — e.g., auto-expire accounts linked more than 7 days ago on load, or add a "Simulate Expiry" dev button. Without this, the reconnect UI is dead code.
2. **Fix `useState(isEncryptedStorageAvailable)`** → `useState(() => isEncryptedStorageAvailable())` for correctness.
3. **Add unmount cleanup** for the timeout ref in `LinkBank.tsx`.
4. **Use functional updater** in `addAccounts` to avoid stale closures.
5. **Incognito detection** — optional, low priority.

