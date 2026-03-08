

# Plan: Simplify Behavioral Engine into Single Module

## Goal
Collapse 4 files (`behavioralEngine.ts`, `behavioralTriggers.ts`, `freedomEngine.ts`, `recoveryEngine.ts`) into a single `src/lib/debtInsights.ts` module exposing 2 user-facing concepts: **Shadow Cost** and **Freedom Date**.

## What stays, what goes

**Keep** (moves into `debtInsights.ts`):
- `calculateShadowCost()` — core shadow cost math
- `getHighestInterestRate()` — needed by shadow cost
- `getSurvivalCategories()` — used by trigger context + dashboard
- `calculateFreedomImpact()` — freedom date projection
- `translateToHumanTime()` — human-readable time from interest savings
- `calculateSliderImpact()` — powers the FreedomSlider component
- `calculateTrueCost()` — powers ShadowImpactCard
- `calculateSurplusPower()` — used by SurplusPowerCard + dashboard
- `checkBudgetCompliance()` — used by dashboard tips
- Trigger utilities: `canTrigger`, `isDiscretionaryCategory`, `calculateFreedomDateDelay`, `formatTriggerCurrency`, `getStoredTriggerState`, `updateTriggerState`, cooldown constants, storage keys
- Recovery: `calculateRecoveryState`, `calculateRepairPlan`, `getDiscretionaryExpenses`, `formatRepairTimeline`, `getStatusMessage`

**Remove** (over-engineered, low user value):
- `calculateParticipation()` — 40% of consistency score, complex 7-day window tracking
- `calculateBudgetAdherence()` — 40% of consistency score, weekly survival budget ratio
- `calculateMomentum()` — 20% of consistency score, paid debts counter
- `calculateConsistencyScore()` (legacy streak-based)
- `calculateEnhancedConsistencyScore()` — the 3-factor weighted formula
- `shouldLevelUp()` — depends on consistency score
- `CONSISTENCY_WEIGHTS` constant
- All `ConsistencyScoreResult` and `EnhancedConsistencyScoreResult` interfaces

## Implementation Steps

### 1. Create `src/lib/debtInsights.ts`
Single file containing all kept functions organized in 4 sections:
- **Shadow Cost** — `calculateShadowCost`, `getHighestInterestRate`, `calculateTrueCost`
- **Freedom Date** — `calculateFreedomImpact`, `translateToHumanTime`, `calculateSliderImpact`
- **Budget Health** — `calculateSurplusPower`, `checkBudgetCompliance`, `getSurvivalCategories`, recovery functions
- **Trigger Utilities** — cooldowns, storage keys, `canTrigger`, `isDiscretionaryCategory`, etc.

### 2. Simplify `useBehavioralEngine.ts` hook
- Remove consistency score calculation, streak tracking, `StoredStreakData`, `shouldLevelUp`
- Keep: `surplusPower`, `budgetCompliance`, `highestInterestRate`, `getShadowCost`, `shadowAlerts`
- Simplify `heroTips` to 2-3 tips max (surplus power + budget compliance + shadow budget)
- Remove dependency on `useHeroProfile` for `activityLog`/`recordDailyActivity`

### 3. Simplify `BehavioralTriggerContext.tsx`
- Remove Trigger C (Strategy Pivot — depends on 30-day streak)
- Remove Trigger D (Level Up — depends on consistency score > 75)
- Keep Trigger A (Shadow Cost) and Trigger B (Surplus Strike) — these are the 2 high-value nudges
- Remove `LevelUpModal` and `StrategyPivotDialog` renders

### 4. Update all imports (10 files)
Repoint all imports from the 4 old files to `@/lib/debtInsights`:
- `src/hooks/useBehavioralEngine.ts`
- `src/contexts/BehavioralTriggerContext.tsx`
- `src/pages/Dashboard.tsx`
- `src/components/behavioral/ShadowImpactCard.tsx`
- `src/components/behavioral/ShadowCostToast.tsx`
- `src/components/behavioral/SurplusStrikeModal.tsx`
- `src/components/behavioral/FreedomSlider.tsx`
- `src/components/behavioral/FreedomTimelineWidget.tsx`
- `src/components/onboarding/AhaMomentStep.tsx`
- `src/components/dashboard/StrikePaymentModal.tsx`
- `src/hooks/useMoatStatus.ts`
- `src/components/defense/RegroupingBanner.tsx`

### 5. Delete old files
- `src/lib/behavioralEngine.ts`
- `src/lib/behavioralTriggers.ts`
- `src/lib/freedomEngine.ts`
- `src/lib/recoveryEngine.ts`

### 6. Clean up removed trigger components
- Remove `LevelUpModal` from `BehavioralTriggerContext` (keep component file for now — it may be useful later with a simpler trigger condition)
- Remove `StrategyPivotDialog` render from context
- Update `IntelFeed` if it references consistency score unlocking

## Files changed
- **Created**: `src/lib/debtInsights.ts`
- **Edited**: `useBehavioralEngine.ts`, `BehavioralTriggerContext.tsx`, + 10 import-only updates
- **Deleted**: 4 old engine files

## Risk
Low. The consistency score is only displayed in `StreakTrackerWidget` (via `useBehavioralEngine`). The strategy pivot/level-up modals are triggered by consistency thresholds that most users never reach. Shadow cost and freedom date — the two features that actually connect spending to consequences — are fully preserved.

