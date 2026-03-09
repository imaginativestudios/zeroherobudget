

# Standardize Top Padding Across All Pages (Desktop)

## Problem

Page top spacing is inconsistent on desktop. The Layout component provides `lg:p-8` (32px all around), but individual pages handle their own top padding differently:

- **Have `pt-8` (extra 32px):** Budget, Debt, Transactions, Accounts, Reports, Achievements, Financial Tips, Household
- **Have no extra top padding:** Dashboard, Journey, Wealth, Data Management

This creates a noticeable visual inconsistency — some pages sit 64px from the top, others 32px.

## Solution

Remove all per-page `pt-*` top padding and instead apply a consistent top spacing in the Layout's main content area. This way every page gets the same vertical start position without relying on each page to self-manage.

### Layout change (`src/components/Layout.tsx`)

Update the `<main>` padding from `p-2 sm:p-4 lg:p-8` to `p-2 sm:p-4 lg:p-8 lg:pt-10` — giving 40px top on desktop (comfortable breathing room without being excessive).

### Per-page cleanup (remove redundant `pt-*`)

1. **Budget.tsx** — remove `pt-4 sm:pt-8` from inner header div
2. **DebtSnowball.tsx** — remove `pt-8` from inner header div
3. **Transactions.tsx** — remove `pt-8` from inner header div
4. **Accounts.tsx** — remove `pt-8` from outer div
5. **Reports.tsx** — remove `pt-8` from outer div
6. **Achievements.tsx** — remove `pt-8` from inner header div (keep `container py-6`)
7. **FinancialTips.tsx** — remove `pt-8` from outer div
8. **Household.tsx** — remove `pt-8` from outer div

Pages without extra padding (Dashboard, Journey, Wealth, Data Management) need no changes — they'll inherit the consistent Layout spacing.

**Result:** Every page starts at the same vertical position on desktop, controlled by one place (Layout).

