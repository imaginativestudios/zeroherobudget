

# Standardize Vertical Card Spacing Across All Pages

## Audit Findings

The top-level `space-y-*` values between cards/sections vary significantly across pages:

| Page | Current spacing | Notes |
|------|----------------|-------|
| Dashboard | `space-y-12 lg:space-y-16` | Very large |
| Budget | `space-y-6` | Standard |
| DebtSnowball | `space-y-8` | Medium |
| Transactions | `space-y-8` | Medium |
| Accounts | `space-y-6` | Standard |
| Reports | `space-y-8` | Medium |
| Wealth | `space-y-6` | Standard |
| Journey | `space-y-6 sm:space-y-8` | Responsive |
| Subscriptions | `space-y-6` | Standard — but has leftover `pt-8` |
| Achievements | `space-y-8` | Medium |
| FinancialTips | `space-y-6` | Standard |
| Household | `space-y-6` | Standard |
| DataManagement | `space-y-8` | Medium — also has inner `pt-8` |
| AccountSettings | `space-y-8` | Medium — also has `pt-8` |

Three values in play: `space-y-6` (24px), `space-y-8` (32px), `space-y-12/16` (48-64px).

## Recommendation

Standardize to **`space-y-6`** for all pages — it's the most common value and provides comfortable rhythm without excessive gaps. The Dashboard is the only exception that may warrant slightly larger section spacing (`space-y-8`) given its distinct 3-zone layout with section headers.

## Changes

1. **Dashboard.tsx** — Change `space-y-12 lg:space-y-16` to `space-y-6 lg:space-y-8` (still slightly roomier for its sectioned layout)
2. **DebtSnowball.tsx** — Change `space-y-8` to `space-y-6`
3. **Transactions.tsx** — Change `space-y-8` to `space-y-6`
4. **Reports.tsx** — Change `space-y-8` to `space-y-6`
5. **Achievements.tsx** — Change `space-y-8` to `space-y-6`
6. **DataManagement.tsx** — Change `space-y-8` to `space-y-6`, remove inner `pt-8`
7. **AccountSettings.tsx** — Change `space-y-8` to `space-y-6`, remove `pt-8`
8. **Subscriptions.tsx** — Remove leftover `pt-8` (spacing is already `space-y-6`)

Pages already at `space-y-6` (Budget, Accounts, Wealth, FinancialTips, Household, Journey) need no changes.

