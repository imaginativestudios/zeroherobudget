

# Add Income Categories to Budget Setup Wizard

## What changes

Currently the setup wizard only seeds expense categories (`is_income: false`). We'll add an **Income** group at the top of the wizard so users can define their income sources during setup.

## Changes

### 1. `src/lib/defaultBudgetCategories.ts`
Add a new group at the **start** of the `DEFAULT_BUDGET_CATEGORIES` array:

```
{
  name: "Income",
  icon: TrendingUp,
  items: [
    { name: "Salary / Wages", suggestedAmount: 0 },
    { name: "Side Income", suggestedAmount: 0 },
    { name: "Freelance / Contract", suggestedAmount: 0 },
    { name: "Investments / Dividends", suggestedAmount: 0 },
  ]
}
```

Add `TrendingUp` to the Lucide imports.

### 2. `src/components/budget/BudgetSetupWizard.tsx`
Update the `onComplete` callback type to include an `isIncome` flag:

```ts
onComplete: (items: { name: string; amount: number; category: string; isIncome: boolean }[]) => void;
```

When building the items array in `handleComplete`, set `isIncome: true` for items belonging to the "Income" group, `false` for all others.

### 3. `src/pages/Budget.tsx`
Update `handleSetupComplete` to pass `is_income: item.isIncome` instead of hardcoding `false`.

## Scope
- 3 files modified
- No new dependencies
- Existing income tracking via `is_income` field is already supported throughout the app

