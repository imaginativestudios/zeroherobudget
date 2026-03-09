

# Suggest Budget Categories from Spending Patterns

## Problem
Users may start with default categories but over time their transaction history reveals spending patterns that don't map to any existing budget category (e.g., recurring "Pet Supplies" transactions with no Pet category).

## Approach
Create a detection engine that analyzes the user's transaction history, finds categories with significant spending that aren't yet in their budget, and surfaces an inline suggestion card on the Budget page.

## Changes

### 1. New file: `src/lib/categorySuggestionEngine.ts`
- Compare transaction categories (from `category` field on transactions) against existing expense categories
- Identify categories where:
  - There are 2+ transactions in the last 90 days
  - The category doesn't match any existing budget expense category (case-insensitive)
  - Total spend exceeds a minimum threshold (e.g., $20)
- Return suggested categories with: name, transaction count, total amount, and average monthly spend
- Pure utility function, no hooks or side effects

### 2. New component: `src/components/budget/CategorySuggestionBanner.tsx`
- Accepts: existing expenses, transactions, and an `onAddCategory` callback
- Runs the detection engine on render
- If suggestions exist, renders a subtle card below the budget header with:
  - Icon + heading: "We noticed spending that isn't in your budget"
  - List of suggested categories as chips/badges showing name + monthly average
  - "Add" button per suggestion → calls `onAddCategory(name, avgAmount, category)`
  - "Dismiss" button per suggestion → stores dismissal in localStorage so it doesn't reappear
- If no suggestions or all dismissed, renders nothing

### 3. Update: `src/pages/Budget.tsx`
- Import `CategorySuggestionBanner`
- Place it between the budget overview card and the expense groups section
- Wire `onAddCategory` to call `addSupabaseExpense` with the suggested name, average amount, and category
- Pass current expenses and transactions as props

### 4. Dismissal persistence
- Use `useUserLocalStorage` to store an array of dismissed category names
- Dismissed suggestions won't resurface unless the user clears preferences

## Scope
- 2 new files, 1 file modified
- No database changes needed — uses existing transaction and expense data from localStorage
- No new dependencies

