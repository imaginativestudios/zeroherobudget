

# Improve Payoff Strategy Card UX

## Current State Analysis

The Payoff Strategy card in the Command Center currently mixes two concepts without clear visual separation:

### What it shows now:
1. **Current Situation**: Debt-Free Date display with strategy badge (Snowball/Avalanche)
2. **Strategy Comparison**: Small text insight showing interest difference between strategies  
3. **What-If Calculator**: Embedded FreedomSlider for extra payment scenarios
4. **Emergency Fund**: Mini progress bar for savings goal

### Problems identified:
- **No clear visual hierarchy** between "current reality" and "simulator"
- Strategy selection is disabled on Dashboard (must go to /debts page to change)
- Users can't easily toggle between Snowball/Avalanche to see real-time impact
- The comparison insight is buried in small text below the date
- The FreedomSlider only shows extra payment impact, not strategy change impact

---

## Proposed Solution

Restructure the card into **two clearly defined sections**:

### Section 1: "Your Current Path" (Top)
Shows the user's actual current debt payoff situation based on their current strategy and budget.

**Contents:**
- Large "Debt-Free By" date with current strategy badge
- Total interest you'll pay (displayed prominently)
- Months to freedom count

### Section 2: "What-If Simulator" (Bottom)
Interactive tools to explore how changes affect their payoff timeline.

**Contents:**
- Strategy toggle (Snowball ↔ Avalanche) with instant recalculation
- Extra payment slider (existing FreedomSlider)
- Live comparison showing: time saved, interest saved, new date

---

## Implementation Details

### File: `src/components/dashboard/CommandCenter.tsx`

**Changes to Column 3 (Payoff Strategy card):**

1. **Add local state for simulated strategy**
   ```tsx
   const [simulatedStrategy, setSimulatedStrategy] = useState<'Snowball' | 'Avalanche'>(strategy);
   const [simulatedExtra, setSimulatedExtra] = useState(0);
   ```

2. **Create two visual sections:**

   **Section A - "Your Current Path":**
   ```text
   ┌────────────────────────────────┐
   │  📅 Debt-Free By               │
   │  ┌──────────────────────────┐  │
   │  │       May 2028           │  │
   │  │    24 months remaining   │  │
   │  │  [Snowball] Strategy     │  │
   │  └──────────────────────────┘  │
   │                                │
   │  Total Interest: $2,450        │
   └────────────────────────────────┘
   ```

   **Section B - "What-If Simulator":**
   ```text
   ┌────────────────────────────────┐
   │  🔧 What-If Simulator          │
   │                                │
   │  Strategy:                     │
   │  [Snowball] [Avalanche]        │
   │                                │
   │  Extra Payment:                │
   │  ──●──────────────── $150/mo   │
   │                                │
   │  ┌─────────────────────────┐   │
   │  │ 📈 If you make these     │  │
   │  │    changes:              │  │
   │  │                          │  │
   │  │ New Date:   Mar 2027     │  │
   │  │ Time Saved: 14 months    │  │
   │  │ Interest Saved: $890     │  │
   │  └─────────────────────────┘   │
   └────────────────────────────────┘
   ```

3. **Strategy Toggle Component:**
   - Inline toggle buttons (similar to DebtSnowball page but compact)
   - Changing the simulated strategy instantly recalculates projected outcomes
   - Clear visual feedback showing this is a "what-if" not a permanent change

4. **Unified Comparison Panel:**
   - Shows the delta between current path and simulated scenario
   - Updates live as user adjusts strategy or extra payment
   - Highlights savings in an accent color

5. **Apply Changes Action (Optional):**
   - If the user likes what they see in the simulator, provide a way to apply the strategy change
   - Or direct them to the full Debt Strategy page for more options

---

## Technical Changes

### File: `src/components/dashboard/CommandCenter.tsx`

| Line Range | Change |
|------------|--------|
| 40-63 | Add `simulatedStrategy` state and comparison calculations |
| 368-446 | Restructure the Payoff Strategy card content |

### New calculations needed:
```tsx
// Calculate impact of simulated changes
const simulatedImpact = useMemo(() => {
  if (activeDebts.length === 0) return null;
  
  // Current scenario
  const current = simulatePayoff(debtItems, leftover, strategy);
  
  // Simulated scenario
  const simulated = simulatePayoff(debtItems, leftover + simulatedExtra, simulatedStrategy);
  
  return {
    currentDate: current.timeline[current.timeline.length - 1]?.label,
    currentMonths: current.timeline.length,
    currentInterest: current.totalInterest,
    newDate: simulated.timeline[simulated.timeline.length - 1]?.label,
    newMonths: simulated.timeline.length,
    newInterest: simulated.totalInterest,
    monthsSaved: current.timeline.length - simulated.timeline.length,
    interestSaved: current.totalInterest - simulated.totalInterest,
    hasChanges: simulatedStrategy !== strategy || simulatedExtra > 0,
  };
}, [debtItems, leftover, strategy, simulatedStrategy, simulatedExtra]);
```

---

## Visual Hierarchy

The card will use clear visual separation:

```
┌─────────────────────────────────────┐
│ 📅 Payoff Strategy                  │
│ "See your path to freedom"          │
├─────────────────────────────────────┤
│                                     │
│  YOUR CURRENT PATH                  │ ← Muted background
│  ────────────────                   │
│  Debt-Free: May 2028                │
│  24 months • $2,450 interest        │
│  [Snowball Strategy]                │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  WHAT-IF SIMULATOR                  │ ← Interactive section
│  ────────────────                   │
│  Try a different strategy:          │
│  [Snowball] [Avalanche]             │
│                                     │
│  Add extra payment:                 │
│  ───●───────────── $150             │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ With these changes:         │    │ ← Results highlight
│  │ Mar 2027 (-14 mo, -$890)    │    │
│  └─────────────────────────────┘    │
│                                     │
│  [View Full Strategy →]             │
└─────────────────────────────────────┘
```

---

## Mobile Considerations

- Strategy toggle uses compact buttons that stack on mobile if needed
- Extra payment slider remains full-width for easy thumb interaction
- Results panel remains visible with reduced padding
- Emergency fund section moves below the simulator (or is removed from this card and shown elsewhere)

---

## Files to Modify

| File | Purpose |
|------|---------|
| `src/components/dashboard/CommandCenter.tsx` | Main card restructure |

---

## Expected Outcomes

1. **Clear mental model**: Users understand "this is my current situation" vs "this is what could happen"
2. **Interactive exploration**: Users can toggle strategy and see instant impact without leaving the dashboard
3. **Motivation**: Seeing potential savings encourages users to take action
4. **Reduced confusion**: No more mixing static data with interactive simulators

