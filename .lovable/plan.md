

# Mobile Budget UX Redesign

## Problem Analysis

The current budget page uses a strict 5-column grid layout (`grid-cols-[1fr_8rem_8rem_8rem_auto]`) that totals approximately **540px minimum width** before content. On mobile devices (320-414px viewport), this causes:

1. **Horizontal overflow** - Users must scroll sideways to see all columns
2. **Cramped inputs** - Fixed 8rem (128px) columns leave minimal space for the expense name
3. **Hidden actions** - The delete button and category selector get cut off
4. **Poor touch targets** - Dense layout makes tapping difficult

## Design Solution: Responsive Card Layout

Transform the desktop table layout into a mobile-optimized card layout that follows established patterns in this codebase (Accounts, Subscriptions pages).

### Mobile Layout (< 640px)

Each expense item becomes a **vertical card** with:
- Expense name (full width, editable)
- Planned/Actual amounts side-by-side in a 2-column grid
- Category selector (full width)
- Action buttons (visible, touch-friendly)

```text
┌─────────────────────────────────────┐
│ ≡  [Expense Name Input          ]  │
├─────────────────────────────────────┤
│  Planned        │  Actual           │
│  [$125.00    ]  │  $98.45           │
├─────────────────────────────────────┤
│  [Housing              ▼]    [🗑️]  │
└─────────────────────────────────────┘
```

### Desktop Layout (≥ 640px)

Keep the current 5-column grid with minor refinements:
- Use responsive column widths: `grid-cols-[1fr_7rem_7rem_8rem_auto] sm:grid-cols-[1fr_8rem_8rem_8rem_auto]`
- Maintain the strict alignment from the memory

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/budget/ExpenseItemRow.tsx` | Add responsive mobile card layout |
| `src/components/budget/GroupCard.tsx` | Hide desktop headers on mobile, adjust grid |

---

## Detailed Implementation

### 1. ExpenseItemRow.tsx - Responsive Layout

Replace the single grid layout with a dual-mode responsive design:

**Mobile View (< sm):**
- Full-width expense name input with drag handle
- 2-column grid for Planned/Actual amounts
- Full-width category selector with delete button inline

**Desktop View (≥ sm):**
- Keep existing 5-column grid

```text
// Conceptual structure
<div className="block sm:hidden">
  {/* Mobile card layout */}
  <div className="space-y-3 p-3 border rounded-lg">
    <div className="flex items-center gap-2">
      <GripVertical />
      <Input value={expense.name} />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label>Planned</label>
        <Input value={expense.planned} />
      </div>
      <div>
        <label>Actual</label>
        <div>{formatCurrency(actual)}</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Select className="flex-1" />
      <Button onClick={delete} />
    </div>
  </div>
</div>

<div className="hidden sm:grid grid-cols-[...]">
  {/* Desktop row layout - keep existing */}
</div>
```

### 2. GroupCard.tsx - Hide Desktop Headers on Mobile

The 5-column header row only makes sense on desktop. On mobile, each card is self-documenting with labels.

```text
// Line 226-231: Add responsive visibility
<div className="hidden sm:grid grid-cols-[1fr_8rem_8rem_8rem_auto] gap-4 border-b pb-3 mb-2">
  <div className="text-left font-semibold">Item</div>
  <div className="text-left font-semibold">Planned</div>
  <div className="text-left font-semibold">Actual</div>
  <div className="text-left font-semibold">Category</div>
  <div className="text-center font-semibold">Actions</div>
</div>
```

---

## Mobile Card Design Specifications

### Touch Targets
- All interactive elements: **min-h-[44px]** (WCAG 2.1 AAA)
- Buttons: **min-w-[44px]** with centered icons
- Inputs: Full width within their container

### Visual Hierarchy
- Expense name: Primary focus, larger input
- Amounts: Secondary, side-by-side for easy comparison
- Category/Actions: Tertiary, bottom of card

### Spacing
- Card padding: `p-3` (12px)
- Between fields: `gap-3` (12px)
- Between cards: `space-y-3` (12px) via parent

### Labels
- Add subtle labels above Planned/Actual on mobile
- Use `text-xs text-muted-foreground` for labels

---

## Accessibility Considerations

1. **Drag handles**: Keep visible and accessible for reordering
2. **Form labels**: Add explicit labels for screen readers (sr-only on desktop)
3. **Touch spacing**: No cramped tap targets
4. **Color contrast**: Maintain existing accessible color scheme

---

## Summary of Changes

### ExpenseItemRow.tsx

| Section | Change |
|---------|--------|
| Lines 67-129 | Wrap existing grid in `hidden sm:grid`, add mobile card layout with `block sm:hidden` |
| Mobile card | Stack: Name row → Planned/Actual grid → Category/Delete row |
| Touch targets | Ensure 44px minimum on all interactive elements |

### GroupCard.tsx

| Section | Change |
|---------|--------|
| Line 226 | Add `hidden sm:grid` to header row |
| Line 224 | Keep `overflow-x-auto` as fallback for edge cases |

---

## Visual Comparison

### Before (Mobile)
```text
[Item][Planned][Actual][Cat...  ← Cut off, requires scroll
```

### After (Mobile)
```text
┌────────────────────────────┐
│ ≡ [Expense Name         ]  │
├────────────────────────────┤
│ Planned     │ Actual       │
│ [$125.00  ] │ $98.45       │
├────────────────────────────┤
│ [Housing         ▼]   [🗑️] │
└────────────────────────────┘
```

---

## Technical Notes

- Uses existing `useIsMobile` or Tailwind responsive classes
- No new dependencies required
- Follows established mobile patterns from Accounts/Subscriptions pages
- Maintains drag-and-drop functionality via dnd-kit (handles work in both layouts)
- Preserves all existing functionality - just restructures the visual layout

