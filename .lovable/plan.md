# Remove purposeless lines from dashboard cards

Applies the divider rule: spacing and cards group content; lines stay only between repeated rows or above a real total.

## Remove (replace with spacing)
- **Debts card**: line above "Add Debt / View Strategy". Buttons get extra top space instead.
- **Budget card**: line between the budget items and "Available for Debt". The tinted "Available for Debt" box already stands apart.
- **Payoff Strategy card**:
  - line between "Total Debt" and "Debt-Free By" (two labels in one summary box)
  - line between the summary and the "What-If" simulator; use larger section spacing instead
- **No-debts screen**: line above "Once you add debts, you'll unlock:"; use spacing instead.

## Keep
- Thin lines above "Total You'll Pay" and "Total Paid" in Payoff Strategy. They mark a sum, the way a receipt does.
- Lines between repeated rows such as transactions, debts and accounts.
- The single footer line.

## Check
Dashboard with demo data and with no debts, at 375px and 1280px in light and dark mode. Confirm no card looks cramped where a line was removed. Change nothing else.

## Technical details
- `src/components/dashboard/CommandCenter.tsx`: remove the `<Separator>` at about lines 166 and 285, and adjust the parent's vertical spacing (e.g. `mt-4` on the following block).
- `src/components/dashboard/PayoffStrategyCard.tsx`: remove the `<Separator>` at about lines 152 and 187, and keep spacing through `space-y`/`mt-*`.
- `src/components/dashboard/InitializeMissionCard.tsx`: remove `border-t border-border` and `pt-6` from the unlock block. Keep `mt-8`.
