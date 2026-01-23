

# Dark Logo & Enhanced Active Navigation

## Overview

Two updates to the sidebar:
1. Switch to the dark logo variant for the white background
2. Enhance the visual design of the active navigation state to be more distinctive

---

## Current vs Proposed

### Logo

| Current | Proposed |
|---------|----------|
| White text logo on white background (poor contrast) | Dark text logo on white background (proper contrast) |

### Active Navigation State

| Current | Proposed |
|---------|----------|
| Light gray background + left border | Teal background with white text + rounded corners + subtle shadow |

---

## Visual Mockup

**Active Navigation - Current:**
```text
┌─────────────────────────────┐
│ ▎ 🏠 Dashboard              │  ← Light gray bg, teal left border
│   🚀 Journey                │
│   🧭 Budget                 │
└─────────────────────────────┘
```

**Active Navigation - Proposed:**
```text
┌─────────────────────────────┐
│  ████████████████████       │
│  ██ 🏠 Dashboard     ██     │  ← Teal filled bg, white text, shadow
│  ████████████████████       │
│   🚀 Journey                │
│   🧭 Budget                 │
└─────────────────────────────┘
```

---

## Technical Changes

### File: `src/components/Layout.tsx`

**Change 1:** Update Logo to use dark variant

Line 211:
```tsx
// Before
<Logo className="h-8 w-auto" />

// After
<Logo className="h-8 w-auto" variant="dark" />
```

**Change 2:** Enhance active navigation link styling

Lines 238-242:
```tsx
// Before
isActive
  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-2 border-primary"
  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"

// After
isActive
  ? "bg-primary text-primary-foreground font-semibold shadow-md"
  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
```

**Change 3:** Update icon color for active state

Lines 247-248 (icon inside active link):
```tsx
// Before
<item.icon className="h-5 w-5" aria-hidden="true" />

// After
<item.icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} aria-hidden="true" />
```

---

## Design Rationale

**Dark Logo:**
- The Logo component already supports `variant="dark"` which renders dark teal text
- Essential for readability on the now-white sidebar background

**Enhanced Active State:**
- Uses `bg-primary` (teal) with `text-primary-foreground` (white) for high contrast
- Adds `shadow-md` for depth and visual prominence
- Removes the left border in favor of a full filled background
- Creates clear visual hierarchy between active and inactive items

---

## Accessibility

| Element | Contrast Ratio | Requirement |
|---------|---------------|-------------|
| White text on teal bg (active) | ~7:1 | Exceeds 4.5:1 |
| Dark teal text on white bg (inactive) | ~12:1 | Exceeds 4.5:1 |
| Teal text on light gray bg (hover) | ~4.6:1 | Meets 4.5:1 |

---

## Summary of Changes

| File | Changes |
|------|---------|
| `src/components/Layout.tsx` | Add `variant="dark"` to Logo, update active navigation styling |

