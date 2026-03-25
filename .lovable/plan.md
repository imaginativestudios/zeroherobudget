

## Remove Budget Line & Add Category Dropdown from Budget Categories

### What changes

**1. Remove "Budget Line" from Transactions page (`src/pages/Transactions.tsx`)**

Three places to clean up:

- **Add Transaction dialog** (lines 476-492): Remove the "Budget Line (Optional)" select field entirely
- **Edit Transaction dialog** (lines 748-764): Remove the "Budget Line (Optional)" select field entirely  
- **Transaction table** (line 635): Remove the "Budget Line" column header
- **Transaction table row** (lines 650-652): Remove the budget line cell that shows expense name
- The category field in both dialogs currently uses a plain text `<Input>` — this will be replaced with a grouped `<Select>` dropdown

**2. Replace Category text input with grouped Select dropdown**

In both the Add and Edit transaction dialogs, replace the plain `<Input>` for category with a `<Select>` that:
- Groups categories by their budget group (Housing, Utilities, Food, etc.) using the `useCategories()` hook
- Shows only the user's **enabled** categories (respects their budget setup)
- Uses group headers as visual separators (similar to how `CategoryBadgeSelect` already does this)
- The category field will span the full width (since budget line is removed from its grid row)

**3. Clean up unused references**

- Remove `expenseId` from `newTransaction` state initialization and reset calls (4 places)
- Remove the `useExpenses` import from `useLocalSettings` (no longer needed for budget line matching)
- Keep `expenses` import only if still used elsewhere (CSV import mapping) — if so, leave it

### Files changed
1. `src/pages/Transactions.tsx` — All changes above

