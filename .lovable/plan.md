
# Budget Page Column Alignment & Cleanup

## Overview

Fix two issues on the Budget page:
1. **Column header misalignment** - The column headers in the Monthly Budget section don't line up with the line items
2. **Remove category cards** - Remove the individual category cards under Budget Inventory, keeping only the 4 summary statistics cards

---

## Issue 1: Column Header Alignment

### Root Cause

The header and row use the same grid template (`grid-cols-[1fr_auto_auto_auto]`), but the "Actions" column in the rows contains **two elements** (category Select + Delete button), while the header only shows one label "Actions".

**Current Header:** Item | Planned | Actual | Actions
**Current Row:** Name Input | Planned Input | Actual Display | [Category Select + Delete Button]

The header should account for the category selector as its own column.

### Solution

Update the grid to 5 columns and add a "Category" header between "Actual" and "Actions":

**New Header:** Item | Planned | Actual | Category | Actions
**New Row:** Name Input | Planned Input | Actual Display | Category Select | Delete Button

---

## Technical Changes

### File: `src/components/budget/GroupCard.tsx`

**Line 226:** Update grid template from 4 to 5 columns and add Category header

```tsx
// Before
<div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b pb-3 mb-2">
  <div className="text-left font-semibold">Item</div>
  <div className="text-left font-semibold">Planned</div>
  <div className="text-left font-semibold">Actual</div>
  <div className="text-center font-semibold">Actions</div>
</div>

// After
<div className="grid grid-cols-[1fr_8rem_8rem_8rem_auto] gap-4 border-b pb-3 mb-2">
  <div className="text-left font-semibold">Item</div>
  <div className="text-left font-semibold">Planned</div>
  <div className="text-left font-semibold">Actual</div>
  <div className="text-left font-semibold">Category</div>
  <div className="text-center font-semibold">Actions</div>
</div>
```

### File: `src/components/budget/ExpenseItemRow.tsx`

**Line 72:** Update grid template to match and separate Category from Actions

```tsx
// Before
<div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center ...">
  ...
  <div className="flex items-center gap-2 justify-center">
    <Select ... />
    <Button ... />
  </div>
</div>

// After
<div className="grid grid-cols-[1fr_8rem_8rem_8rem_auto] gap-4 items-center ...">
  ...
  <div>
    <Select className="w-full" ... />
  </div>
  <div className="flex items-center justify-center">
    <Button ... />
  </div>
</div>
```

---

## Issue 2: Remove Category Cards

### Current Structure (Budget Inventory Card)

```text
┌─────────────────────────────────────────────────────┐
│  📍 Budget Inventory                                │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Total   │ │ Total   │ │Variance │ │ Budget  │   │  ← KEEP
│  │ Planned │ │ Actual  │ │         │ │ Used    │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │ 🏠 Housing            ████████░░  $500 left    ││  ← REMOVE
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │ ⚡ Utilities          ██████████  -$50         ││  ← REMOVE
│  └─────────────────────────────────────────────────┘│
│  ... more category cards ...                        │
└─────────────────────────────────────────────────────┘
```

### Solution

Remove the entire "Sleek Vertical Category List" section (lines 341-399) from the Budget Inventory card, leaving only the 4 summary statistics cards.

### File: `src/pages/Budget.tsx`

**Lines 341-399:** Delete the entire category list block

```tsx
// DELETE THIS ENTIRE SECTION (lines 341-399):
{/* Sleek Vertical Category List */}
{categoryData.length > 0 && (
  <div className="space-y-3">
    {categoryData.map((cat, idx) => {
      // ... all the category card rendering code
    })}
  </div>
)}
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/budget/GroupCard.tsx` | Update header grid to 5 columns, add "Category" header |
| `src/components/budget/ExpenseItemRow.tsx` | Update row grid to 5 columns, separate Category Select into its own column |
| `src/pages/Budget.tsx` | Remove lines 341-399 (category cards under Budget Inventory) |

---

## Visual Result

**Budget Inventory Card (After):**
```text
┌─────────────────────────────────────────────────────┐
│  📍 Budget Inventory                                │
├─────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Total   │ │ Total   │ │Variance │ │ Budget  │   │
│  │ Planned │ │ Actual  │ │         │ │ Used    │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────────────────┘
```

**Monthly Budget Table (After):**
```text
Item            | Planned  | Actual   | Category      | Actions
─────────────────────────────────────────────────────────────────
[Rent        ]  | [$1,500] | $1,500   | [Housing   ▾] |  🗑️
[Groceries   ]  | [$400  ] | $450     | [Food      ▾] |  🗑️
```
