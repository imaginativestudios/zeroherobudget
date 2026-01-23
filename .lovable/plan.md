
# Input Focus Color, Step Values & Intuitive Card Editing

## Overview

Three enhancements to improve input interactions and make card editing more intuitive:
1. **Focus Color**: Change input focus ring from gold/accent to teal (primary)
2. **Step Values**: Make number input arrows increment by $1 (or 1%) instead of pennies
3. **Intuitive Card Editing**: Replace hidden edit mode with always-visible inline editing

---

## Issue 1: Focus Color (Gold → Teal)

### Current State
Input focus styling uses `--ring-accent` (gold/orange) defined in `index.css`:
- Line 53: `--ring-accent: 32 85% 45%;` (orange)
- Line 256: Global focus styling uses `hsl(var(--ring-accent))`

### Proposed Change
Update the focus ring to use teal (`--ring` which is `175 77% 26%`) for a more cohesive brand experience.

**File: `src/index.css`**

Lines 248-257 (global focus styling):
```css
/* Before */
box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--ring-accent));

/* After */
box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--ring));
```

**File: `src/components/ui/input.tsx`**

Update the focus ring class:
```tsx
// Before
"focus-visible:ring-2 focus-visible:ring-accent/20"

// After  
"focus-visible:ring-2 focus-visible:ring-primary/30"
```

**File: `src/components/ui/currency-input.tsx`**

Update the container focus ring:
```tsx
// Before
"focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"

// After
"focus-within:ring-2 focus-within:ring-primary/30 focus-within:ring-offset-2"
```

---

## Issue 2: Arrow Increment (Pennies → Dollars)

### Current State
The `CurrencyInput` component uses `step="0.01"` in some places, causing arrows to increment by pennies. For most financial inputs, users expect whole dollar increments.

### Proposed Changes

**File: `src/components/ui/currency-input.tsx`**

Add a `step` prop with intelligent defaults:
```tsx
export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  prefix?: string;
  suffix?: string;
  variant?: 'default' | 'debt' | 'expense';
  step?: number; // Default: 1 for $, 0.1 for %
}

// Inside component
const defaultStep = suffix === '%' ? 0.1 : 1;
const actualStep = props.step ?? defaultStep;

<Input
  type="number"
  step={actualStep}
  ...
/>
```

**Files to update step values:**
| File | Location | Current | Change To |
|------|----------|---------|-----------|
| `src/pages/DebtSnowball.tsx` | Balance input | `step="0.01"` | Remove (use default `1`) |
| `src/pages/DebtSnowball.tsx` | APR input | `step="0.01"` | `step={0.1}` |
| `src/pages/DebtSnowball.tsx` | Min Payment input | `step="0.01"` | Remove (use default `1`) |

---

## Issue 3: Intuitive Card Editing

### Current Pattern (Not Intuitive)
Users must:
1. Find and click a small pencil icon
2. Realize they're now in "edit mode"
3. Make changes
4. Find and click save/check button

This creates friction because:
- Edit affordance is hidden (pencil icon is subtle)
- Users may not realize fields are editable
- Two-step process for simple changes

### Proposed Pattern: "Click-to-Edit" Inline Editing

Replace the toggle-based edit mode with always-visible, direct-manipulation inputs:

**Design Principles:**
1. **Values are always visible** as formatted display text
2. **Clicking a value** transforms it into an editable input
3. **Blur or Enter** saves the change automatically
4. **Escape** cancels the edit

**Visual Mockup:**

```text
┌─────────────────────────────────────────┐
│  Credit Card                        🗑️  │
│  Visa • APR: 22.5%                      │
├─────────────────────────────────────────┤
│  Balance          APR         Min Pay   │
│  $5,000          22.5%         $150     │  ← Display mode (clickable)
│  ─────────       ─────        ─────     │
│                                         │
│  [Click any value to edit]              │  ← Helper text (optional)
└─────────────────────────────────────────┘

After clicking "$5,000":
┌─────────────────────────────────────────┐
│  Balance          APR         Min Pay   │
│  ┌────────┐      22.5%         $150     │
│  │ $ 5000 │  ✓   ─────        ─────     │
│  └────────┘                             │
└─────────────────────────────────────────┘
```

### Implementation: New "EditableValue" Component

**File: `src/components/ui/editable-value.tsx` (new)**

```tsx
interface EditableValueProps {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  formatDisplay?: (value: number) => string;
  className?: string;
}

const EditableValue = ({ value, onChange, prefix, suffix, formatDisplay, className }: EditableValueProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(value.toString());
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <CurrencyInput
        ref={inputRef}
        prefix={prefix}
        suffix={suffix}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn("w-24", className)}
      />
    );
  }

  return (
    <button
      onClick={() => {
        setEditValue(value.toString());
        setIsEditing(true);
      }}
      className={cn(
        "font-semibold text-foreground px-2 py-1 -mx-2 -my-1 rounded-md",
        "hover:bg-muted/50 focus-visible:bg-muted/50 cursor-text transition-colors",
        "text-left",
        className
      )}
      aria-label={`Edit value: ${formatDisplay ? formatDisplay(value) : value}`}
    >
      {formatDisplay ? formatDisplay(value) : `${prefix || ''}${value}${suffix || ''}`}
    </button>
  );
};
```

### Update Debt Cards to Use EditableValue

**File: `src/pages/DebtSnowball.tsx`**

Replace the edit mode toggle with inline EditableValue components:

```tsx
// Before - with edit mode toggle
<div>
  <label className="text-xs text-muted-foreground">Balance</label>
  <CurrencyInput
    prefix="$"
    value={isEditing ? editBuffer.balance ?? debt.balance : debt.balance}
    onChange={(e) => { ... }}
    disabled={!isEditing}
  />
</div>

// After - always editable inline
<div>
  <label className="text-xs text-muted-foreground">Balance</label>
  <EditableValue
    value={debt.balance}
    onChange={(value) => updateDebt(debt.id, 'balance', value)}
    prefix="$"
    formatDisplay={formatCurrency}
  />
</div>
```

This removes the need for:
- `editingDebtId` state
- `editBuffer` state
- Pencil/X toggle buttons
- `startEditing`, `cancelEditing`, `saveChanges` functions

### Update Command Center

**File: `src/components/dashboard/CommandCenter.tsx`**

Apply the same pattern to income and expense values:

```tsx
// Before
{isEditing && onIncomeChange ? (
  <CurrencyInput ... />
) : (
  <span className="text-lg font-bold text-success">
    {formatCurrency(income)}
  </span>
)}

// After
<EditableValue
  value={income}
  onChange={onIncomeChange}
  prefix="$"
  formatDisplay={formatCurrency}
  className="text-lg font-bold text-success"
/>
```

---

## Summary of Changes

| File | Type | Changes |
|------|------|---------|
| `src/index.css` | Style | Update global focus ring from accent to primary |
| `src/components/ui/input.tsx` | Core | Update focus ring class to primary |
| `src/components/ui/currency-input.tsx` | Core | Update focus ring, add smart step defaults |
| `src/components/ui/editable-value.tsx` | New | Click-to-edit inline component |
| `src/pages/DebtSnowball.tsx` | Page | Replace edit mode with EditableValue, remove step="0.01" |
| `src/components/dashboard/CommandCenter.tsx` | Component | Replace edit mode toggle with EditableValue |

---

## UX Benefits

| Before | After |
|--------|-------|
| Hidden edit affordance (pencil icon) | Values look clickable (hover state) |
| Two-step edit process (click pencil → edit → click save) | Single-step (click value → edit → blur) |
| Confusing "am I in edit mode?" state | Always clear what's editable |
| Easy to forget to save | Auto-saves on blur |
| Arrows increment by $0.01 | Arrows increment by $1 |

---

## Accessibility Considerations

- `EditableValue` buttons have proper `aria-label` for screen readers
- Focus is automatically moved to input when editing begins
- Escape key cancels edits (standard pattern)
- Enter key saves (standard pattern)
- Tab navigation works naturally through editable values
