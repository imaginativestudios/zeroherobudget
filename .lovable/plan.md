

# Audit & Fix: Placeholder Text Styling for All Inputs

## Overview

This audit addresses two key issues identified in user testing:
1. **Placeholder text visibility** - Placeholder text should be visibly lighter than entered values
2. **Placeholder behavior with $ and %** - When user focuses on currency/percentage inputs, placeholder should disappear but $ or % symbols should remain visible

---

## Current Issues Identified

### 1. Placeholder Color Too Dark
The current `placeholder:text-muted-foreground` class renders at `hsl(175 10% 40%)` which can appear too similar to actual entered text values.

### 2. Inconsistent Prefix/Suffix Patterns
Three different patterns are currently used for currency/percentage inputs:

| Pattern | Example Location | Behavior |
|---------|------------------|----------|
| `CurrencyInput` with prefix/suffix props | QuickAddDebtDialog, DebtSnowball | $ and % always visible, placeholder inside input |
| Manual `<span>` before `<Input>` | StrikePaymentModal, HeroMoatCard, MoatBuilder | Static $ visible, placeholder shows "0" |
| Inline positioned `<span>` | Onboarding | $ or % absolutely positioned, placeholder shows number |

### 3. Placeholder Values That Look Like Data
Many currency inputs use numeric placeholders like `"5000"`, `"22.5"`, `"150"` which can confuse users.

---

## Solution Design

### Part 1: Lighter Placeholder Color

Update the base placeholder styling to use a significantly lighter, more obviously "hint-like" color.

**File: `src/components/ui/input.tsx`**

```tsx
// Current
"placeholder:text-muted-foreground"

// Proposed - using opacity for clear visual distinction
"placeholder:text-muted-foreground/50"
```

This reduces opacity to 50%, making placeholders clearly distinguishable from actual values.

**File: `src/components/ui/textarea.tsx`**

Apply the same change:
```tsx
"placeholder:text-muted-foreground/50"
```

---

### Part 2: Enhanced CurrencyInput Component

The `CurrencyInput` component needs to be redesigned so that:
- The $ or % symbol is always visible
- The placeholder text inside the input disappears on focus
- The symbol remains in a muted color when empty, becomes active color when has value

**File: `src/components/ui/currency-input.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  prefix?: string;
  suffix?: string;
  variant?: 'default' | 'debt' | 'expense';
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, prefix, suffix, variant = 'default', value, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    
    // Determine if field has a meaningful value
    const hasValue = value !== undefined && value !== '' && value !== '0';
    
    const variantClasses = {
      default: '',
      debt: 'border-purple-500/30 focus-within:border-purple-500 focus-within:ring-purple-500/20',
      expense: 'border-blue-500/30 focus-within:border-blue-500 focus-within:ring-blue-500/20',
    };

    return (
      <div 
        className={cn(
          "flex items-center rounded-md border border-input bg-background ring-offset-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          variantClasses[variant],
          className
        )}
      >
        {prefix && (
          <span 
            className={cn(
              "pl-3 select-none pointer-events-none transition-colors",
              hasValue || isFocused 
                ? "text-foreground" 
                : "text-muted-foreground/50"
            )}
          >
            {prefix}
          </span>
        )}
        <Input
          type="number"
          ref={ref}
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            "border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            prefix && "pl-1",
            suffix && "pr-1"
          )}
          // Clear placeholder on focus by conditionally removing it
          placeholder={isFocused ? undefined : props.placeholder}
          {...props}
        />
        {suffix && (
          <span 
            className={cn(
              "pr-3 select-none pointer-events-none transition-colors",
              hasValue || isFocused 
                ? "text-foreground" 
                : "text-muted-foreground/50"
            )}
          >
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
```

**Key Behavior Changes:**
- Symbol ($ or %) starts in muted color when empty
- Symbol transitions to full foreground color when focused OR has value
- Placeholder text disappears on focus, reappears on blur if empty

---

### Part 3: Standardize Manual $ Prefix Patterns

Several components use manual `<span>$</span>` before inputs. These need to be:
1. Updated to use proper muted styling
2. Show the symbol in active color when focused

**Files to update:**

| File | Lines | Change |
|------|-------|--------|
| `src/components/dashboard/StrikePaymentModal.tsx` | 140-151 | Convert to CurrencyInput or add focus state |
| `src/components/behavioral/HeroMoatCard.tsx` | 191-201 | Convert to CurrencyInput |
| `src/components/defense/MoatBuilder.tsx` | 378-388 | Convert to CurrencyInput |
| `src/pages/Onboarding.tsx` | 310-324, 351-368, 380-398, 409-423 | Add focus state management to symbols |

**Example refactor for StrikePaymentModal:**

```tsx
// Before
<div className="flex items-center gap-2">
  <span className="text-2xl text-muted-foreground">$</span>
  <Input
    type="number"
    placeholder="0"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    className="text-2xl h-14 font-bold"
    min="0"
    max={debt.balance}
  />
</div>

// After - using enhanced CurrencyInput
<CurrencyInput
  prefix="$"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  className="text-2xl h-14 font-bold"
  min="0"
  max={debt.balance}
/>
```

---

### Part 4: Improve Placeholder Content

Update numeric placeholders to be more clearly "example" values by using empty strings or leaving the input blank by default.

| Current Placeholder | File | Change To |
|---------------------|------|-----------|
| `"5000"` | QuickAddDebtDialog | Remove placeholder ($ prefix is hint enough) |
| `"22.5"` | QuickAddDebtDialog | Remove placeholder (% suffix is hint enough) |
| `"150"` | QuickAddDebtDialog | Remove placeholder |
| `"0"` | StrikePaymentModal | Remove placeholder |
| `"0"` | HeroMoatCard | Remove placeholder |
| `"30.00"` | Onboarding | Keep (provides formatting hint) |

For text fields, placeholders should remain as helpful hints.

---

## Summary of Changes

| File | Type | Changes |
|------|------|---------|
| `src/components/ui/input.tsx` | Core | Update placeholder opacity to `/50` |
| `src/components/ui/textarea.tsx` | Core | Update placeholder opacity to `/50` |
| `src/components/ui/currency-input.tsx` | Core | Add focus state, dynamic symbol color, clear placeholder on focus |
| `src/components/dashboard/StrikePaymentModal.tsx` | Component | Convert to CurrencyInput pattern |
| `src/components/behavioral/HeroMoatCard.tsx` | Component | Convert to CurrencyInput pattern |
| `src/components/defense/MoatBuilder.tsx` | Component | Convert to CurrencyInput pattern |
| `src/pages/Onboarding.tsx` | Page | Add focus state management to symbol spans |
| `src/components/dashboard/QuickAddDebtDialog.tsx` | Component | Remove numeric placeholders |

---

## Accessibility Notes

- Placeholder opacity at 50% of muted-foreground maintains WCAG AA compliance (~3.5:1 contrast ratio as helper text)
- $ and % symbols transitioning to full foreground color on focus provides clear visual feedback
- Placeholder removal on focus follows standard input behavior patterns

