

## Polish the Transaction Modal & Category Combobox

### Overview
Elevate both the "Add Transaction" and "Edit Transaction" dialogs with better visual hierarchy, spacing, and a more refined category combobox with group icons and colored accents.

### Changes

**1. `src/components/transactions/CategoryCombobox.tsx`** — Visual upgrade
- Add group icons next to group headings (import the same `ICON_MAP` pattern from `defaultBudgetCategories.ts` and render a small icon before each group name)
- Add a colored dot or subtle left-border accent per group using the group's `color` from the registry
- Style the trigger button with a subtle inner shadow (`shadow-sm`) and better selected-state styling (show the category name in medium weight with a subtle colored badge)
- Improve the custom option styling: add a `Plus` icon and a dashed border card-style instead of plain text
- Accept `groups` (with icon/color data) as a prop alongside `groupedCategories` so color/icon info is available
- Add `max-h-[280px]` to CommandList for consistent dropdown height
- Slightly increase padding on CommandItems for better touch targets (py-2 instead of py-1.5)

**2. `src/pages/Transactions.tsx`** — Modal layout polish (both Add and Edit dialogs)
- Add a subtle description under the DialogTitle: `<DialogDescription>Record your income or expense</DialogDescription>`
- Add visual section separators: group "Date + Amount" and "Account + Type" into light bordered sections with subtle bg (`bg-muted/30 rounded-lg p-4`) for visual grouping
- Style the submit button with `variant="royal"` instead of default, matching the "Add Transaction" trigger button
- Add a subtle divider before the Notes field
- Pass the `groups` array (from `useCategories`) into `CategoryCombobox` so it can render icons/colors

### Files changed
1. `src/components/transactions/CategoryCombobox.tsx` — Enhanced visuals with group icons, colors, better custom option
2. `src/pages/Transactions.tsx` — Polished dialog layout with visual grouping, better hierarchy

