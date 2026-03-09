

# Make ROI Pro Tip Card Even Slimmer

Condense the card into a single-row inline layout instead of stacked sections.

## Changes — `src/pages/Pricing.tsx` (lines 174–213)

1. **Remove the stat grid entirely** — inline the three stats as a single horizontal row of text badges instead of bordered cards
2. **Merge everything into ~3 vertical lines**: header row → stat chips row → closing line
3. **Reduce padding**: `p-4 md:p-5` → `px-4 py-3`
4. **Remove margin between sections**: `mb-3` → `mb-2` or `mb-1`
5. **Stat chips**: Simple `span` elements with `text-sm font-bold` separated by dots, no cards/borders/backgrounds

Result: the card becomes roughly the height of 3 lines of text (~80px) instead of ~160px.

