

# Add IntelFeed Section to Dashboard Layout

## What
Render the `IntelFeed` component (Surplus Power, Shadow Budget, Freedom Timeline) in the Dashboard JSX. It's already imported at line 57 and the dashboard state already computes the visibility flags (`canShowShadowBudget`, `unlockedCards`).

## Where
Insert it after the Emergency Fund / Behavioral Hints grid (line 492) and before the QuickAddDebtDialog (line 494). This places the financial insights between the action-oriented cards and the analytics section — a natural progressive disclosure step.

## Implementation

**Single edit to `src/pages/Dashboard.tsx`** — add ~20 lines after line 492:

```tsx
{/* Financial Insights - Surplus Power, Shadow Budget, Freedom Timeline */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.2 }}
>
  <IntelFeed
    canShowShadowBudget={dashboardState.canShowShadowBudget}
    canShowFreedom={debtItems.length > 0}
    debts={debtItems}
    extraBudget={leftover}
    strategy={dashboardState.strategy}
  />
</motion.div>
```

All props are already computed in the Dashboard component — no new state or hooks needed.

