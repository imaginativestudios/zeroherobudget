

# Fix Transaction Form Issues

## Problems Identified

After investigating the Transactions page, I found **5 distinct issues**:

### 1. Leading Zero in Amount Field
- **Current**: `value={newTransaction.amount}` shows `0` when empty
- **Problem**: The `0` doesn't disappear when focused, and there's no visual dollar sign prefix
- **Solution**: Replace the plain `<Input>` with `<CurrencyInput prefix="$">` component

### 2. Missing Dollar Sign in Input
- **Current**: Uses plain `<Input type="number">` with no currency indicator
- **Problem**: Inconsistent with other currency inputs in the app that show `$` prefix
- **Solution**: Use `CurrencyInput` component with `prefix="$"` prop

### 3. Mobile Scrollability
- **Current**: `<DialogContent>` may not scroll on mobile when content overflows
- **Problem**: Users can't access all form fields on small screens
- **Solution**: Wrap dialog content in `<ScrollArea>` with a max height

### 4. Account Field Appears "Broken"
- **Current**: `useLocalAccounts()` returns an empty array `[]` by default
- **Problem**: No accounts exist until the user creates one, so the dropdown shows nothing
- **Root cause**: Unlike `useAccounts` (which has `DEFAULT_ACCOUNTS`), `useLocalAccounts` has no default
- **Solution**: Create a default "Main Checking" account if none exist, similar to the pattern in `useAccounts.ts`

### 5. Transactions Don't Persist/Show on Other Pages
- **Current**: `useLocalTransactions` requires `if (!user) return;` - silently fails for demo users
- **Problem**: Demo users (unauthenticated) can see data but `addTransaction` does nothing because `user` is `null`
- **Root cause**: The hook checks `if (!user) return;` but demo mode uses `DEMO_USER_ID` fallback
- **Solution**: Use `user?.id ?? DEMO_USER_ID` pattern instead of blocking when no user

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Transactions.tsx` | Replace amount Input with CurrencyInput, add ScrollArea for mobile |
| `src/hooks/useLocalAccounts.ts` | Add default account creation when empty |
| `src/hooks/useLocalTransactions.ts` | Fix demo mode persistence by using DEMO_USER_ID fallback |

---

## Detailed Changes

### 1. Transactions.tsx - Use CurrencyInput for Amount (lines 332-338)

**Before:**
```tsx
<Input 
  id="transaction-amount" 
  type="number" 
  step="0.01" 
  value={newTransaction.amount} 
  onChange={e => setNewTransaction({
    ...newTransaction,
    amount: parseFloat(e.target.value) || 0
  })} 
/>
```

**After:**
```tsx
<CurrencyInput 
  id="transaction-amount" 
  prefix="$"
  step={0.01}
  value={newTransaction.amount || ''} 
  onChange={e => setNewTransaction({
    ...newTransaction,
    amount: parseFloat(e.target.value) || 0
  })} 
  placeholder="0.00"
/>
```

Key changes:
- Use `CurrencyInput` component with `prefix="$"`
- Change `value` to show empty string when 0: `newTransaction.amount || ''`
- Add placeholder for when empty

### 2. Transactions.tsx - Add ScrollArea for Mobile Dialog (lines 319-438)

Wrap the dialog content in a ScrollArea to ensure it's scrollable on mobile:

```tsx
<DialogContent className="max-h-[90vh] p-0">
  <DialogHeader className="p-6 pb-0">
    <DialogTitle>Log Transaction</DialogTitle>
  </DialogHeader>
  <ScrollArea className="max-h-[calc(90vh-80px)] px-6 pb-6">
    <div className="space-y-4">
      {/* ... form fields ... */}
    </div>
  </ScrollArea>
</DialogContent>
```

### 3. Transactions.tsx - Add Import

Add CurrencyInput and ScrollArea imports:
```tsx
import { CurrencyInput } from "@/components/ui/currency-input";
import { ScrollArea } from "@/components/ui/scroll-area";
```

### 4. useLocalAccounts.ts - Add Default Account (line 19)

**Before:**
```tsx
const [accounts, setAccounts] = useUserLocalStorage<Account[]>('accounts', []);
```

**After:**
```tsx
const [accounts, setAccounts] = useUserLocalStorage<Account[]>('accounts', []);

// Create default account if none exist
useEffect(() => {
  if (accounts.length === 0 && user) {
    const defaultAccount: Account = {
      id: 'default-checking',
      name: 'Main Checking',
      type: 'checking',
      balance: 0,
      is_active: true,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAccounts([defaultAccount]);
  }
}, [accounts.length, user, setAccounts]);
```

Also need to support demo mode by using DEMO_USER_ID:
```tsx
import { DEMO_USER_ID } from '@/lib/constants';

// In the useEffect:
const effectiveUserId = user?.id ?? DEMO_USER_ID;
```

### 5. useLocalTransactions.ts - Fix Demo Mode Persistence (lines 33-43, 45-55)

**Before (addTransaction):**
```tsx
const addTransaction = async (transaction: ...) => {
  if (!user) return;  // ❌ Blocks demo users
  const newTransaction: Transaction = {
    ...transaction,
    id: uuidv4(),
    user_id: user.id,  // ❌ Would crash if user is null
    ...
  };
  setTransactions([...transactions, newTransaction]);
};
```

**After:**
```tsx
import { DEMO_USER_ID } from '@/lib/constants';

const addTransaction = async (transaction: ...) => {
  const effectiveUserId = user?.id ?? DEMO_USER_ID;
  const newTransaction: Transaction = {
    ...transaction,
    id: uuidv4(),
    user_id: effectiveUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  setTransactions([...transactions, newTransaction]);
};
```

Apply the same pattern to `addTransactionsBulk`:
```tsx
const addTransactionsBulk = async (newTransactions: ...) => {
  const effectiveUserId = user?.id ?? DEMO_USER_ID;
  const transactionsWithIds = newTransactions.map(t => ({
    ...t,
    id: uuidv4(),
    user_id: effectiveUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  setTransactions([...transactions, ...transactionsWithIds]);
};
```

---

## Technical Summary

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Leading zero stays | Using `0` as value | Use `amount \|\| ''` to show empty |
| No dollar sign | Plain `<Input>` | Use `<CurrencyInput prefix="$">` |
| Not scrollable on mobile | No ScrollArea wrapper | Wrap in `<ScrollArea>` with max-height |
| Account dropdown empty | No default accounts | Create default "Main Checking" on first load |
| Data doesn't save | `if (!user) return` blocks demo | Use `user?.id ?? DEMO_USER_ID` pattern |

---

## Additional Notes

- The `CurrencyInput` component already handles the focus/blur behavior for placeholders
- The default account will be created with `is_active: true` so it appears in `getActiveAccounts()`
- Demo mode transactions will persist under the `demo-hero-00000000_transactions` localStorage key
- All other pages using `useLocalTransactions` will now see the demo user's transactions

