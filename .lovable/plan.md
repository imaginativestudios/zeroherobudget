

# Update Pricing Page Subtitle Copy

## Change — `src/pages/Pricing.tsx` (lines 165–172)

Replace the single `<motion.p>` subtitle with the new three-line copy:

1. **Lead line** (italic, slightly larger): "Don't think of it as a cost. Think of it as a strategy."
2. **Savings line** (normal weight): "Typical Pro User Savings: **$140+/month** in found "lazy cash" and interest reduction."
3. **Goal line** (normal weight): "The Goal: We aim for Zero Hero to pay for its annual subscription within your first 30 days."

All three lines stay inside the same `motion.p`/`motion.div` block to preserve the existing fade-up animation. Use `space-y-2` to keep them tight. Bold the key metrics with `font-semibold text-foreground` to create emphasis against the `text-muted-foreground` base.

