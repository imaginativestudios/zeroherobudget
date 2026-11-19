# Equal-height side-by-side cards and Debt Strategy fix

## 1. Side-by-side cards share one height
On desktop, cards in the same row will stretch to the tallest card's height, with their buttons pinned to the bottom.
- **Dashboard rows:**
  - Emergency Fund + Financial Insights (your screenshot)
  - Debts / Budget / Payoff Strategy
  - Monthly Income / Net Worth and the other overview pairs
- On phones, cards stack, so their heights stay natural.

## 2. Debt Strategy page sees the user's debts
- **Cause:** debts are saved in two places. Dashboard, onboarding, CSV import and demo data use one list. The Debt Strategy page and the Net Worth report read an older, separate list, which is empty for demo users. Real users are affected too: a debt added during onboarding never appears on Debt Strategy.
- **Fix:** point Debt Strategy and the Net Worth report at the same list everything else uses. Adding, editing, deleting and importing debts there then shows up on the dashboard, and the reverse.
- **Existing data:** debts already saved in the older list are copied into the shared list once per account, skipping duplicates, so nobody loses entries.

## 3. Screenshot
Retake `marketing/linkedin-screens/debts.png` with the same setup as before (393x727 at 3x, light mode, demo data, Zora intro hidden) and commit it.

## Checks
- Demo and empty states on the Dashboard and Debt Strategy at 375px and 1280px, in light and dark mode.
- A test that a debt added on Debt Strategy appears on the dashboard and the reverse. A test that older saved debts are copied over once.

## Technical details
- `src/pages/DebtSnowball.tsx` and `src/pages/reports/NetWorthReport.tsx`: replace `useUserLocalStorage("bdt_debts")` / `useLocalStorage("bdt_debts")` with `useLocalDebts`. Add a small mapper (`interest_rate` <-> `apr`, `minimum_payment` <-> `min`) in a shared helper. Keep writes going through functional setters.
- Migration helper: if `${uid}_bdt_debts` has items, merge them into `${uid}_debts` by id and by name+balance, then remove the old key. It runs before debts are exposed.
- `useLocalSettings.useDebts` is either retargeted or removed if unused. Record the single debt store rule in `AGENTS.md`.
- Equal heights: add `h-full` to grid-item wrappers (motion.divs) and the `Card` roots in `EmergencyFundCard` and `BehavioralHintCard`. Use `flex flex-col` with `mt-auto` on action rows where buttons should align.
- New unit/e2e test next to the existing e2e specs.
