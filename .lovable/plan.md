

# Custom Input Field UX & Visual Design Improvements

## Issues Identified

| Problem | Impact |
|---------|--------|
| **Disconnected Layout** | The input floats below the grid, feeling like an afterthought rather than an integrated part of the selection |
| **Weak Container** | No visual boundary around the input area - it blends into the card background |
| **Left-Aligned Input** | `max-w-xs` creates asymmetrical layout that doesn't match the centered grid above |
| **Technical Label** | "Enter your goal amount (minimum $100)" is instructional, not encouraging |
| **No Contextual Help** | Users don't know what a good custom amount might be |
| **Plain Animation** | Simple opacity/height animation could be more polished |

---

## Proposed Design

Create a cohesive, centered input area that feels like an extension of the selected "Custom" card:

```text
Current Layout:                        Proposed Layout:
┌─────────┐┌─────────┐                ┌─────────┐┌─────────┐
│  $500   ││ $1,000  │                │  $500   ││ $1,000  │
│ Starter ││   ★     │                │ Starter ││   ★     │
└─────────┘└─────────┘                └─────────┘└─────────┘
┌─────────┐┌─────────┐                ┌─────────┐┌─────────┐
│  $2000  ││ $1,500  │                │  $2000  ││ $1,500  │
│  Full   ││ Custom ✓│                │  Full   ││ Custom ✓│
└─────────┘└─────────┘                └─────────┘└─────────┘
                                      ┌───────────────────────┐
Enter your goal amount (min $100)     │   Your Custom Goal    │
┌────────────────┐                    │                       │
│ $ 1500         │                    │   ┌──────────────┐    │
└────────────────┘                    │   │  $   1,500   │    │
                                      │   └──────────────┘    │
                                      │                       │
                                      │   💡 Tip: 3-6 months  │
                                      │   of expenses is ideal│
                                      └───────────────────────┘
```

---

## Improvements

### 1. Create a Visual Container
Wrap the input in a styled container that connects it visually to the selected Custom option:

```tsx
<motion.div className="overflow-hidden">
  <div className="mt-4 p-4 rounded-xl bg-accent/5 border border-accent/20">
    {/* Content centered inside */}
  </div>
</motion.div>
```

### 2. Center the Input Layout
Make the input centered and give it a prominent, focused appearance:

```tsx
<div className="flex flex-col items-center text-center space-y-3">
  <Label className="text-sm font-medium text-foreground">
    Your Custom Goal
  </Label>
  <CurrencyInput
    className="text-center text-xl h-14 max-w-[180px] font-semibold"
    ...
  />
</div>
```

### 3. Improve the Label Copy
Change from technical instruction to empowering language:

```tsx
// Before
"Enter your goal amount (minimum $100)"

// After - More human, matches Stoic voice
"Your Custom Goal"
```

### 4. Add Helpful Micro-Copy
Add subtle contextual guidance below the input:

```tsx
<p className="text-xs text-muted-foreground mt-2">
  Tip: 3-6 months of expenses is a common goal
</p>
```

### 5. Improve Animation
Use spring physics for a more natural feel:

```tsx
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: 'auto', opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ 
    type: 'spring', 
    stiffness: 300, 
    damping: 30,
    opacity: { duration: 0.2 }
  }}
>
```

### 6. Add Minimum Validation Indicator
Show subtle inline feedback when below minimum:

```tsx
{parseFloat(customValue) < 100 && customValue !== '' && (
  <p className="text-xs text-destructive">
    Minimum goal is $100
  </p>
)}
```

---

## Implementation

### File: `src/components/onboarding/MoatSelector.tsx`

**Complete Updated Custom Input Section (lines 121-148):**

```tsx
{/* Custom input field (animated) */}
<AnimatePresence>
  {showCustomInput && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      className="overflow-hidden"
    >
      <div className="mt-4 p-5 rounded-xl bg-accent/5 border border-accent/20">
        <div className="flex flex-col items-center text-center space-y-3">
          <Label 
            htmlFor="custom-goal" 
            className="text-sm font-medium text-foreground"
          >
            Your Custom Goal
          </Label>
          <CurrencyInput
            id="custom-goal"
            prefix="$"
            value={customValue}
            onChange={handleCustomChange}
            placeholder="1500"
            min={100}
            autoFocus
            className="text-center text-xl h-14 max-w-[180px] font-semibold"
          />
          {parseFloat(customValue) < 100 && customValue !== '' ? (
            <p className="text-xs text-destructive">
              Minimum goal is $100
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Tip: 3-6 months of expenses is a common goal
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## Visual Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Container** | None (floating) | Rounded box with accent tint |
| **Alignment** | Left-aligned, narrow | Centered, prominent |
| **Input Size** | `max-w-xs`, default height | `max-w-[180px]`, `text-xl`, `h-14` |
| **Label** | Technical instruction | Empowering title |
| **Guidance** | None | Contextual tip about 3-6 months |
| **Validation** | Silent | Inline error for under $100 |
| **Animation** | Linear timing | Spring physics |

---

## Gestalt Principles Applied

- **Common Region**: The accent-tinted container groups all custom input elements together
- **Proximity**: Tighter spacing between label, input, and tip
- **Focal Point**: Centered, larger input draws the eye immediately
- **Similarity**: Container styling echoes the selected state of preset options
- **Continuity**: Vertical stack flows naturally from label → input → tip

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/onboarding/MoatSelector.tsx` | Redesign custom input section with container, centering, improved animation, and validation feedback |

