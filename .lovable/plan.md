

# Redesign Pricing Page — Visual Polish

The current page is functional but flat. The goal is to elevate it to match the Landing page's quality (framer-motion, gradients, visual depth) while keeping the same structure and logic.

## Changes to `src/pages/Pricing.tsx`

### 1. Hero section with gradient background and motion
- Add a full-width gradient hero area using the project's teal/accent tokens (`from-primary/5 via-background to-accent/5`)
- Animate heading and subtitle in with `framer-motion` fade-up (matching Landing page patterns)
- Add a subtle decorative glow/blur circle behind the hero text for depth

### 2. Interval toggle — pill refinement
- Add a subtle border and shadow to the toggle container
- Animate the active indicator sliding between options (transform transition)

### 3. Pricing cards — elevated design
- Make the selected card scale slightly (`scale-[1.02]`) with a shadow lift
- Add a subtle radial gradient overlay on the selected card
- Annual card: make the "BEST VALUE" badge more prominent with a shimmer/pulse animation
- Add a crossed-out "was $144" comparison price on the annual card
- Add framer-motion `layoutId` transitions when switching between cards

### 4. Features grid — icon polish
- Increase icon container size slightly, add subtle shadow
- Stagger animate features in on mount using framer-motion

### 5. CTA button area
- Add a subtle glow/shadow behind the primary CTA button
- Add animated sparkle effect or gentle pulse to draw attention

### 6. Transparency / social proof section
- Add subtle card-like containers or a light background section break
- Add trust badges row (e.g., Shield icon + "256-bit encryption", Lock + "Stripe secured", etc.)

### 7. Overall page
- Add subtle decorative background elements (blurred circles/orbs) for depth, similar to modern SaaS pricing pages
- Ensure smooth scroll behavior and spacing rhythm on the 8pt grid

## Files modified
- `src/pages/Pricing.tsx` — all visual changes, add framer-motion imports

No logic, routing, or Stripe integration changes. Pure visual polish.

