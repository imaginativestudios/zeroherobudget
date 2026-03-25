

## Fix Category Combobox Search Bar & Selection Styling

### Problem
The search bar in the category combobox has a prominent teal focus ring border that looks out of place, and the selected/hovered item uses a harsh orange accent highlight (visible on "Rent / Mortgage" in the screenshot).

### Changes

**1. `src/components/transactions/CategoryCombobox.tsx`**
- Add `focus-within:ring-0 focus-within:ring-offset-0` or override focus styles on the `CommandInput` wrapper to remove the thick teal border
- Override the popover content styling to suppress the outer focus ring on the Command container

**2. `src/components/ui/command.tsx`** (if needed)
- Ensure the `CommandInput` wrapper (`div.flex.items-center.border-b`) does not inherit global focus-ring styles — add `[&_input]:ring-0 [&_input]:focus-visible:ring-0` to suppress it
- Consider softening the `CommandItem` selected state from `bg-accent` to a subtler `bg-muted` or `bg-primary/10` so the hover/selected highlight is less jarring

### Files changed
1. `src/components/ui/command.tsx` — Suppress focus ring on CommandInput, soften selected item highlight
2. `src/components/transactions/CategoryCombobox.tsx` — Minor class overrides if global fix isn't sufficient

