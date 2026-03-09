

# Auto-Generate Default Budget Categories

## Problem
New users land on the Budget page with zero categories and zero expenses. They must manually create every group and item from scratch, which is friction-heavy and discouraging.

## Solution
Add a **Budget Setup** flow that appears when a user has no expenses. It presents the default categories grouped by type, lets users toggle/edit/reorder them, then seeds their budget with the selected items.

## Architecture

### 1. Default category data — `src/lib/defaultBudgetCategories.ts`

A structured array of category groups, each with a Lucide icon name and child items with suggested amounts:

```text
Housing        → Rent/Mortgage ($1,500), Property Taxes ($200), Home Insurance ($125)
Utilities      → Internet ($75)
Transportation → Car Payment ($400), Gas/Fuel ($150), Car Insurance ($130), Maintenance ($75), Public Transit ($0)
Food           → Groceries ($600), Restaurants/Takeout ($200), Coffee/Snacks ($50)
Health         → Health Insurance ($350), Medical/Doctor ($50), Pharmacy ($25)
Lifestyle      → Shopping ($100), Entertainment ($75), Hobbies ($50), Subscriptions ($50)
Financial      → Savings ($200), Investments ($100), Debt Payments ($0), Emergency Fund ($200)
Family/Personal→ Childcare ($0), Education ($0), Pets ($50), Personal Care ($40)
Other          → Gifts/Donations ($50), Travel ($75), Miscellaneous ($50)
```

Each group has an icon key (e.g. `Home`, `Zap`, `Car`, `UtensilsCrossed`, `Heart`, `Sparkles`, `PiggyBank`, `Users`, `MoreHorizontal`).

### 2. Budget Setup component — `src/components/budget/BudgetSetupWizard.tsx`

Single-screen card (not a multi-step wizard) shown when `expenses.length === 0`:

- **Header**: "Set Up Your Budget" with subtitle
- **Category groups**: Accordion-style, each group header shows icon + name + toggle-all checkbox
- **Category items**: Each row has a checkbox (on/off), name (editable inline), and suggested amount (editable)
- **Actions**: "Start with Selected" primary button, "Start from Scratch" ghost link
- Clicking "Start with Selected" calls `addExpense()` for each enabled item with its category and amount

### 3. Integration into Budget page — `src/pages/Budget.tsx`

Conditional render: if `expenses.length === 0 && !isLoadingExpenses`, show `<BudgetSetupWizard>` instead of the normal budget content. Once the user seeds categories, the normal GroupableExpenses UI takes over. All existing editing, reordering, renaming, and deletion features already work.

### 4. Icon mapping utility

A small map from group name → Lucide icon component for use in the setup wizard and optionally in GroupCard headers later.

## Edge cases handled
- **User deletes all categories**: Setup wizard reappears (expenses.length === 0 check)
- **Duplicate names**: Validate before seeding; skip duplicates
- **Category reordering**: Handled by existing `useExpenseGroups` drag-and-drop
- **Zero-amount items**: Allowed — user can fill in amounts later

## Files to create/modify
1. **Create** `src/lib/defaultBudgetCategories.ts` — data + icon map
2. **Create** `src/components/budget/BudgetSetupWizard.tsx` — setup UI
3. **Modify** `src/pages/Budget.tsx` — conditional render of setup vs normal budget

## What stays the same
- `useLocalExpenses`, `useExpenseGroups`, `GroupCard`, `ExpenseItemRow` — no changes needed
- Onboarding flow — unchanged; budget setup is a separate concern
- Demo mode — demo users already get `DEMO_EXPENSES` seeded

