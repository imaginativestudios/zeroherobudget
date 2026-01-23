

# Getting Started Checklist Stoic Wisdom Update

## Overview

Refactor the "Your Quest Begins" checklist card to align with the new stoic wisdom voice and the 6-step Financial Journey. The card's visual design will remain unchanged, but the terminology and tasks will be updated to reflect functional, mentor-style guidance.

---

## Current vs New Terminology

| Current | New |
|---------|-----|
| "Your Quest Begins" | "Getting Started" |
| "Quest Complete!" | "Setup Complete!" |
| "Complete these tasks to unlock your full dashboard" | "Complete these steps to unlock your full dashboard" |
| `Swords` icon | `Compass` icon (direction/clarity) |
| "Add your first expense" | "Set up your budget" |

---

## Task Alignment with Journey Steps

The 5 checklist tasks will map to the first 3 journey steps, creating a clear "getting started" subset:

| Task | Aligns with Journey Step | Title | Description |
|------|-------------------------|-------|-------------|
| 1 | Step 1 (Establish Your Budget) | "Set your income" | "Define your monthly earnings" |
| 2 | Step 1 (Establish Your Budget) | "Set up your budget" | "Add expense categories to track spending" |
| 3 | Step 3 (Eliminate Debt) | "Track a debt" | "Add a debt to start your payoff plan" |
| 4 | Step 2 (Build Starter Fund) | "Start your emergency fund" | "Build your financial safety net" |
| 5 | Transaction logging | "Record a transaction" | "Log your first spending entry" |

---

## New Feature: Journey Link Button

Add a button at the bottom of the checklist that takes users to the `/journey` page:

```text
┌─────────────────────────────────────────────────────────────┐
│  🧭 Getting Started                                         │
│  Complete these steps to unlock your full dashboard         │
├─────────────────────────────────────────────────────────────┤
│  Progress: 2 of 5 Complete                    ████████░░    │
│                                                             │
│  [✓] Set your income                                        │
│  [✓] Set up your budget                                     │
│  [ ] Track a debt                                           │
│  [ ] Start your emergency fund                              │
│  [ ] Record a transaction                                   │
│                                                             │
│  ──────────────────────────────────────────────────────────│
│  [🚀 View Your Full Journey]                                │
│  See all 6 steps to financial freedom                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Changes

### File: `src/components/dashboard/GettingStartedChecklist.tsx`

**1. Update imports (Line 5):**
- Replace `Swords` with `Compass`
- Add `Rocket` for the journey button

**2. Update card title (Lines 137-145):**
```tsx
// Before
{allComplete ? (
  <span className="flex items-center gap-2">
    <Sparkles className="h-5 w-5 text-amber-400" />
    Quest Complete!
  </span>
) : (
  'Your Quest Begins'
)}

// After
{allComplete ? (
  <span className="flex items-center gap-2">
    <Sparkles className="h-5 w-5 text-amber-400" />
    Setup Complete!
  </span>
) : (
  'Getting Started'
)}
```

**3. Update header icon (Line 134):**
```tsx
// Before
<Swords className="h-5 w-5 text-primary" aria-hidden="true" />

// After
<Compass className="h-5 w-5 text-primary" aria-hidden="true" />
```

**4. Update expense task (Lines 62-69):**
```tsx
// Before
{ 
  id: 'expense', 
  title: 'Add your first expense', 
  description: 'Track where your money goes',
  ...
}

// After
{ 
  id: 'expense', 
  title: 'Set up your budget', 
  description: 'Add expense categories to track spending',
  ...
}
```

**5. Update debt task description (Lines 71-77):**
```tsx
// Before
description: 'Add a debt to build your payoff plan',

// After
description: 'Add a debt to start your payoff plan',
```

**6. Update subtitle (Lines 147-152):**
```tsx
// Before
'Complete these tasks to unlock your full dashboard'

// After
'Complete these steps to unlock your full dashboard'
```

**7. Add Journey Link Button (after the task grid, before closing CardContent):**
```tsx
{/* Journey Link */}
<div className="mt-4 pt-4 border-t border-border">
  <Button 
    variant="outline" 
    className="w-full min-h-[44px]" 
    asChild
  >
    <Link to="/journey" className="flex items-center justify-center gap-2">
      <Rocket className="h-4 w-4" />
      View Your Full Journey
    </Link>
  </Button>
  <p className="text-xs text-muted-foreground text-center mt-2">
    See all 6 steps to financial freedom
  </p>
</div>
```

---

## Summary of Changes

| Line(s) | Change |
|---------|--------|
| 5 | Replace `Swords` import with `Compass`, add `Rocket` |
| 62-68 | Update "Add your first expense" → "Set up your budget" |
| 74 | Minor tweak to debt description |
| 134 | Replace `Swords` icon with `Compass` |
| 137-145 | "Your Quest Begins" → "Getting Started", "Quest Complete!" → "Setup Complete!" |
| 147-152 | "tasks" → "steps" in subtitle |
| ~200-210 | Add Journey link button with subtext after the task grid |

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/dashboard/GettingStartedChecklist.tsx` | Modify - Update terminology, icon, add Journey button |

