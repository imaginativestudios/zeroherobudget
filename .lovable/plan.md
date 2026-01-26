

# Optimize Budget Page Mobile UX and Fix Dropdown Framing

## Summary

This plan addresses two main issues on the Budget page mobile experience:
1. **Space Optimization**: Reduce padding, consolidate header controls, and streamline mobile card layouts
2. **Dropdown Framing Fix**: Add `collisionPadding` to Select components to prevent dropdowns from going off-screen when scrolled

---

## Problem Analysis

### Current Mobile UX Issues:
- Header section uses excessive padding (`pt-8`, `p-6`) that wastes vertical space
- Compare and Actions sections are stacked with extra borders/backgrounds consuming space
- Card padding (`p-6`) is generous for desktop but excessive on mobile
- Assets table uses a traditional table layout that doesn't optimize for mobile

### Dropdown Framing Issue:
- The `SelectContent` component in `src/components/ui/select.tsx` uses Radix's `position="popper"` which should auto-flip
- However, without `collisionPadding`, dropdowns can still clip viewport edges when the trigger is near screen boundaries
- This is especially problematic when users scroll the page and then tap a category dropdown

---

## Implementation Plan

### 1. Fix Dropdown Viewport Collision (Global Fix)

**File:** `src/components/ui/select.tsx`

Add `collisionPadding` to `SelectContent` to ensure dropdowns maintain spacing from viewport edges:

```tsx
<SelectPrimitive.Content
  ref={ref}
  collisionPadding={16}  // Add 16px collision padding from viewport edges
  // ... existing props
>
```

This single change fixes the dropdown framing issue across the entire application.

---

### 2. Optimize Budget Page Header

**File:** `src/pages/Budget.tsx`

Reduce header padding and consolidate controls:

| Area | Current | Proposed |
|------|---------|----------|
| Top padding | `pt-8` | `pt-4 sm:pt-8` |
| Card padding | `p-6` | `p-4 sm:p-6` |
| Header gap | `gap-4` | `gap-3` |
| Compare/Actions | Two separate bordered boxes | Single compact row on mobile |

**Header Changes:**
- Reduce `pt-8` to `pt-4 sm:pt-8` for mobile
- Combine Compare and Actions into a single flex row on mobile
- Remove redundant borders/backgrounds on mobile

---

### 3. Optimize Income Section

**File:** `src/pages/Budget.tsx`

Make the income card more compact on mobile:

- Reduce `CardHeader` padding: `p-6` to `p-4 sm:p-6`
- Reduce `CardContent` padding: `p-6` to `p-4 sm:p-6`
- Make the entire section more compact by using smaller title text on mobile

---

### 4. Optimize Budget Overview Card

**File:** `src/components/budget/BudgetOverviewCard.tsx`

- Reduce `CardHeader` padding to `p-4 sm:p-6`
- Reduce `CardContent` padding to `p-4 sm:p-6`
- Reduce summary card grid padding from `p-4` to `p-3 sm:p-4`
- Use smaller text sizes on mobile for metric values

---

### 5. Optimize GroupCard and Expense Rows

**File:** `src/components/budget/GroupCard.tsx`

- Reduce accordion trigger padding on mobile
- Make group header more compact

**File:** `src/components/budget/ExpenseItemRow.tsx`

- Reduce mobile card padding from `p-3` to `p-2`
- Reduce row spacing from `space-y-3` to `space-y-2`

---

### 6. Optimize Assets Table for Mobile

**File:** `src/pages/Budget.tsx`

Replace the table layout with a responsive card-based approach on mobile:

```text
Mobile (stacked card):
+------------------------+
| Asset: [Input field]   |
| Value: [Input field]   |
| [Delete button]        |
+------------------------+

Desktop (table row):
| Asset Input | Value Input | Delete |
```

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/ui/select.tsx` | Add `collisionPadding={16}` to SelectContent |
| `src/pages/Budget.tsx` | Reduce padding, optimize header, optimize assets section |
| `src/components/budget/BudgetOverviewCard.tsx` | Reduce padding on mobile |
| `src/components/budget/GroupCard.tsx` | Reduce accordion padding |
| `src/components/budget/ExpenseItemRow.tsx` | Reduce mobile card padding and spacing |

### Key CSS Pattern for Mobile Optimization

Use responsive padding throughout:
```tsx
// Before
className="p-6"

// After
className="p-4 sm:p-6"
```

### Dropdown Fix Implementation

```tsx
// In SelectContent component
<SelectPrimitive.Content
  ref={ref}
  collisionPadding={16}
  className={cn(/* existing classes */)}
  position={position}
  {...props}
>
```

---

## Expected Results

### Space Savings (Mobile)

| Section | Current Height | Estimated New Height |
|---------|---------------|---------------------|
| Header | ~120px | ~80px |
| Income Card | ~100px | ~80px |
| Overview Card | ~380px | ~320px |
| Each Expense Row | ~140px | ~120px |

**Total estimated vertical space savings: ~15-20%**

### Dropdown Behavior

- Dropdowns will now maintain 16px padding from all viewport edges
- When a dropdown would normally extend past the viewport, it will automatically flip or shift to stay visible
- This works regardless of scroll position

---

## Accessibility Considerations

- All touch targets remain at 44px minimum (WCAG 2.1 AAA compliant)
- Dropdown collision padding improves usability for users with motor impairments
- Reduced padding maintains readable text sizes (no font size changes)

