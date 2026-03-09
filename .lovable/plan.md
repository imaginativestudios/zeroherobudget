

# Add "Build Wealth" Step to Getting Started Checklist

## What changes

### `src/components/dashboard/GettingStartedChecklist.tsx`

Add a new checklist task between "Start your emergency fund" and "Record a transaction":

```ts
{
  id: 'wealth',
  title: 'Explore high-yield savings',
  description: 'Make your money work harder for you',
  icon: Landmark,  // matches Journey step icon
  isComplete: /* check for savings/HYSA account with balance > 0 */,
  href: '/wealth'
}
```

- Import `Landmark` from lucide-react
- Completion logic: reuse the same check from the Journey step — `accounts.some(a => type includes 'savings' or 'hysa') with balance > 0`
- The existing `TaskItem` component already handles the arrow icon and link rendering automatically

This adds one new item to the checklist grid, bringing it to 8 tasks total. No other files need changes.

