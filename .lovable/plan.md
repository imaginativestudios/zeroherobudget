
# Enhanced Dashboard: Emergency Fund Card, Debt Display, and AI Behavioral Hints

## Summary

This plan addresses three key improvements to the Dashboard experience:

1. **Extract Emergency Fund into its own card** with editable goal amount
2. **Add total debt amount to the Payoff Strategy card** that responds to simulator changes
3. **Introduce AI Behavioral Hints** that provide context-aware guidance based on user's financial situation

---

## Current State Analysis

### PayoffStrategyCard (Current)
- Contains Emergency Fund progress at the bottom (lines 308-325)
- Shows "Debt-Free By" date but not total debt amount
- Simulator only shows months/interest saved, not debt impact

### CommandCenter (Current)
- 3-column layout: Debts | Budget | Payoff Strategy
- Emergency Fund is hidden inside the Payoff Strategy card (poor visibility)
- No AI-powered behavioral hints

---

## Implementation Plan

### 1. Create New EmergencyFundCard Component

**New File:** `src/components/dashboard/EmergencyFundCard.tsx`

A dedicated card for the Emergency Fund with:
- Progress visualization with milestone markers (25%, 50%, 75%, 100%)
- Editable goal amount (inline click-to-edit pattern)
- Editable current balance (for manual updates)
- Clear visual hierarchy showing progress vs. goal
- Link to Budget page for allocation

**Key Features:**
```text
┌─────────────────────────────────────┐
│ 🏰 Emergency Fund                   │
│ "Your Financial Sanctuary"          │
├─────────────────────────────────────┤
│                                     │
│ Current:  [Click to Edit] $500      │
│ Goal:     [Click to Edit] $1,000    │
│                                     │
│ ═══════════█████████░░░░░░════════  │
│ ↑25%    ↑50%    ↑75%    ↑100%       │
│                                     │
│ 50% of goal • $500 remaining        │
│                                     │
│ [Add to Fund]  [View Budget →]      │
└─────────────────────────────────────┘
```

### 2. Update PayoffStrategyCard with Debt Amount Display

**File:** `src/components/dashboard/PayoffStrategyCard.tsx`

Add visible total debt amount that updates based on simulator settings:

**Changes:**
- Add `totalDebt` calculation for active debts
- Show current total debt in "Your Current Path" section
- Show simulated remaining debt after X months in "What-If Simulator" results
- Visual connection between debt amount and payoff timeline

**Updated "Your Current Path" section:**
```text
┌──────────────────────────────────┐
│ YOUR CURRENT PATH                │
├──────────────────────────────────┤
│ Total Debt:   $15,450            │  ← NEW
│ Debt-Free By: May 2028           │
│ 24 months • $2,450 interest      │
│ [Snowball Strategy]              │
└──────────────────────────────────┘
```

**Updated "What-If Simulator" results:**
```text
┌─────────────────────────────────┐
│ With these changes:             │
│                                 │
│ New Date:      Mar 2027         │
│ Time Saved:    14 months        │
│ Interest Saved: $890            │
│ Total Paid:    $16,010          │  ← NEW (total debt + simulated interest)
└─────────────────────────────────┘
```

### 3. Create AI Behavioral Hints Component

**New File:** `src/components/dashboard/BehavioralHintCard.tsx`

An intelligent hint system that analyzes user's financial state and provides mentor-style guidance:

**Hint Categories:**
1. **Emergency Fund Priority** - When moat < 25% complete and leftover > 0
2. **Debt Acceleration** - When moat > 75% complete and has high-interest debt
3. **Budget Opportunity** - When leftover is low but expenses could be reduced
4. **Strategy Optimization** - When Avalanche would save significantly more than current Snowball
5. **Celebration** - When milestones are achieved

**Hint Generation Logic:**
```typescript
interface BehavioralHint {
  id: string;
  type: 'opportunity' | 'warning' | 'celebration' | 'tip';
  title: string;
  message: string;
  action?: {
    label: string;
    route: string;
  };
  priority: number; // 1-10, higher = more important
}

function generateBehavioralHints(data: {
  moatProgress: number;
  moatTarget: number;
  moatCurrent: number;
  leftover: number;
  totalDebt: number;
  highestApr: number;
  strategy: 'Snowball' | 'Avalanche';
  avalancheSavings: number;
  survivalOverBudget: boolean;
}): BehavioralHint[]
```

**Example Hints:**

| Scenario | Hint |
|----------|------|
| Moat < 25%, leftover > $100 | "Your emergency fund needs attention. Consider directing your $X surplus here first for financial security." |
| Moat complete, high debt APR | "Your emergency fund is secure! Now you can aggressively attack that 24% APR debt." |
| Avalanche saves >$500 vs Snowball | "Switching to Avalanche strategy could save you $X in interest. Worth considering!" |
| Over budget on essentials | "Essential spending exceeded budget last week. Review expenses to free up more for your goals." |
| First debt paid off | "Congratulations! You've eliminated one debt. That freed-up payment is now extra firepower." |

### 4. Update CommandCenter Layout

**File:** `src/components/dashboard/CommandCenter.tsx`

Add the new EmergencyFundCard as a 4th element in the layout:

**Layout Change:**
```text
Desktop (4-column / 2x2 grid):
┌────────────┬────────────┬────────────┐
│  Debts     │  Budget    │  Strategy  │
├────────────┴────────────┴────────────┤
│         Emergency Fund Card          │  ← NEW (full width below)
├──────────────────────────────────────┤
│     AI Behavioral Hints Feed         │  ← NEW
└──────────────────────────────────────┘

Mobile (stacked):
[Debts]
[Budget]  
[Strategy]
[Emergency Fund]  ← NEW
[Behavioral Hints]  ← NEW
```

**Props Updates:**
- Add `onMoatCurrentChange` and `onMoatTargetChange` callbacks
- Pass through to EmergencyFundCard

### 5. Update Dashboard.tsx

**File:** `src/pages/Dashboard.tsx`

Wire up the new components:
- Import and render `EmergencyFundCard`
- Import and render `BehavioralHintCard`
- Connect moat update handlers from `useHeroProfile`

---

## Technical Details

### New Files

| File | Purpose |
|------|---------|
| `src/components/dashboard/EmergencyFundCard.tsx` | Standalone emergency fund tracker |
| `src/components/dashboard/BehavioralHintCard.tsx` | AI-driven behavioral hints display |
| `src/lib/behavioralHints.ts` | Hint generation logic and rules |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/PayoffStrategyCard.tsx` | Remove Emergency Fund section, add total debt display |
| `src/components/dashboard/CommandCenter.tsx` | Integrate EmergencyFundCard, pass moat callbacks |
| `src/pages/Dashboard.tsx` | Wire up new components and callbacks |

### Key Dependencies

- `useHeroProfile` hook provides `setMoatCurrent` and `setMoatTarget` for editing
- `EditableValue` component for inline editing
- `simulatePayoff` for debt calculations
- `calculateSurplusPower` from behavioral engine for hint context

---

## Behavioral Hint Generation Algorithm

```typescript
// Priority order for hints (show top 2)
1. CRITICAL: Moat vulnerable AND leftover > 0 → "Fund your emergency first"
2. HIGH: Avalanche saves >$1000 over Snowball → "Consider Avalanche strategy"
3. MEDIUM: Moat complete → "Ready to accelerate debt payoff"
4. MEDIUM: Survival budget exceeded → "Review essential spending"
5. LOW: General tips based on debt types (credit card vs loan advice)
6. CELEBRATION: Any milestone achieved recently
```

---

## UI/UX Considerations

### Emergency Fund Card
- Uses consistent `bg-white dark:bg-card` styling
- Progress bar with segment markers at 25%, 50%, 75%, 100%
- Castle/Shield icon to match existing "sanctuary" theme
- Inline edit pattern consistent with other dashboard values

### Behavioral Hints
- Collapsible card to reduce noise if user doesn't want hints
- Max 2 hints shown at a time (prioritized)
- Dismissable with "Got it" or "Not now" actions
- Uses Lightbulb/Sparkles icon for mentor-like appearance
- Subtle animation on appearance

### Payoff Strategy Card
- Total debt shown prominently in the "Current Path" section
- Simulated total (debt + interest) shown in results panel
- Creates clear connection between debt amount and timeline

---

## Expected Outcomes

1. **Clearer Mental Model**: Users see Emergency Fund as a distinct goal, not buried in debt payoff
2. **Actionable Debt Visibility**: Total debt amount creates urgency and shows simulator impact
3. **Proactive Guidance**: AI hints help users make better allocation decisions
4. **Increased Engagement**: Personalized tips feel like having a financial coach
