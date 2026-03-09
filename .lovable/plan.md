

# Add "Build Wealth" Step to Financial Journey

## Overview
Insert a new Step 5 — "Start Building Wealth" — between the current Step 4 (Emergency Fund) and Step 5 (Invest for the Future). This step focuses on exploring high-yield savings accounts and links to the existing `/wealth` page. Current steps 5 and 6 become 6 and 7.

## Changes

### 1. `src/lib/heroicVocabulary.ts`
- Add `journeyStep5_5` (or renumber): `'Start Building Wealth'`
- Add `wisdomWealth`: `'Let your money work as hard as you do.'`
- Renumber existing step 5 → 6, step 6 → 7 and their wisdom keys

### 2. `src/hooks/useJourneyProgress.ts`
- Add new step config at position 5 with icon `Wallet` (or `Landmark`), linking to `/wealth` with label "Explore High-Yield Savings"
- Completion logic: step is complete when user has a savings account with balance > 0, or has completed a "sweep" action (check `bdt_safety_floor` or savings account existence)
- Shift existing steps 5–6 to 6–7, update all array indices, `totalSteps` from 6 → 7
- Update the step 7 (Financial Freedom) prerequisite check to include the new step

### 3. `src/components/dashboard/GettingStartedChecklist.tsx`
- No changes needed unless we want a matching checklist item (optional, can be a follow-up)

### 4. `src/pages/Journey.tsx`
- Update the timeline connector logic (`step.id < 6` → `step.id < 7`)
- Update `totalSteps` references if hardcoded

