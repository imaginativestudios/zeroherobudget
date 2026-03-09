

# Remove Pre-filled Amounts from Budget Setup Wizard

## Change
Set all `suggestedAmount` values in `src/lib/defaultBudgetCategories.ts` to `0` so the wizard presents categories with blank/zero amounts, letting users enter their own numbers.

## File
`src/lib/defaultBudgetCategories.ts` — change every `suggestedAmount: <number>` to `suggestedAmount: 0`.

