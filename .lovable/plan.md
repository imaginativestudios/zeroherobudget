
# Fix Emergency Fund Card Background

## Problem Identified

After thorough investigation, I found two emergency fund related components:

1. **MoatBuilder.tsx** (active, used on dashboard) - Already has `bg-white dark:bg-card` ✅
2. **HeroMoatCard.tsx** (legacy, appears unused) - Missing white background ❌

The `HeroMoatCard` component at line 70-73 has no explicit background in the default state, and uses a gradient when complete:
```tsx
<Card className={cn(
  "h-full transition-all duration-500",
  isMoatComplete && "ring-2 ring-success/50 bg-gradient-to-br from-success/5 to-transparent"
)}>
```

While this component appears to be unused, it should be fixed for consistency and future maintenance. I'll also verify and update any other dashboard cards that may be missing the explicit white background.

---

## Files to Modify

| File | Issue |
|------|-------|
| `src/components/behavioral/HeroMoatCard.tsx` | Add `bg-white dark:bg-card` to the Card component |
| `src/components/FinancialCard.tsx` | Add `bg-white dark:bg-card` to the Card component |

---

## Changes

### 1. HeroMoatCard.tsx - Add White Background (lines 70-73)

**Before:**
```tsx
<Card className={cn(
  "h-full transition-all duration-500",
  isMoatComplete && "ring-2 ring-success/50 bg-gradient-to-br from-success/5 to-transparent"
)}>
```

**After:**
```tsx
<Card className={cn(
  "h-full transition-all duration-500 bg-white dark:bg-card",
  isMoatComplete && "ring-2 ring-success/50"
)}>
```

This:
- Adds explicit white background for light mode
- Removes the gradient background (for consistency with other cards)
- Maintains the success ring when complete

### 2. FinancialCard.tsx - Add White Background (lines 79-83)

**Before:**
```tsx
<Card className={cn(
  "h-full flex flex-col transition-all duration-300 ease-out",
  to && "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  className
)}>
```

**After:**
```tsx
<Card className={cn(
  "h-full flex flex-col transition-all duration-300 ease-out bg-white dark:bg-card",
  to && "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  className
)}>
```

---

## Summary

These changes ensure all dashboard cards have consistent pure white backgrounds in light mode while maintaining proper dark mode support through the `bg-card` token.
