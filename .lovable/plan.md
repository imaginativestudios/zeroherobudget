

# Add Swipe Navigation to Core Pages

## Overview

Wrap the Dashboard, Budget, Debts, and Transactions pages with the existing `SwipeablePageWrapper` component to enable horizontal swipe navigation between them on mobile devices.

---

## Navigation Flow

Users can swipe between pages in this sequence:

```text
Dashboard ←→ Budget ←→ Debts ←→ Transactions
```

| Page | Swipe Left → | ← Swipe Right |
|------|--------------|---------------|
| Dashboard | Budget | (edge - no route) |
| Budget | Debts | Dashboard |
| Debts | Transactions | Budget |
| Transactions | (edge - no route) | Debts |

---

## Implementation

### File Modifications

Each page will be wrapped with the `SwipeablePageWrapper` component, passing the appropriate left and right routes.

#### 1. Dashboard.tsx

Wrap the return JSX with `SwipeablePageWrapper`:
- `leftRoute="/budgets"` (swipe left goes to Budget)
- `rightRoute={undefined}` (no route - Dashboard is the start)

#### 2. Budget.tsx

Wrap the return JSX with `SwipeablePageWrapper`:
- `leftRoute="/debts"` (swipe left goes to Debts)
- `rightRoute="/dashboard"` (swipe right goes to Dashboard)

#### 3. DebtSnowball.tsx

Wrap the return JSX with `SwipeablePageWrapper`:
- `leftRoute="/transactions"` (swipe left goes to Transactions)
- `rightRoute="/budgets"` (swipe right goes to Budget)

#### 4. Transactions.tsx

Wrap the return JSX with `SwipeablePageWrapper`:
- `leftRoute={undefined}` (no route - Transactions is the end)
- `rightRoute="/debts"` (swipe right goes to Debts)

---

## Technical Details

### Import Statement (same for all pages)

```typescript
import { SwipeablePageWrapper } from '@/components/SwipeablePageWrapper';
```

### Wrapper Pattern

Each page's outermost `<div>` will be wrapped:

```typescript
// Before
return (
  <div className="space-y-8">
    {/* page content */}
  </div>
);

// After
return (
  <SwipeablePageWrapper leftRoute="/next-page" rightRoute="/prev-page">
    <div className="space-y-8">
      {/* page content */}
    </div>
  </SwipeablePageWrapper>
);
```

---

## User Experience

- **Visual Indicators**: Edge chevrons appear when swiping to show direction
- **Haptic Feedback**: Medium vibration triggers on successful navigation
- **Threshold**: 100px swipe distance required to trigger navigation
- **Edge Resistance**: When at first/last page, swipe has strong resistance (20%)
- **Mobile Only**: Swipe indicators are hidden on desktop (`lg:hidden`)

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Wrap content with SwipeablePageWrapper (leftRoute="/budgets") |
| `src/pages/Budget.tsx` | Wrap content with SwipeablePageWrapper (leftRoute="/debts", rightRoute="/dashboard") |
| `src/pages/DebtSnowball.tsx` | Wrap content with SwipeablePageWrapper (leftRoute="/transactions", rightRoute="/budgets") |
| `src/pages/Transactions.tsx` | Wrap content with SwipeablePageWrapper (rightRoute="/debts") |

---

## Accessibility

- Swipe gestures only activate for horizontal movements (vertical scrolling unaffected)
- Screen reader users can still navigate via bottom navigation tabs
- Touch gestures don't interfere with other interactive elements

