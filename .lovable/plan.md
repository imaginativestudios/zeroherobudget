

# Fix Budget Page Income Section Mobile Overflow

## Problem

The Income Section has a horizontal layout with three elements that overflow on mobile:
1. Label: "Income Amount:"
2. Input field with raw number value
3. Formatted currency display (`$5,000.00`)

This creates unnecessary redundancy and causes the content to extend beyond the viewport on smaller screens.

## Solution

Remove the redundant formatted currency display and use the `CurrencyInput` component instead of a plain `Input`. This provides:
- A `$` prefix for context (so users know it's currency)
- Proper decimal formatting
- Mobile-optimized keyboard (`inputMode="decimal"`)
- Single source of truth for the value

## Changes

### File: `src/pages/Budget.tsx`

**Current code (lines 251-266):**
```tsx
<CardContent className="p-6 pt-0">
  <div className="flex items-center gap-4">
    <label htmlFor="income-amount" className="text-muted-foreground font-medium">Income Amount:</label>
    <Input 
      id="income-amount"
      type="number" 
      step="0.01" 
      value={income} 
      onChange={e => setIncome(parseFloat(e.target.value) || 0)} 
      className="w-48"
      aria-describedby="income-display"
    />
    <span id="income-display" className="text-2xl font-bold text-primary" aria-live="polite">
      {formatCurrency(income)}
    </span>
  </div>
</CardContent>
```

**Updated code:**
```tsx
<CardContent className="p-6 pt-0">
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
    <label htmlFor="income-amount" className="text-muted-foreground font-medium whitespace-nowrap">
      Income Amount:
    </label>
    <CurrencyInput 
      id="income-amount"
      value={income} 
      onChange={setIncome} 
      className="w-full sm:w-48"
    />
  </div>
</CardContent>
```

**Additional change:** Add `CurrencyInput` to the imports at the top of the file.

## Benefits

| Before | After |
|--------|-------|
| Redundant display of income value | Single input with $ prefix |
| Fixed horizontal layout overflows | Responsive stacked layout on mobile |
| Plain number input | Currency-formatted input with decimal keyboard |
| 3 elements in a row | 2 elements, stacking on mobile |

## Visual Result

**Mobile (stacked):**
```
Income Amount:
[$     5,000.00]
```

**Desktop (inline):**
```
Income Amount: [$     5,000.00]
```

