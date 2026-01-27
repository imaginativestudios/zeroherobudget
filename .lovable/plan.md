
# Fix Transaction Ledger Not Showing Transactions

## Problem Identified

Transactions are being saved to localStorage correctly, but they don't appear in the transaction ledger. The root cause is a bug in how the account filter is passed to the transaction retrieval function.

## Root Cause Analysis

### The Bug Location

**File:** `src/pages/Transactions.tsx`

**Line 125:**
```typescript
const monthTransactions = getTransactionsByMonth(selectedMonth, selectedAccount);
```

### What's Happening

1. `selectedAccount` is initialized to `"all"` (line 30)
2. This value is passed directly to `getTransactionsByMonth`
3. The wrapper function (lines 90-102) passes it unchanged to `getRawTransactionsByMonth`
4. In `useLocalTransactions.ts`, the filter logic is:
   ```typescript
   const matchesAccount = !accountId || t.account_id === accountId;
   ```
5. Since `"all"` is truthy, `!accountId` is `false`, so it tries to match `t.account_id === "all"`
6. No transaction has an `account_id` of `"all"`, so **zero transactions match**

### Why Amount Shows But Ledger Is Empty

The `totalSpending` calculation at line 127 has a special case:
```typescript
const totalSpending = selectedAccount === 'all' 
  ? getTotalActualSpending(selectedMonth)  // Uses different function
  : monthTransactions.filter(t => t.flow === 'out').reduce((sum, t) => sum + t.amount, 0);
```

When `selectedAccount === 'all'`, it calls `getTotalActualSpending` which uses a different code path that doesn't filter by account. However, `monthTransactions` is still empty because of the bug above.

---

## Solution

### File to Modify: `src/pages/Transactions.tsx`

Update the `getTransactionsByMonth` wrapper function to convert `"all"` to `undefined`:

**Current code (lines 90-102):**
```typescript
const getTransactionsByMonth = (month: string, accountId?: string) => {
  return getRawTransactionsByMonth(month, accountId).map(t => ({
    id: t.id,
    date: t.date,
    description: t.description,
    amount: t.amount,
    category: t.category,
    accountId: t.account_id,
    flow: t.flow,
    expenseId: t.expense_id,
    notes: t.notes
  }));
};
```

**Fixed code:**
```typescript
const getTransactionsByMonth = (month: string, accountId?: string) => {
  // Convert "all" to undefined so the filter shows all accounts
  const filterAccountId = accountId === 'all' ? undefined : accountId;
  return getRawTransactionsByMonth(month, filterAccountId).map(t => ({
    id: t.id,
    date: t.date,
    description: t.description,
    amount: t.amount,
    category: t.category,
    accountId: t.account_id,
    flow: t.flow,
    expenseId: t.expense_id,
    notes: t.notes
  }));
};
```

---

## Technical Summary

| Aspect | Details |
|--------|---------|
| Bug Type | Logic error in account filter handling |
| Affected Feature | Transaction ledger display |
| Root Cause | `"all"` passed as account ID instead of `undefined` |
| Files Changed | 1 (`src/pages/Transactions.tsx`) |
| Lines Changed | 2 lines (add variable + update function call) |
| Risk Level | Low - isolated change with clear scope |

---

## Verification Steps

After the fix:
1. Navigate to the Transactions page
2. Ensure "All Accounts" is selected in the dropdown
3. Previously added transactions should now appear in the ledger
4. Switching between specific accounts and "All Accounts" should filter correctly
