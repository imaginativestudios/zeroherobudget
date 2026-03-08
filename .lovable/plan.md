

# Plan: AI-Powered "Draft My Budget" Feature

## Overview
Add a "Draft My Budget" button to the dashboard that uses Lovable AI (via edge function) to analyze the user's financial data and suggest budget allocations. Results display in a coach-style sheet/modal with reasoning and one-click approval.

## Architecture

```text
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Dashboard   │────▶│  Edge Function   │────▶│  Lovable AI     │
│  Button +    │     │  draft-budget    │     │  (Gemini Flash) │
│  Coach Modal │◀────│  (tool calling)  │◀────│                 │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

The edge function receives the user's financial snapshot (expenses, debts, transactions, income, subscriptions) and uses Lovable AI with **tool calling** to return structured JSON allocations with reasoning.

## Files to Create

### 1. `supabase/functions/draft-budget/index.ts`
Edge function that:
- Accepts user financial data (income, expenses, debts, recent transactions, subscriptions)
- Builds a system prompt instructing the AI to act as a zero-based budget coach
- Uses tool calling to extract structured output: `{ allocations: [{ expenseId, name, category, suggestedAmount, reasoning }], summary }` 
- Applies rules: bills due soonest get priority, 10% surplus to highest-interest debt, historical averages for variable categories (Groceries, Gas)
- Returns structured allocations + overall reasoning

### 2. `src/lib/budgetDraftEngine.ts`
Client-side utility that:
- Gathers the financial snapshot from hooks data (income, expenses, debts, transactions, subscriptions)
- Computes derived inputs: unassigned balance (income - total planned), upcoming due dates from subscriptions, 3-month spending averages by category from transactions, highest-interest debt info
- Calls the edge function via `supabase.functions.invoke('draft-budget', { body })`
- Returns typed `BudgetDraft` result

### 3. `src/components/dashboard/DraftBudgetSheet.tsx`
A `Sheet` (slide-in sidebar) component styled as a "Supportive Coach":
- Header: friendly coach message — "Hey! I've drafted some jobs for your money based on your goals."
- Allocation list: each item shows category name, suggested amount, and a collapsible reasoning blurb (e.g., "Rent is due in 3 days")
- Variance indicators: shows delta from current planned amount
- Footer: "Apply All" primary button + "Dismiss" secondary
- Loading state with skeleton while AI processes

### 4. Update `supabase/config.toml`
Add `[functions.draft-budget]` with `verify_jwt = false` (manual auth validation in code).

## Files to Edit

### 5. `src/pages/Dashboard.tsx`
- Import `DraftBudgetSheet`
- Add state: `draftBudgetOpen`, `draftResult`, `isDrafting`
- Add "Draft My Budget" button in the welcome section (next to "View Reports")
- Render `DraftBudgetSheet` with apply handler that calls `updateExpense` for each allocation

## Key Logic Details

**Financial Snapshot sent to AI:**
- `income`: monthly income
- `expenses`: array of `{ id, name, category, currentAmount }`
- `debts`: array of `{ name, balance, interestRate, minimumPayment }`
- `upcomingBills`: subscriptions with `next_billing_date` within 14 days
- `categoryAverages`: 3-month average spending per category from transactions
- `unassigned`: income minus total currently planned

**AI Prompt Rules (encoded in edge function):**
1. Allocate fixed bills first (Housing, Utilities, Insurance)
2. Use 3-month historical averages for variable categories (Groceries, Gas, Entertainment)
3. If high-interest debt (>20% APR) exists, allocate 10% of surplus there
4. Prioritize bills due soonest
5. Every dollar must have a job (zero-based)
6. Provide a 1-sentence reasoning per allocation

**One-Click Apply:**
Iterates through allocations and calls `updateExpense(id, { amount: suggestedAmount })` for each existing expense. New categories are added via `addExpense`.

## UI Placement
The "Draft My Budget" button sits in the welcome header section alongside "View Reports", using `variant="outline"` with a sparkles icon to indicate AI.

