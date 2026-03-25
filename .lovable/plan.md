

## Add "Other" Custom Category Option

### What changes

Replace the Radix `<Select>` with a Combobox pattern (using `Popover` + `Command` from the existing shadcn components) for the category field in both the Add and Edit transaction dialogs. This allows users to either pick from their budget categories OR type a custom category.

### Approach

Create a reusable `<CategoryCombobox>` component that:
- Shows a trigger button displaying the current category (like a select)
- Opens a popover with a searchable list (using `Command` from cmdk)
- Groups categories by budget group (same as current)
- Includes an "Other (custom)" option at the bottom
- When the user types text that doesn't match any category, shows a "Use '[typed text]' as category" option
- Calls `onChange(value)` with either a preset or custom category name

### Files changed

1. **`src/components/transactions/CategoryCombobox.tsx`** (new) — Reusable combobox using `Popover` + `Command` components, accepts `value`, `onChange`, `flow`, plus categories/groups from the hook
2. **`src/pages/Transactions.tsx`** — Replace both `<Select>` category fields (Add dialog ~line 483, Edit dialog ~line 754) with `<CategoryCombobox>`

