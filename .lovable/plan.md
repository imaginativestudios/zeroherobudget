

# Tighten & Polish the Pro Tip Card

Condense the card into a single-line feel and add subtle visual refinement.

## Changes — `src/pages/Pricing.tsx` (lines 174–202)

1. **Reduce vertical margin**: `mt-6` → `mt-4`, reduce `max-w-3xl` → `max-w-2xl`
2. **Tighten padding**: `px-4 py-3` → `px-4 py-2.5`
3. **Merge header + stats into fewer rows**:
   - Row 1: Lightbulb icon + "Pro Tip" badge + headline — all on one line (keep)
   - Row 2: Merge the stat chips AND the closing "10× over" line into a single row, removing the separate closing `<p>`. Format: `$47 lazy cash · 4 mo faster · $1,200+ saved · pays for itself 10×`
4. **Remove `mb-1.5`** between sections → `mb-1`
5. **Polish touches**:
   - Swap the flat left-border for a subtle `bg-gradient-to-r from-accent/8 to-transparent` background
   - Add `backdrop-blur-sm` for depth
   - Use `ring-1 ring-accent/20` instead of `border border-accent/30` for a thinner, more refined border
   - Slightly reduce border radius: `rounded-xl` → `rounded-lg`

Net result: ~2 lines of text total, tighter spacing, more polished appearance.

