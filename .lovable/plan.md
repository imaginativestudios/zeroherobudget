

# Make Left Rail White with Dark Text

## Overview

Update the sidebar/left rail from the current teal background with white text to a white background with dark text to address banner blindness reported in user testing.

---

## Current vs Proposed

| Element | Current | Proposed |
|---------|---------|----------|
| Background | Teal (`175 77% 26%`) | White (`0 0% 100%`) |
| Text | White (`0 0% 100%`) | Dark (`175 15% 15%`) |
| Active item bg | Darker teal | Light gray with subtle teal accent |
| Border | Dark teal | Light gray |
| Hover states | Lighter teal | Light gray background |

---

## Visual Comparison

**Before:**
```text
┌─────────────────────┐
│  [LOGO]             │  ← White on Teal
├─────────────────────┤
│  🏠 Dashboard       │  ← White text
│  🚀 Journey         │
│  🧭 Budget          │
│  ☁️ Debt Strategy   │
│  ...                │
└─────────────────────┘
```

**After:**
```text
┌─────────────────────┐
│  [LOGO]             │  ← Dark on White
├─────────────────────┤
│  🏠 Dashboard       │  ← Dark text
│  🚀 Journey         │
│  🧭 Budget          │
│  ☁️ Debt Strategy   │
│  ...                │
└─────────────────────┘
```

---

## Technical Changes

### File: `src/index.css`

Update the sidebar CSS variables in the `:root` scope (light mode):

**Lines 93-100:** Update sidebar color tokens

```css
/* Before */
--sidebar-background: 175 77% 26%;
--sidebar-foreground: 0 0% 100%;
--sidebar-primary: 32 88% 65%;
--sidebar-primary-foreground: 175 15% 8%;
--sidebar-accent: 175 65% 35%;
--sidebar-accent-foreground: 0 0% 100%;
--sidebar-border: 175 80% 20%;
--sidebar-ring: 32 88% 65%;

/* After */
--sidebar-background: 0 0% 100%;
--sidebar-foreground: 175 15% 15%;
--sidebar-primary: 175 77% 26%;
--sidebar-primary-foreground: 0 0% 100%;
--sidebar-accent: 175 20% 94%;
--sidebar-accent-foreground: 175 77% 26%;
--sidebar-border: 175 15% 88%;
--sidebar-ring: 175 77% 26%;
```

**Rationale:**
- `--sidebar-background`: Changed to white for high readability
- `--sidebar-foreground`: Changed to dark teal text for contrast
- `--sidebar-primary`: Teal (used for active indicators)
- `--sidebar-accent`: Light gray with subtle teal tint for hover/active backgrounds
- `--sidebar-accent-foreground`: Teal for active state text
- `--sidebar-border`: Light gray border to separate from content
- `--sidebar-ring`: Teal for focus rings

### File: `src/components/Layout.tsx`

Update the sidebar and mobile header from `bg-primary` to use the new sidebar tokens:

**Line 166:** Update mobile header background

```tsx
// Before
<header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-primary shadow-royal border-b border-sidebar-border">

// After  
<header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar shadow-md border-b border-sidebar-border">
```

**Line 175:** Update mobile menu button styling

```tsx
// Before
className="text-sidebar-foreground hover:bg-sidebar-accent/50"

// After
className="text-sidebar-foreground hover:bg-sidebar-accent"
```

**Line 206:** Update sidebar nav background

```tsx
// Before
<nav className="bg-primary shadow-royal border-r border-sidebar-border h-full flex flex-col">

// After
<nav className="bg-sidebar shadow-md border-r border-sidebar-border h-full flex flex-col">
```

**Lines 238-242:** Update navigation link styling for better contrast

```tsx
// Before
isActive
  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-elegant"
  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"

// After
isActive
  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-2 border-primary"
  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
```

**Line 257:** Update Tools section header

```tsx
// Before
<h3 className="px-3 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">

// After
<h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
```

**Line 283:** Update "Signed in as" text

```tsx
// Before
<div className="text-xs text-sidebar-foreground/70 mb-2 px-3">

// After
<div className="text-xs text-muted-foreground mb-2 px-3">
```

**Lines 290, 298, 322:** Update secondary link styling

```tsx
// Before
className="flex items-center gap-2 w-full px-3 py-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 rounded-md transition-colors"

// After
className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
```

**Line 309:** Update subscription button styling

```tsx
// Before
className="w-full justify-start text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 h-auto py-2 px-3"

// After
className="w-full justify-start text-xs text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent h-auto py-2 px-3"
```

**Line 333:** Update Sign Out button

```tsx
// Before
className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"

// After
className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
```

---

## Accessibility Considerations

The new color scheme maintains WCAG AA compliance:

| Element | Contrast Ratio | Requirement |
|---------|---------------|-------------|
| Dark text on white bg | ~12:1 | Exceeds 4.5:1 ✓ |
| Muted text on white bg | ~5.5:1 | Exceeds 4.5:1 ✓ |
| Teal accent text on light gray | ~4.6:1 | Meets 4.5:1 ✓ |

---

## Summary of Changes

| File | Changes |
|------|---------|
| `src/index.css` | Update sidebar CSS variables (lines 93-100) |
| `src/components/Layout.tsx` | Replace `bg-primary` with `bg-sidebar`, update text colors and hover states |

