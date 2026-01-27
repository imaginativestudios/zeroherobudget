

# Link Debt Payment Transactions to Debt Balances

## Summary

This plan implements automatic debt balance updates when users log "Debt Payments" category transactions, creating a bidirectional link between transaction records and debt balances. We'll also add a `debt_id` field to transactions for precise tracking.

---

## Current State Analysis

### How Debt Payments Work Today:

| Entry Point | Location | Updates Debt Balance? | Creates Transaction? |
|-------------|----------|----------------------|---------------------|
| Add Transaction | `/transactions` dialog | No | Yes |
| Import Transactions | CSV/Connector import | No | Yes |
| Strike Payment | Dashboard/Debt cards | Yes | Yes (recently added) |
| Edit Balance | `/debts` inline edit | Yes | No |
| Data Import Wizard | `/budgets` → Import | No | Yes |

### Gap Identified:
When users log a "Debt Payments" transaction via the Transactions page, the debt balance is **not automatically updated**. Users must manually adjust the balance on the Debts page.

---

## Proposed Solution

### 1. Add `debt_id` Field to Transaction Model

This enables precise linking between transactions and specific debts.

**Files to modify:**
- `src/hooks/useLocalTransactions.ts` - Add `debt_id` to Transaction interface
- `src/types/transactions.ts` - Add `debtId` to local Transaction type
- `supabase/migrations/` - Add `debt_id` column to transactions table

**Transaction Interface Update:**
```typescript
export interface Transaction {
  // ... existing fields
  debt_id?: string;  // NEW: Link to specific debt for balance updates
}
```

### 2. Add Debt Selector to Transaction Form

When category is "Debt Payments", show a dropdown to select which debt this payment applies to.

**File:** `src/pages/Transactions.tsx`

**Changes:**
- Add `useLocalDebts` hook import
- Add `debtId` to `newTransaction` state
- Add conditional debt selector when category is "Debt Payments"
- Modify `handleAddTransaction` to update debt balance when debt is selected

**UI Addition:**
```text
┌─────────────────────────────────────────────────┐
│ Category: [Debt Payments ▼]                     │
│                                                 │
│ Which Debt? ────────────────────────────────────│
│ [ Amex - $3,500 balance           ▼ ]          │ ← NEW
│                                                 │
│ Budget Line (Optional): [Credit Card Payment ▼] │
└─────────────────────────────────────────────────┘
```

### 3. Update Debt Balance on Transaction Save

**File:** `src/pages/Transactions.tsx`

Modify `handleAddTransaction()`:
```typescript
const handleAddTransaction = () => {
  // ... existing validation
  
  addTransaction({
    ...newTransaction,
    expenseId: newTransaction.expenseId || undefined,
    debt_id: newTransaction.debtId || undefined,  // NEW
  });

  // NEW: If this is a debt payment, update the debt balance
  if (newTransaction.category === 'Debt Payments' && newTransaction.debtId) {
    const debt = debts.find(d => d.id === newTransaction.debtId);
    if (debt) {
      updateDebt(newTransaction.debtId, {
        balance: Math.max(0, debt.balance - newTransaction.amount)
      });
      toast.success(`${debt.name} balance updated!`);
    }
  }
  
  // ... rest of function
};
```

### 4. Apply Same Logic to Other Transaction Entry Points

**A. CSV Import (`src/pages/Transactions.tsx` - `importTransactions`):**
- Parse debt name from description
- Match to existing debts by name similarity
- Update balances for matched debt payments

**B. Connector Import (`handleConfirmConnectorImport`):**
- Add debt matching for "Debt Payments" category
- Update balances automatically

**C. Data Import Wizard (`src/components/import/DataImportWizard.tsx`):**
- Add debt_id column mapping option
- Update debt balances on import

**D. Transaction Edit (`handleUpdateTransaction`):**
- If debt_id changes or amount changes, adjust debt balances accordingly
- Handle reversing old payment and applying new one

### 5. Add Demo Data Linking

**File:** `src/lib/demoDataLoader.ts`

Update demo transactions to include `debt_id` references:

```typescript
// Debt payments with debt_id linking
transactions.push({
  id: uuidv4(),
  date: format(addDays(monthStart, 20), 'yyyy-MM-dd'),
  description: 'Best Egg Loan Payment',
  amount: 808,
  category: 'Debt Payments',
  flow: 'outflow',
  expense_id: 'e34',
  debt_id: 'd1',  // NEW: Links to Best Egg Loan
  notes: 'Auto-pay - Balance auto-updated',
});

transactions.push({
  id: uuidv4(),
  date: format(addDays(monthStart, 25), 'yyyy-MM-dd'),
  description: 'Amex Payment',
  amount: 150,
  category: 'Debt Payments',
  flow: 'outflow',
  expense_id: 'e35',
  debt_id: 'c1',  // NEW: Links to Amex
  notes: 'Minimum payment',
});
```

---

## Technical Implementation

### Files to Create/Modify

| File | Changes |
|------|---------|
| `supabase/migrations/[new]_add_debt_id_to_transactions.sql` | Add `debt_id` column with FK to debts |
| `src/integrations/supabase/types.ts` | Regenerate to include `debt_id` |
| `src/hooks/useLocalTransactions.ts` | Add `debt_id` to Transaction interface |
| `src/types/transactions.ts` | Add `debtId` to local type |
| `src/pages/Transactions.tsx` | Add debt selector, update handlers |
| `src/components/import/DataImportWizard.tsx` | Add debt linking on import |
| `src/lib/demoDataLoader.ts` | Add debt_id to demo transactions |

### Database Migration

```sql
-- Add debt_id column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN debt_id uuid REFERENCES public.debts(id) ON DELETE SET NULL;

-- Create index for efficient lookups
CREATE INDEX idx_transactions_debt_id ON public.transactions(debt_id);

-- Comment for documentation
COMMENT ON COLUMN public.transactions.debt_id IS 
  'Optional link to debt for automatic balance updates on debt payments';
```

### Transaction Form State Update

```typescript
const [newTransaction, setNewTransaction] = useState({
  date: formatDate(new Date()),
  description: "",
  amount: 0,
  category: "",
  accountId: activeAccounts[0]?.id || 'default-checking',
  flow: 'out' as 'in' | 'out',
  expenseId: "",
  debtId: "",       // NEW
  notes: ""
});
```

### Debt Selector Component

```typescript
{newTransaction.category === 'Debt Payments' && debts.length > 0 && (
  <div className="space-y-2">
    <Label htmlFor="transaction-debt">Which Debt?</Label>
    <Select 
      value={newTransaction.debtId} 
      onValueChange={value => setNewTransaction({
        ...newTransaction,
        debtId: value === "none" ? "" : value
      })}
    >
      <SelectTrigger id="transaction-debt">
        <SelectValue placeholder="Select debt to update balance" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Don't update a debt balance</SelectItem>
        {debts.filter(d => d.balance > 0).map(debt => (
          <SelectItem key={debt.id} value={debt.id}>
            {debt.name} - {formatCurrency(debt.balance)} balance
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <p className="text-xs text-muted-foreground">
      Selecting a debt will automatically reduce its balance by this amount.
    </p>
  </div>
)}
```

---

## Entry Points Summary (After Implementation)

| Entry Point | Updates Debt Balance? | Creates Transaction? |
|-------------|----------------------|---------------------|
| Add Transaction (with debt selected) | **Yes** | Yes |
| Add Transaction (no debt selected) | No | Yes |
| Import Transactions (matched) | **Yes** | Yes |
| Strike Payment | Yes | Yes |
| Edit Balance | Yes | No |
| Data Import Wizard | **Yes** | Yes |

---

## Edge Cases Handled

1. **Overpayment**: Balance capped at $0 (cannot go negative)
2. **Debt not found**: Graceful fallback, no balance update
3. **Optional selection**: Users can choose "Don't update" to skip auto-update
4. **Edit transaction**: Original debt balance restored, new debt balance updated
5. **Delete transaction**: Could optionally reverse the balance change (future enhancement)

---

## Demo Data Verification

After implementation, demo users will see:
- Transactions page showing debt payments with linked debt names
- Debt balances that reflect historical payments
- "Which Debt?" dropdown when adding debt payments
- Toast confirmation when debt balance is updated

