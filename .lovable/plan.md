

# Fix: Auto-Seeding Fails for Unauthenticated (Demo) Users

## Root Cause
In `src/hooks/useLocalExpenses.ts` line 28, the `addExpense` function has a guard: `if (!user) return;`. When you're not logged in, `user` is `null`, so every call to `addSupabaseExpense` during auto-seeding silently does nothing.

The `useUserLocalStorage` hook already handles demo users by falling back to a `DEMO_USER_ID`, but `addExpense` doesn't use that same fallback — it requires a real auth user.

## Fix

### `src/hooks/useLocalExpenses.ts`
Update `addExpense` to use the same demo-user fallback pattern used elsewhere:

1. Import `DEMO_USER_ID` from `@/lib/demoDataLoader`
2. Replace the `if (!user) return;` guard with a fallback: `const userId = user?.id ?? DEMO_USER_ID;`
3. Use `userId` instead of `user.id` when constructing the new expense

This is a 1-line logic change — aligns `addExpense` with the persistence model already used by `useUserLocalStorage` and `useLocalTransactions`.

## Scope
- 1 file modified (`src/hooks/useLocalExpenses.ts`)
- No new dependencies
- Consistent with existing demo-first architecture

