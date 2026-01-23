

# Update "The Path" Section Copy

## Overview

Change the subheadline under "The Path" section from "Your journey from zero to hero" to more positive, empowering copy that doesn't reference users as "zero."

---

## Current vs Proposed

| Current | Proposed |
|---------|----------|
| "Your journey from zero to hero" | "Your path to financial freedom" |

**Why this choice:**
- Aligns with the Stoic Wisdom brand voice
- Matches the final journey step title ("Financial Freedom")
- Positive and aspirational without any negative connotation
- Clean and concise

---

## Technical Change

### File: `src/pages/Landing.tsx`

**Line 229:** Update the paragraph text

```tsx
// Before
<p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
  Your journey from zero to hero
</p>

// After
<p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
  Your path to financial freedom
</p>
```

---

## Summary

| File | Change |
|------|--------|
| `src/pages/Landing.tsx` | Line 229: Update subheadline text |

