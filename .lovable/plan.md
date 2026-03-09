

# Slim Down the ROI Pro Tip Card

Reduce the card's vertical footprint by making the layout more compact — inline the stats horizontally, reduce padding and margins, and tighten spacing.

## Changes — `src/pages/Pricing.tsx` (lines 174–217)

1. **Reduce outer margin**: `mt-10` → `mt-6`
2. **Reduce inner padding**: `p-6 md:p-8` → `p-4 md:p-5`
3. **Inline header + headline on one line**: Move the "Pro Tip" badge and the headline into a single flex row instead of stacked
4. **Reduce headline margin**: `mb-6` → `mb-3`
5. **Compact stat cards**: Reduce padding from `p-4` to `p-3`, make the stat text smaller (`text-xl` instead of `text-2xl`), remove icons to save vertical space, put stats in a horizontal row on all screen sizes (`grid-cols-3` always)
6. **Reduce bottom margin on grid**: `mb-6` → `mb-3`
7. **Tighten closing line spacing**

Net effect: roughly 40–50% shorter card height while keeping all the content.

