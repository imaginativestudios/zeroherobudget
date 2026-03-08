

## Debt Crusher Simulator & Coach Agent

### What exists today
- **FreedomSlider** already simulates extra payment impact on freedom date
- **Compare tab** shows Snowball vs Avalanche side-by-side
- **Coach banner** gives a single static message based on strategy comparison
- The calculation engine (`debtCalculations.ts`, `debtInsights.ts`) is robust

### What's missing
1. A unified **Simulator** where users can toggle strategy AND adjust extra payment in one place, seeing real-time changes to total interest, months to payoff, and a visual timeline — all in a single interactive panel
2. A **Coach Agent** that analyzes the user's debt profile and gives specific, actionable tips (not just strategy comparison)

---

### Plan

#### 1. Add a "Simulator" tab to the Debt Crusher page

Add a fourth tab called "Simulator" (icon: `SlidersHorizontal`) to the existing tab bar. This tab contains:

- **Strategy toggle** (Snowball/Avalanche) — independent from the main strategy so users can "what-if" without committing
- **Extra payment slider** (reuse Slider component, $0–$1,000 range, $25 steps)
- **Real-time results panel** showing:
  - Total Interest Paid
  - Debt-Free Date
  - Months to Payoff
  - Comparison vs. current plan (interest saved, months saved)
- **Timeline chart** (LineChart) overlaying baseline vs. simulated scenario
- **"Apply This Plan" button** that commits the simulated strategy and shows a toast

All calculations use existing `calculatePayoffPlan` and `simulatePayoff` — no new engine code needed.

#### 2. Add a Coach Agent card inside the Simulator tab

Below the simulator controls, render a **"Your Coach Says"** card with 3–5 prioritized, contextual tips. Create a new function `generateDebtCoachTips(debts, extraBudget, strategy)` in `debtInsights.ts` that returns an ordered array of tip objects based on:

- **High-APR alert**: If any debt has APR > 20%, suggest targeting it or balance transferring
- **Small balance quick win**: If any debt < $500, suggest knocking it out for momentum
- **Extra payment impact**: "Adding just $X/mo saves you $Y in interest"
- **Refinance opportunity**: If total debt > $10k and avg APR > 15%, suggest consolidation
- **Snowball motivation**: If user is on Snowball, acknowledge the psychological benefit
- **Round-up suggestion**: "Rounding your $X minimum to $Y saves Z months"

Each tip has an icon, title, and description. Rendered as a vertical list of compact cards.

#### 3. File changes

| File | Change |
|---|---|
| `src/lib/debtInsights.ts` | Add `generateDebtCoachTips()` function |
| `src/pages/DebtSnowball.tsx` | Add "Simulator" tab with strategy toggle, slider, results panel, overlaid chart, coach tips section |

No database changes needed — all client-side simulation.

