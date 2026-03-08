

## UX Risk Evaluation: Wealth Optimizer

### 1. Usability Risks

**Safety Floor slider max is unreliable.** `maxSlider` uses `Math.max(checkingBalance, 5000)` — if checking balance is $0 (common for new users), the slider range is 0–5000 with a default of $1,000, but adjusting it has no visible effect since lazy cash is already $0. The slider feels broken.

**No undo for Sweep.** The "Sweep Now" button immediately logs two transactions. There's no confirmation dialog. A misclick on mobile (large 48px touch target, full-width button) could create unwanted transfer records.

**Sweep doesn't actually update account balances.** The `addTransaction` in `useTransactions` calls `updateAccount` to adjust balances, but both transactions reference accounts found via `useAccounts` which reads from localStorage. If the user doesn't have accounts set up, the sweep silently fails with a toast error that doesn't guide them to fix it.

### 2. Confusion Risks

**"Lazy Cash" is jargon.** First-time users may not understand what "lazy cash" means without reading the educational card at the bottom. The term appears prominently before it's explained.

**Mock rate displayed as real.** The badge says "via Global Rates API" but it's hardcoded at 4.09%. Users may trust this as a live rate and make real financial decisions based on stale data. This is a **trust risk**.

**Sweep creates local transactions only.** For authenticated users with Supabase, the sweep writes to localStorage, not the `transactions` table. This creates a data consistency gap — the user sees the transfer in their local transaction log but it won't persist across devices or after clearing browser data.

### 3. Edge Cases

- **No savings account exists**: Handled with a warning, but the warning is small and easy to miss.
- **Checking balance is exactly the safety floor**: Lazy cash = $0, empty state shown. Fine.
- **Safety floor exceeds checking balance**: Input is clamped via `handleInputChange` but the slider allows values above the checking balance (up to `maxSlider`). Lazy cash clamps to 0 via `Math.max`, but the UI doesn't explain why.
- **Multiple checking/savings accounts**: Only the **first** active checking and savings accounts are used (`Array.find`). Users with multiple accounts get no choice and no indication which account is selected.
- **Swept state resets on page navigation**: `swept` is `useState`, not persisted. If the user navigates away and back, they can sweep again, creating duplicate transactions.

### 4. Accessibility Risks

- **Slider lacks aria-label**: The Radix slider has no `aria-label` or `aria-labelledby` describing it as "Safety Floor amount."
- **Color-only differentiation**: The "Lazy Cash" box uses `text-primary` to highlight the value. Users with color vision deficiency may not distinguish it from other values.
- **Educational card icon**: `<Sparkles>` icon is decorative but lacks `aria-hidden="true"`.
- **Currency input**: The `$` sign is a visual-only icon inside the input. Screen readers won't announce "dollars."

### 5. User Trust Risks

- **Financial language without disclaimers**: Showing specific dollar earnings ("could be earning you $X/mo") without a disclaimer that this is an estimate, not guaranteed, could erode trust if users compare to real HYS returns.
- **No indication this is a simulation**: The sweep action creates real transaction records. Users may expect it to integrate with their actual bank.

---

### Recommended Improvements

| Risk | Fix |
|---|---|
| No sweep confirmation | Add an `AlertDialog` before executing the sweep |
| Mock rate shown as real | Add "(mock)" label or "Rate is illustrative" disclaimer |
| Multiple accounts ignored | Let user select which checking/savings account to use |
| Swept state not persisted | Store sweep timestamp in localStorage to prevent duplicates |
| Slider missing aria-label | Add `aria-label="Safety floor amount in dollars"` |
| Jargon confusion | Add a tooltip or inline definition for "Lazy Cash" on first appearance |
| localStorage-only persistence | For authenticated users, write sweep transactions to Supabase `transactions` table |
| No undo | Add "Undo" action in the success toast (within 5s window) |

### Priority Order

1. **Add confirmation dialog before sweep** — prevents accidental transactions
2. **Persist to Supabase for authenticated users** — data integrity
3. **Add aria-labels and screen reader context** — WCAG compliance
4. **Mock rate disclaimer** — user trust
5. **Account selector for multi-account users** — usability

