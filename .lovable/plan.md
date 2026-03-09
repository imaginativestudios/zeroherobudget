

# Remove Monthly Income Card from Budget Page

The Budget page has a standalone "Monthly Income" card (lines 286–308 in `Budget.tsx`) with a currency input for setting income. This duplicates/conflicts with the income category group already present in the budget's expense list (seeded from `DEFAULT_BUDGET_CATEGORIES` which includes an income group).

## Changes

### `src/pages/Budget.tsx`
- **Delete lines 286–308** — the entire "Income Section" `<Card>` block containing the `CurrencyInput` for monthly income.
- The `useIncome` hook import and `[income, setIncome]` destructuring can also be removed if no other code on this page references them. (Will verify — the Budget Overview Card likely reads `income` so the hook may need to stay for read-only use; only the standalone card and its input are removed.)

### No other files affected
- The Dashboard's `FinancialCard` for "Monthly Income" stays — it reads from the same hook and links to the Income Report, which is a different concern.
- The income value will now be managed solely through the budget category groups (the "Income" group items).

**One file, one deletion block.**

