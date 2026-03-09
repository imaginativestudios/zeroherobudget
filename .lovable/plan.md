

# Link Bank Account — Cross-Functional Launch Review

---

## 1. Evaluation by Area

### 1.1 Core Feature Functionality
**Status: Pass**

- Consent → Search → Connecting → Success/Error flow is complete
- `addAccounts`, `removeAccount`, `updateAccountToken`, `markExpired` all implemented
- Linked accounts list renders on `/accounts` and inside `/link-bank`
- Route `/link-bank` is registered in App.tsx

**Risk:** `addAccounts` merges without checking for duplicate `institutionId + maskedAccountName` combos. Linking the same bank twice produces duplicate entries.

**Recommendation:** Add deduplication check in `addAccounts` by `institutionId` + `maskedAccountName`, or show a warning.

---

### 1.2 UX Clarity & Onboarding
**Status: Pass**

- Consent screen clearly explains: device-only storage, nothing on servers, disconnect anytime
- Device-loss warning shown after accounts are listed
- Empty state has clear CTA
- Min touch targets (44px) applied consistently

**Risk:** No step indicator in the multi-step flow — user doesn't know they're on step 2 of 4.

**Recommendation:** Add a lightweight step indicator or breadcrumb (consent → search → connecting → done).

---

### 1.3 Error Handling
**Status: Pass with minor gaps**

- Connection failure shows error card with retry + cancel
- `reauthenticate` failure shows destructive toast
- `isEncryptedStorageAvailable` check blocks the feature if Web Crypto is missing

**Risk:** No timeout handling — if `exchangeToken` hangs (simulated delay is 1.8s, but a real provider could take longer), user sees an infinite spinner with no abort.

**Recommendation:** Add an `AbortController` or timeout (e.g., 15s) to the connecting step with "Taking too long? Try again" messaging.

---

### 1.4 Reconnect Flow
**Status: Pass**

- `ReconnectDialog` calls `reauthenticate()`, updates token on success
- Card shows "Needs Attention" badge when expired
- Reconnect button only appears when status is `expired`

**Risk:** No mechanism to automatically detect expiry. `markExpired` exists but is never called anywhere in the app — connections will appear "Active" forever unless manually expired.

**Recommendation:** Either: (a) simulate periodic token validation, or (b) document this as a mock-only limitation and add a TODO for real provider integration.

---

### 1.5 Unlink / Revoke Flow
**Status: Pass**

- `DisconnectDialog` explains data deletion clearly
- `removeAccount` filters from encrypted storage
- Copy mentions: "All locally stored data for this connection will be permanently deleted."

**Risk:** No confirmation toast after successful disconnection (only the dialog closes).

**Recommendation:** Add a success toast after disconnect: "Account disconnected."

---

### 1.6 Local Encrypted Storage
**Status: Pass**

- AES-GCM 256-bit with PBKDF2 key derivation (100K iterations)
- Random IV per encryption operation
- Key derived from `userId + APP_SALT`
- Silent failure on crypto errors — no data exposure
- `removeEncrypted` utility exists

**Risk (Low):** `APP_SALT` is hardcoded in source (`'zero-hero-bank-link-v1'`). Acceptable for client-side encryption where the threat model is "other browser tabs/extensions reading localStorage," but worth noting.

**Risk (Medium):** `isEncryptedStorageAvailable` is called as a function but stored via `useState(isEncryptedStorageAvailable)` — this invokes the function once during initialization. This works correctly but is slightly misleading in code review (looks like it's storing the function reference, not the result). It does work because React calls the initializer.

---

### 1.7 Backend Data Boundaries
**Status: Pass**

- No Supabase tables, edge functions, or API calls for linked accounts
- No network requests during linking (mock provider is fully local)
- `exchangeToken` and `reauthenticate` are pure local async functions
- No server-side storage of bank data whatsoever

---

### 1.8 Logging & Analytics Safety
**Status: Pass**

- Zero `console.log/info/debug/warn` calls in any linked-accounts file
- Zero analytics/tracking calls
- `encryptedStorage.ts` has empty catch blocks — no error payloads logged
- Toast messages show only institution names and masked account names (safe)

---

### 1.9 Security Architecture
**Status: Pass**

- Tokens are opaque UUIDs (`access-{uuid}`) — no real credentials
- No raw account numbers stored — only masked (e.g., `Checking ••4821`)
- Encryption key requires userId — inaccessible after logout without re-auth
- PBKDF2 with 100K iterations is reasonable for client-side derivation

**Risk:** Demo mode uses `DEMO_USER_ID` constant, meaning all demo users share the same encryption key. Demo data could theoretically be decrypted by anyone who knows the constant.

**Recommendation:** Acceptable for demo mode — document that demo-linked accounts are not truly secure.

---

### 1.10 Edge Case Handling
**Status: Needs Review**

| Edge Case | Handled? |
|-----------|----------|
| No existing accounts | ✅ Empty state with CTA |
| Connection failure | ✅ Error card with retry |
| User cancels | ✅ Cancel returns to list |
| Multiple accounts from same bank | ✅ Each shown separately |
| Navigate away mid-flow | ✅ State resets (component state) |
| App restart after linking | ✅ Data persists in encrypted localStorage |
| App reinstall / clear data | ⚠️ Data lost — device-loss warning shown |
| Duplicate account linking | ❌ No deduplication check |
| Private/incognito mode | ⚠️ No detection or warning |
| Network interruption | ✅ N/A — mock is local, but no timeout for real providers |
| Large number of accounts | ⚠️ No pagination or virtualization |

---

### 1.11 Accessibility
**Status: Pass with minor gaps**

- `sr-only` labels on icon buttons (Edit, Reconnect, Disconnect)
- `min-h-[44px]` touch targets throughout
- Alert dialogs use Radix primitives (keyboard + screen reader accessible)
- Institution search input has `autoFocus`

**Risk:** Institution list items are `<button>` elements (good) but lack `aria-label` describing the action ("Link Chase checking account").

---

### 1.12 Production Environment Readiness
**Status: Ready with Conditions**

- Feature is fully functional with mock provider
- No backend changes required
- No new dependencies needed
- Route is registered and navigable

**Condition:** The mock provider has a 10% random failure rate in `exchangeToken` and 15% in `reauthenticate`. This is intentional for testing but may confuse real users. When swapping to a real provider, remove randomized failures.

---

## 2. Manual QA Test Plan

| ID | Scenario | Steps | Expected Result | Severity |
|----|----------|-------|-----------------|----------|
| T01 | Happy path link | `/link-bank` → Link Account → Consent → Search → Select Chase → Wait | Success screen with masked account name | Critical |
| T02 | View linked accounts | After T01 → Done → View list | Chase account appears with Active badge | Critical |
| T03 | Disconnect account | Click trash icon → Confirm disconnect | Account removed, list empty | Critical |
| T04 | Reconnect expired | (Requires manually calling `markExpired`) → Click Reconnect | Status returns to Active, new token | High |
| T05 | Connection failure | Retry linking until 10% failure triggers | Error card with retry button | High |
| T06 | Retry after failure | T05 → Click "Try Again" | Re-attempts connection | High |
| T07 | Cancel consent | Consent screen → Cancel | Returns to list view | Medium |
| T08 | Search filter | Search step → Type "ally" | Only Ally Bank shown | Medium |
| T09 | Search no results | Search step → Type "xyz" | "No institutions found" message | Medium |
| T10 | Multiple accounts | Link Chase, then link Ally | Both appear in list | High |
| T11 | Duplicate linking | Link Chase twice | Two Chase entries (current behavior — flag as known issue) | Medium |
| T12 | App restart persistence | Link account → Refresh browser | Linked account still visible | Critical |
| T13 | Clear data loss | Link account → Clear localStorage → Refresh | No accounts shown, empty state | Medium |
| T14 | No Web Crypto | (Test in env without crypto.subtle) | Error card: "Secure storage not available" | High |
| T15 | Privacy: localStorage inspection | Link account → DevTools → Application → localStorage | Only `zh_enc_*` keys visible, values are base64 encrypted | Critical |
| T16 | Privacy: no console leaks | Open DevTools Console → Complete full link flow | No account data, tokens, or keys in console | Critical |
| T17 | Privacy: no network requests | Open DevTools Network → Complete full link flow | No XHR/Fetch requests related to banking | Critical |
| T18 | Consent copy accuracy | Read consent screen | Matches documented privacy commitments | High |
| T19 | Device-loss warning | Link account → Scroll to bottom of list | Warning about data loss on clear/uninstall | Medium |
| T20 | Back navigation | Any step → Click back arrow | Returns to previous step or navigates back | Medium |

---

## 3. Security Review Summary

| Category | Finding | Risk Level |
|----------|---------|------------|
| Data at rest | AES-GCM 256-bit, PBKDF2 100K iterations | ✅ Low risk |
| Data in transit | No network calls — all local | ✅ No risk |
| Token handling | Opaque UUIDs, no real credentials | ✅ Low risk |
| Logging | Zero console output in feature files | ✅ No risk |
| Analytics | No tracking events in feature files | ✅ No risk |
| Demo mode key | Shared `DEMO_USER_ID` for encryption | ⚠️ Low — acceptable for demo |
| Salt hardcoded | `APP_SALT` in source code | ⚠️ Low — expected for client-side crypto |
| No server storage | Confirmed — no Supabase tables, no edge functions | ✅ No risk |

**No privacy requirement violations found.**

---

## 4. Final Launch Report

### Launch Readiness Summary
The Link Bank Account feature is functionally complete, privacy-compliant, and well-architected. Encrypted local storage, zero-logging policy, and no server-side data storage all meet the stated requirements. The mock provider simulates realistic flows including failures and re-authentication.

### Critical Launch Blockers
**None.**

### Issues to Address (Non-blocking)

1. **Duplicate account linking** — No dedup check. Users can link the same bank repeatedly. Add a merge/warning.
2. **No connection timeout** — Infinite spinner if provider hangs. Add 15s abort.
3. **No auto-expiry detection** — `markExpired` is never called automatically. Connections stay "Active" forever.
4. **No disconnect success toast** — Dialog closes silently after disconnect.
5. **Incognito mode** — No detection or warning that data won't persist.

### UX Improvements Recommended Before Launch
- Add step indicator to multi-step flow
- Add `aria-label` to institution search buttons
- Add success toast on disconnect

### Post-Launch Monitoring
- Monitor for Web Crypto API availability issues (Safari private browsing blocks it in some versions)
- Track feature adoption via non-sensitive analytics (e.g., "linked_account_added" event count — no account details)
- Watch for localStorage quota issues with many encrypted entries

### Final Verdict

## **Ready with Conditions**

The feature meets all privacy requirements and core functionality works correctly. The conditions are minor UX polish items (dedup warning, timeout, disconnect toast) that don't block launch but should be addressed in the next iteration.

