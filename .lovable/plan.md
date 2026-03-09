

# Add Subtle Shine Animation to Chatbot FAB

## Approach
Add a CSS pseudo-element shine sweep that plays every 4–5 seconds on the floating action button. The shine is a diagonal white gradient that slides across the button, creating a subtle "glint" effect.

## Changes

### 1. `src/index.css` — Add shine keyframe
Add a `@keyframes fab-shine` animation that translates a diagonal white gradient across the button from left to right. Apply it via a utility class `.fab-shine` using `::before` pseudo-element with `overflow: hidden` on the parent.

### 2. `src/components/ChatbotWidget.tsx` — Apply class
Add `overflow-hidden relative fab-shine` to the FAB button's className (line 336).

The animation will run every ~5s with a quick 0.6s sweep, using a low-opacity white gradient so it feels subtle and polished.

