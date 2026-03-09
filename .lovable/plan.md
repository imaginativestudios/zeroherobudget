# Add ROI "Pro Tip" Card to Pricing Page

Add a visually polished value-proposition card at the top of the page under title. This dismantles the "another subscription" objection with concrete ROI numbers.

## Design

A single card with a `Lightbulb` icon header, warm accent border-left treatment (matching `TipOfTheDay` pattern), and staggered stat callouts. Uses the existing `InlineAlert` or a custom layout with three highlighted metrics.

## Implementation — `src/pages/Pricing.tsx`

Insert a new `motion.div` at the top of the page under the header:

- **Card structure**: accent left-border card with `Lightbulb` icon + "Pro Tip" label
- **Headline**: "Wait, is this app a bill or an investment?"
- **Three stat callouts** in a responsive grid (`grid-cols-1 md:grid-cols-3`):
  - `$47` — Lazy Cash identified in first 14 days
  - `4 months` — Debt payoff timeline reduced
  - `$1,200+` — Interest savings with Avalanche Strategy
- **Closing line**: "Zero Hero is designed to pay for itself 10x over."
- Animate in with `framer-motion` fade-up, delayed after the CTA
- Import `Lightbulb`, `TrendingUp` from lucide-react

### Single file change

- `src/pages/Pricing.tsx` — add ~40 lines of JSX between subscribe button and trust badges