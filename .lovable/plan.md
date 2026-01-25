
# Add Custom Emergency Fund Goal in Onboarding

## Overview

Allow users to enter their own emergency fund goal amount during onboarding Step 3, in addition to the three preset options ($500, $1,000, $2,000). This gives users flexibility to set a goal that matches their specific situation.

---

## Current State

The `MoatSelector` component presents only three fixed options:
- $500 (Starter)
- $1,000 (Recommended)
- $2,000 (Full Protection)

The type system enforces this: `moatTarget: 500 | 1000 | 2000`

---

## Proposed UX Design

Add a fourth "Custom" option that reveals a currency input when selected:

```text
┌─────────────────────────────────────────────────────────────┐
│                Set Your Emergency Fund Goal                  │
│            Choose your savings target                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│   │  $500   │  │ $1,000  │  │ $2,000  │  │ Custom  │       │
│   │ Starter │  │  Best   │  │  Full   │  │  Your   │       │
│   │         │  │   ★     │  │ Protect │  │  Goal   │       │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                              │
│   [When Custom is selected:]                                 │
│   ┌────────────────────────────────────────────────────┐    │
│   │ Enter your goal amount                              │    │
│   │ ┌──────────────────────────────────────────────┐   │    │
│   │ │ $                                      3,500 │   │    │
│   │ └──────────────────────────────────────────────┘   │    │
│   └────────────────────────────────────────────────────┘    │
│                                                              │
│   💡 A $1,000 emergency fund protects 80% of people...      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Changes

### 1. Update Type Definitions

**File: `src/hooks/useHeroProfile.ts`**

Change the moatTarget type from union to number:

```typescript
// Before
moatTarget?: 500 | 1000 | 2000;

// After
moatTarget?: number;
```

**File: `src/hooks/useOnboardingState.ts`**

Update the type constraint:

```typescript
// Before
moatTarget: 500 | 1000 | 2000;
setMoatTarget: (target: 500 | 1000 | 2000) => void;

// After
moatTarget: number;
setMoatTarget: (target: number) => void;
```

---

### 2. Update MoatSelector Component

**File: `src/components/onboarding/MoatSelector.tsx`**

Transform from a simple button group to support a custom input:

```tsx
interface MoatSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const presetOptions = [
  { value: 500, label: '$500', subtitle: 'Starter' },
  { value: 1000, label: '$1,000', subtitle: 'Recommended', recommended: true },
  { value: 2000, label: '$2,000', subtitle: 'Full Protection' },
];

export function MoatSelector({ value, onChange }: MoatSelectorProps) {
  const isCustom = !presetOptions.some(opt => opt.value === value);
  const [customValue, setCustomValue] = useState(isCustom ? value.toString() : '');
  const [showCustomInput, setShowCustomInput] = useState(isCustom);

  const handleCustomSelect = () => {
    setShowCustomInput(true);
    // Set a reasonable default when switching to custom
    if (!customValue) {
      setCustomValue('1500');
      onChange(1500);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 100) {
      onChange(parsed);
    }
  };

  const handlePresetSelect = (presetValue: number) => {
    setShowCustomInput(false);
    onChange(presetValue);
  };

  return (
    <div className="space-y-4">
      {/* 4-column grid: 3 presets + Custom */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {presetOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handlePresetSelect(option.value)}
            className={cn(
              'relative flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 transition-all',
              value === option.value && !showCustomInput
                ? 'border-accent bg-accent/10'
                : 'border-border bg-card hover:border-primary/50'
            )}
          >
            {option.recommended && <Star badge />}
            <span className="text-lg font-bold">{option.label}</span>
            <span className="text-xs text-muted-foreground">{option.subtitle}</span>
          </button>
        ))}
        
        {/* Custom option */}
        <button
          onClick={handleCustomSelect}
          className={cn(
            'flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 transition-all',
            showCustomInput
              ? 'border-accent bg-accent/10'
              : 'border-border bg-card hover:border-primary/50'
          )}
        >
          <Edit3 className="h-5 w-5 mb-1" />
          <span className="text-xs text-muted-foreground">Custom</span>
        </button>
      </div>

      {/* Custom input field (animated) */}
      <AnimatePresence>
        {showCustomInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <Label htmlFor="custom-goal">Enter your goal amount</Label>
              <CurrencyInput
                id="custom-goal"
                prefix="$"
                value={customValue}
                onChange={handleCustomChange}
                placeholder="1500"
                min="100"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

### 3. Update Onboarding Page

**File: `src/pages/Onboarding.tsx`**

The MoatSelector usage stays the same, but the type will now accept any number:

```tsx
<MoatSelector value={data.moatTarget} onChange={setMoatTarget} />
```

No visual changes needed here since MoatSelector handles everything internally.

---

### 4. Validation

Add validation to ensure custom amounts are reasonable:

- **Minimum**: $100 (prevent trivially small goals)
- **Maximum**: No hard limit, but could add $50,000 as sanity check
- **Error message**: "Please enter an amount of at least $100"

---

### 5. Update E2E Tests

**File: `e2e/onboarding.spec.ts`**

Add test for custom goal entry:

```typescript
test('Step 3: Enter custom moat target', async ({ page }) => {
  await page.goto('/onboarding');
  
  // Complete Steps 1-2
  await page.locator('#hourly-wage').fill('30');
  await page.getByRole('button', { name: /continue/i }).click();
  await page.getByRole('button', { name: /continue/i }).click(); // Skip debt
  
  // Should be on Step 3
  await expect(page.getByText('Set Your Emergency Fund Goal')).toBeVisible();
  
  // Click "Custom" option
  await page.getByText('Custom').click();
  
  // Enter custom amount
  await page.locator('#custom-goal').fill('3500');
  
  // Continue to next step
  await page.getByRole('button', { name: /See My Payoff Timeline/i }).click();
  
  // Should advance to Aha Moment
  await expect(page.getByText(/freedom|path/i)).toBeVisible();
});
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useHeroProfile.ts` | Change `moatTarget` type from `500 \| 1000 \| 2000` to `number` |
| `src/hooks/useOnboardingState.ts` | Update `moatTarget` type and `setMoatTarget` signature to accept `number` |
| `src/components/onboarding/MoatSelector.tsx` | Add "Custom" fourth option with currency input, update props interface |
| `e2e/onboarding.spec.ts` | Add test for custom goal entry |

---

## Accessibility Considerations

- Custom input has proper label association (`htmlFor`/`id`)
- Focus moves to custom input when Custom option is selected
- All buttons maintain keyboard navigation
- Animation respects `prefers-reduced-motion`
