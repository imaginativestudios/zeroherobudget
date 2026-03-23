

## Add Balance Display to Linked Account Cards

### Change

In `src/components/linked-accounts/LinkedAccountCard.tsx`, display the `account.balance` value (when available) as a formatted currency amount between the account name/mask and the "Linked X ago" timestamp.

### Details

- Format using `Intl.NumberFormat` with USD currency
- Show balance in a slightly larger/bolder style than the metadata text
- Handle `null`/`undefined` balance gracefully (don't render anything)
- Credit/loan accounts with negative balances show in red (`text-destructive`)

### Files changed
1. **`src/components/linked-accounts/LinkedAccountCard.tsx`** — add formatted balance line after `maskedAccountName`, conditionally rendered when `balance` is not null/undefined

