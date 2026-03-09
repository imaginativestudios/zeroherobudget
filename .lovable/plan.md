

# Fix Budget Categories Not Showing

## Root Cause

The auto-seed logic in `Budget.tsx` (lines 55-68) has a **stale closure bug**. It calls `addSupabaseExpense` inside a `forEach` loop, but each call does `setExpenses([...expenses, newExpense])` where `expenses` is always the initial empty array `[]` from the closure. Every iteration overwrites the previous one, so only the **last expense** survives. Then `setBudgetSeeded(true)` fires, preventing re-seeding.

## Fix — `src/pages/Budget.tsx` (lines 54-68)

Replace the loop of individual `addSupabaseExpense` calls with a single batch write. Build the full array of expenses first, then call the underlying `setExpenses` once via `useLocalExpenses`:

1. **Add a `setAllExpenses` method** to `useLocalExpenses` (or use the existing storage setter directly) that accepts a full array.
2. **In the seed `useEffect`**: Build the complete expenses array in memory, then write it in one call.

### `src/hooks/useLocalExpenses.ts`

Add a `batchAddExpenses` function that builds the full array and writes once:

```ts
const batchAddExpenses = (items: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sort_order'>[]) => {
  const userId = user?.id ?? DEMO_USER_ID;
  const now = new Date().toISOString();
  const startOrder = expenses.reduce((max, e) => Math.max(max, e.sort_order ?? 0), -1) + 1;
  const newExpenses = items.map((item, i) => ({
    ...item,
    id: uuidv4(),
    user_id: userId,
    created_at: now,
    updated_at: now,
    sort_order: startOrder + i,
  }));
  setExpenses([...expenses, ...newExpenses]);
};
```

Return it alongside existing methods.

### `src/pages/Budget.tsx` (seed useEffect)

Replace the forEach loop with a single batch call:

```ts
useEffect(() => {
  if (isLoadingExpenses || budgetSeeded || expenses.length > 0) return;
  const items = DEFAULT_BUDGET_CATEGORIES.flatMap(group =>
    group.items.map(item => ({
      name: item.name,
      amount: item.suggestedAmount,
      category: group.name,
      is_income: group.name === INCOME_GROUP_NAME,
    }))
  );
  batchAddExpenses(items);
  setBudgetSeeded(true);
}, [isLoadingExpenses, budgetSeeded, expenses.length]);
```

### Reset stale seed flag

Since the user already has `budgetSeeded = true` with no (or one) expense, also add a recovery check: if `budgetSeeded` is true but `expenses.length === 0`, reset it to `false` so the seed re-runs.

