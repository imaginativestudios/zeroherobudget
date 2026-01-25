

# Onboarding UX Improvements Using Gestalt Principles

## Analysis: What Looks "Off"

After analyzing the current onboarding flow through Gestalt design principles, I've identified several visual and UX issues:

### Issues Identified

| Principle | Problem | Impact |
|-----------|---------|--------|
| **Proximity** | The HeroTip is visually disconnected from the input—too much space between the input's "per hour" label and the tip | Users don't associate the tip with the input it references |
| **Focal Point** | The input field lacks visual emphasis—it's the same width as everything else and has low contrast | Users' eyes wander instead of landing on the primary action |
| **Figure-Ground** | The card is floating on a very similar gray background with minimal contrast | The form feels "flat" and unanchored |
| **Similarity** | The "Continue" and "Skip for now" buttons have equal visual weight in their containers | The primary action doesn't stand out enough from secondary |
| **Common Region** | Step 3's MoatSelector (4-column grid) breaks the visual rhythm when the 4th "Custom" option is smaller | Inconsistent grouping breaks Gestalt's "common region" |
| **Continuity** | The header text hierarchy (Title → Subtitle → Question) uses 3 different colors and sizes but lacks clear visual separation | Information flow is unclear |

---

## Proposed Improvements

### 1. Improve Focal Point on Primary Input

**Current**: Input is full-width, same style as everything else.

**Proposed**: Make the primary input larger, centered, with subtle visual emphasis.

```text
Before:                          After:
┌─────────────────────┐         ┌───────────────────────┐
│ $ 30.00             │         │                       │
└─────────────────────┘         │    ┌───────────┐      │
                                │    │  $ 30.00  │      │
                                │    └───────────┘      │
                                │      per hour         │
                                └───────────────────────┘
```

**Changes in `Onboarding.tsx` (Step 1)**:
- Reduce input max-width to `max-w-[200px] mx-auto`
- Increase input font size to `text-2xl`
- Add subtle focus highlight container

### 2. Improve Proximity: Tighten Tip Placement

**Current**: HeroTip has `mt-6` creating large gap from content.

**Proposed**: Reduce spacing to `mt-4` and integrate it more closely.

**Changes in `HeroTip.tsx`**:
- Change internal padding and margin
- Make it feel more like an inline annotation

### 3. Strengthen Figure-Ground Contrast

**Current**: Card background `bg-card` on `bg-gradient-to-br from-background via-secondary` creates low contrast.

**Proposed**: Add subtle shadow elevation and slightly increase border visibility.

**Changes in `Onboarding.tsx`**:
- Update card class: `shadow-lg` → `shadow-xl`
- Add `ring-1 ring-black/5` for subtle definition

### 4. Fix MoatSelector Grid Balance (Step 3)

**Current**: 4-column grid with unequal content makes "Custom" feel orphaned.

**Proposed**: 
- Use 2x2 grid on mobile (better touch targets)
- Add visual parity to "Custom" option
- Show current value prominently when custom is selected

**Changes in `MoatSelector.tsx`**:
- Change grid to `grid-cols-2 sm:grid-cols-4`
- Add dollar amount display to Custom when active
- Improve custom input styling

### 5. Improve Button Hierarchy (Similarity Principle)

**Current**: "Skip for now" is full-width, creating visual competition with "Continue".

**Proposed**: Make secondary action smaller and more subdued.

**Changes in `Onboarding.tsx`**:
- Change "Skip for now" to inline link style rather than full-width button
- Add more visual differentiation

### 6. Improve Header Text Hierarchy (Continuity)

**Current**: Three text lines (title, subtitle, question) blend together.

**Proposed**: Create clear visual grouping with consistent spacing.

**Changes in `Onboarding.tsx`**:
- Increase spacing between title and subtitle
- Use consistent text sizing
- Remove the subtitle color variation (both use foreground)

---

## Implementation Details

### File: `src/components/onboarding/MoatSelector.tsx`

**Grid Layout Fix**:
```tsx
// Before
<div className="grid grid-cols-4 gap-2 sm:gap-3">

// After - Better mobile layout
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
```

**Custom Option Enhancement**:
- When "Custom" is selected, show the current value as a large number
- Add a subtle edit indicator

```tsx
<button onClick={handleCustomSelect} ...>
  {showCustomInput ? (
    <>
      <span className="text-lg sm:text-xl font-bold text-accent">
        ${customValue || '1,500'}
      </span>
      <span className="text-xs text-muted-foreground">Custom</span>
    </>
  ) : (
    <>
      <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 mb-1 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Custom</span>
    </>
  )}
</button>
```

### File: `src/pages/Onboarding.tsx`

**Input Focal Point (Step 1)**:
```tsx
// Before
<CurrencyInput
  className="text-center text-lg h-14"
  ...
/>

// After - More prominent
<div className="flex justify-center">
  <CurrencyInput
    className="text-center text-2xl h-16 max-w-[200px] font-semibold"
    ...
  />
</div>
```

**Card Elevation**:
```tsx
// Before
className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg"

// After - Stronger figure-ground
className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl ring-1 ring-black/5"
```

**Button Hierarchy**:
```tsx
// Before
<Button variant="ghost" onClick={handleSkip} className="w-full text-muted-foreground">
  Skip for now
</Button>

// After - Less prominent, link-style
<button
  onClick={handleSkip}
  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
>
  Skip for now
</button>
```

**Header Text Hierarchy**:
```tsx
// Before - Cramped spacing
<h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
<p className="text-sm font-medium text-primary mb-1">
<p className="text-sm text-muted-foreground">

// After - Clearer grouping
<h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
<p className="text-sm font-medium text-primary mb-2">
<p className="text-sm text-muted-foreground leading-relaxed">
```

### File: `src/components/onboarding/HeroTip.tsx`

**Tighter Integration**:
```tsx
// Before
<div className="bg-muted border border-info/30 rounded-lg p-4 mt-6">

// After - Reduced top margin, inline feel
<div className="bg-muted/50 border border-info/20 rounded-lg p-3 mt-4">
```

---

## Summary of Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Onboarding.tsx` | Input focal point, card elevation, button hierarchy, header spacing |
| `src/components/onboarding/MoatSelector.tsx` | 2x2 mobile grid, custom value display, improved visual balance |
| `src/components/onboarding/HeroTip.tsx` | Tighter spacing, softer styling |

---

## Visual Before/After Comparison

```text
BEFORE:                              AFTER:
┌────────────────────────┐          ┌────────────────────────┐
│ [Icon]                 │          │        [Icon]          │
│ Title                  │          │                        │
│ Subtitle               │          │         Title          │
│ Question text...       │          │        Subtitle        │
│                        │          │                        │
│ ┌────────────────────┐ │          │ Question text here...  │
│ │ $ 30.00            │ │          │                        │
│ └────────────────────┘ │          │    ┌──────────────┐    │
│      per hour          │          │    │   $ 30.00    │    │
│                        │          │    └──────────────┘    │
│ ┌────────────────────┐ │          │       per hour         │
│ │ 💡 Tip: Long tip...│ │          │                        │
│ └────────────────────┘ │          │ 💡 Tip: Long tip text  │
│                        │          │                        │
│ [====== Continue ====] │          │ [====== Continue ====] │
│ [====== Skip ========] │          │      Skip for now      │
└────────────────────────┘          └────────────────────────┘

Step 3 MoatSelector:

BEFORE (cramped on mobile):         AFTER (balanced):
┌────┐┌────┐┌────┐┌────┐            ┌─────────┐┌─────────┐
│$500││$1K ││$2K ││ ✏️ │            │  $500   ││  $1,000 │
└────┘└────┘└────┘└────┘            │ Starter ││  Best ★ │
                                    └─────────┘└─────────┘
                                    ┌─────────┐┌─────────┐
                                    │  $2,000 ││  Custom │
                                    │  Full   ││  $1,500 │
                                    └─────────┘└─────────┘
```

---

## Gestalt Principles Applied

- **Proximity**: Tighter spacing between related elements (input → label → tip)
- **Focal Point**: Centered, larger primary input draws the eye
- **Figure-Ground**: Enhanced card shadow creates clear separation from background
- **Similarity**: Clear visual distinction between primary and secondary actions
- **Common Region**: Balanced 2x2 grid gives each option equal visual weight on mobile
- **Continuity**: Improved text hierarchy guides the eye from title → action

