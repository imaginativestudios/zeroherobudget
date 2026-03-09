

# Add Link and Arrow to "Start Your Emergency Fund" Checklist Item

## What changes

### `src/components/dashboard/GettingStartedChecklist.tsx`

1. **Add `href` to the moat task** (line 104): Add `href: '/wealth'` (the Wealth page is the closest existing destination for emergency fund management — alternatively could scroll to the EmergencyFundCard on the dashboard).

```ts
// Line 99-105: Add href
{ 
  id: 'moat', 
  title: 'Start your emergency fund', 
  description: 'Build your financial safety net',
  icon: Heart,
  isComplete: moatCurrent > 0,
  href: '/wealth'   // ← add this
},
```

That's it. The `TaskItem` component already renders an `ArrowUpRight` icon and wraps the item in a `<Link>` when `href` is present and the task is incomplete (lines 299–310). No other changes needed.

## Technical note
The `ArrowUpRight` (angled arrow) icon is already imported and used by the existing `TaskItem` component for all incomplete tasks that have an `href`. Adding the property is the only change required.

