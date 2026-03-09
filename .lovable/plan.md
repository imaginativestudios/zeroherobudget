

# Add Scroll Cue to Landing Pages

## Problem
Both the Coming Soon (`/`) and Landing (`/landing`) pages have full-viewport hero sections (`min-h-screen`). Users don't realize there's more content below the fold.

## Solution
Add an animated "scroll down" chevron indicator at the bottom of each hero section — a subtle bouncing arrow that signals more content exists. It fades out once the user scrolls.

## Technical approach

### Create a reusable `ScrollCue` component
- Positioned at the bottom-center of the hero section
- Animated bouncing chevron (ChevronDown icon) using framer-motion
- Fades out after user scrolls ~100px (via scroll listener + opacity transition)
- Clicking it smooth-scrolls to the next section
- Minimal footprint: ~30 lines

### Apply to both pages

1. **`src/pages/Landing.tsx`** — Add `ScrollCue` inside the hero `<section>` (after trust badges, before closing `</section>`)
2. **`src/pages/ComingSoon.tsx`** — Same placement inside its hero section

### Design details
- White chevron icon on the dark hero background
- Subtle "bounce" animation (translateY loop, 1.5s)
- `opacity: 0` after scroll threshold via state
- `cursor-pointer` with smooth scroll to next section via `scrollIntoView`
- Small label "Scroll to explore" in xs text above the chevron (optional, adds clarity)

No changes to Layout or other pages needed.

