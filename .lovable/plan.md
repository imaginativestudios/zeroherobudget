

## Improve ScrollCue Visibility on Both Landing Pages

### Problem
The ScrollCue exists on both pages but sits at the very bottom edge of the hero, making it easy to overlook — especially on mobile where the hero content fills most of the viewport.

### Changes

**`src/components/ScrollCue.tsx`** — Make the cue more visually prominent and subtle at the same time:
- Add a gentle pulsing glow/backdrop behind the chevron (e.g. a small `bg-white/10 rounded-full` circle behind the icon)
- Increase bottom spacing from `bottom-6` to `bottom-8` on mobile, `sm:bottom-10` on larger screens
- Add a subtle fade-in animation with a 1.2s delay so it appears after the hero content loads
- Make the text slightly larger on desktop: `text-xs sm:text-sm`

**`src/pages/Landing.tsx`** — Ensure the hero section doesn't clip the ScrollCue:
- Change `overflow-hidden` to `overflow-x-hidden` on the hero `<section>` so vertical content (the cue at the bottom) isn't clipped

**`src/pages/ComingSoon.tsx`** — Same overflow fix:
- Change `overflow-hidden` to `overflow-x-hidden` on the hero section

### Files changed
1. `src/components/ScrollCue.tsx`
2. `src/pages/Landing.tsx`
3. `src/pages/ComingSoon.tsx`

