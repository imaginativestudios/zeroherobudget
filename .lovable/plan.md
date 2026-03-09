

# Fix: Data Clear Should Reset Budget Seeding Flag

## Problem
After clearing local data, the `budget_seeded` flag remains in localStorage. This means:
- Auto-seeding won't re-trigger (it checks `budgetSeeded === true` and skips)
- The budget page stays empty after a clear
- The "Reset Quest" button is disabled because `totalItems === 0` — so the user can't clear again

## Root Cause
`src/lib/dataClear.ts` doesn't include `budget_seeded` in its list of keys to clear.

## Fix

### `src/lib/dataClear.ts`
- Add `'budget_seeded'` to the `LOCAL_STORAGE_KEYS` array (around line 41, near onboarding/UI state keys)
- Also add it to the `settings` branch inside `clearSelectiveData` (around line 104)

This is a 2-line change. After clearing data, the auto-seeding will re-trigger on next Budget page visit, giving the user fresh default categories.

