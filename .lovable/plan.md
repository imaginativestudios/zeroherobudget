

# Auto-Populate Default Categories for New Users

## What Changes
Instead of showing a separate setup wizard card when a new user visits the Budget page, we'll automatically seed the default budget categories into their expense list. The user will land directly on the normal budget page with all categories pre-populated (amounts at $0), ready to customize inline.

## Changes

### `src/pages/Budget.tsx`
1. Remove the `showSetupWizard` conditional block (lines 201–222) that renders `BudgetSetupWizard`
2. Remove the `BudgetSetupWizard` import
3. Add a `useEffect` that runs once: if `expenses.length === 0` and not loading, iterate over `DEFAULT_BUDGET_CATEGORIES` and call `addSupabaseExpense` for each item (setting `is_income` based on the Income group name)
4. Use a localStorage flag (e.g. `budget_seeded`) to prevent re-seeding if the user intentionally clears all expenses later

### Files no longer needed (can keep for now, just unused)
- `src/components/budget/BudgetSetupWizard.tsx` — no longer imported or rendered

## Result
New users see the full budget page immediately with all default categories listed at $0. They can edit names, amounts, reorder, delete, or add new categories directly — no wizard step required.

