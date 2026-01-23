

# Add 6th Task to Getting Started Checklist

## Overview

Add a 6th task to the Getting Started checklist that aligns with Journey Step 5: "Invest for the Future". This will make the checklist accurately represent all 6 journey milestones and match the subtext that says "See all 6 steps to financial freedom."

---

## Current vs Updated Task List

| # | Current Task | Journey Step Alignment |
|---|-------------|----------------------|
| 1 | Set your income | Step 1: Establish Your Budget |
| 2 | Set up your budget | Step 1: Establish Your Budget |
| 3 | Track a debt | Step 3: Eliminate Consumer Debt |
| 4 | Start your emergency fund | Step 2/4: Build Safety Net |
| 5 | Record a transaction | General: Transaction logging |
| **6** | **(NEW) Start investing** | **Step 5: Invest for the Future** |

---

## New 6th Task

```text
Title: "Start investing"
Description: "Plant seeds for your future wealth"
Icon: Sprout (matches Journey step 5)
Completion: Investment account exists OR investment expense category
Link: /budgets (to add investment category)
```

---

## Technical Changes

### File: `src/components/dashboard/GettingStartedChecklist.tsx`

**1. Add new import (Line 4):**
```tsx
import { Sprout } from 'lucide-react';
```

**2. Update component props interface (Lines 26-32):**

Need to add `accounts` prop to check for investment accounts (same logic as Journey step 5).

```tsx
interface GettingStartedChecklistProps {
  income: number;
  expenses: Expense[];
  debts: Debt[];
  transactions: Transaction[];
  moatCurrent: number;
  accounts: Account[];  // NEW
}
```

**3. Add Account type import (Line 24):**
```tsx
import type { Account } from '@/hooks/useLocalAccounts';
```

**4. Add accounts to destructured props (Line 48):**
```tsx
export function GettingStartedChecklist({
  income,
  expenses,
  debts,
  transactions,
  moatCurrent,
  accounts,  // NEW
}: GettingStartedChecklistProps) {
```

**5. Add investment completion logic (after line 52):**
```tsx
// Check for investment tracking (matches Journey step 5 logic)
const hasInvestmentAccount = accounts.some(a => 
  a.type.toLowerCase().includes('investment') || 
  a.type.toLowerCase().includes('retirement') ||
  a.type.toLowerCase().includes('401k') ||
  a.type.toLowerCase().includes('ira')
);
const hasInvestmentExpense = expenses.some(e => 
  e.category.toLowerCase().includes('investment') ||
  e.category.toLowerCase().includes('savings')
);
const isInvestingStarted = hasInvestmentAccount || hasInvestmentExpense;
```

**6. Add 6th task to tasks array (after line 93):**
```tsx
{ 
  id: 'investing', 
  title: 'Start investing', 
  description: 'Plant seeds for your future wealth',
  icon: Sprout,
  isComplete: isInvestingStarted, 
  href: '/budgets'
},
```

---

### File: `src/pages/Dashboard.tsx`

Need to pass the `accounts` prop to the GettingStartedChecklist component.

**1. Import useLocalAccounts (if not already imported)**

**2. Get accounts from hook:**
```tsx
const { accounts } = useLocalAccounts();
```

**3. Pass accounts to GettingStartedChecklist:**
```tsx
<GettingStartedChecklist
  income={income}
  expenses={expenses}
  debts={debts}
  transactions={transactions}
  moatCurrent={moatCurrent}
  accounts={accounts}  // NEW
/>
```

---

## Grid Layout Update

The task grid currently uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. With 6 items:
- Mobile (1 column): 6 rows ✓
- Tablet (2 columns): 3 rows ✓
- Desktop (3 columns): 2 rows ✓

This already works perfectly for 6 items — no changes needed to the grid.

---

## Summary

| File | Changes |
|------|---------|
| `src/components/dashboard/GettingStartedChecklist.tsx` | Add `Sprout` import, add `accounts` prop, add investment logic, add 6th task |
| `src/pages/Dashboard.tsx` | Pass `accounts` prop to checklist |

The 6 tasks will now align with the 6-step journey, and the grid will display as a clean 2×3 layout on desktop.

