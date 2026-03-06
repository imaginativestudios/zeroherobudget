

# Route "Explore Demo" Through Demo Onboarding

## Problem
Currently, clicking "Explore Demo" on the Coming Soon page loads demo data and jumps straight to `/dashboard`, skipping the onboarding wizard entirely. Users miss the guided experience that teaches them the app's value proposition.

## Solution
Instead of loading demo data immediately, navigate to `/onboarding?demo=true`. The onboarding wizard will detect the `demo` query param and:
1. Pre-fill steps with demo values (hourly wage, debt, moat target) so users see a populated experience
2. Skip the Pricing step (step 5) entirely — go straight from Aha Moment (step 4) to Ceremony (step 6)
3. Load full demo data at the end (ceremony step) before entering dashboard

## Files to Modify

### `src/pages/ComingSoon.tsx`
- Replace both "Explore Demo" button handlers: instead of calling `loadDemoData()` + navigating to `/dashboard`, simply `navigate('/onboarding?demo=true')`

### `src/hooks/useOnboardingState.ts`
- Detect `demo=true` search param
- Add `isDemoMode` flag to the return value
- Pre-fill `data` state with demo values when in demo mode (e.g., hourlyWage: 25, primaryDebt with sample values, moatTarget: 1000)
- Modify `showPricing` to skip step 5 and go directly to `showCeremony` when in demo mode
- Modify `enterDashboard` to call `loadDemoData()` before navigating when in demo mode

### `src/pages/Onboarding.tsx`
- Use `isDemoMode` from the hook to show a subtle "Demo Mode" indicator (small badge near the step indicator)
- On step 3 "next" handler: when `isDemoMode`, call `showAhaMoment` flow that skips pricing

### `src/components/onboarding/AhaMomentStep.tsx`
- When in demo mode, change the CTA button text from "See My Payoff Timeline" to something like "Continue to Demo" and wire it to skip pricing

## Flow Comparison

```text
Current:  ComingSoon → loadDemoData() → /dashboard
Proposed: ComingSoon → /onboarding?demo=true → Steps 1-3 (pre-filled) → Step 4 (Aha) → Step 6 (Ceremony) → loadDemoData() → /dashboard
```

Users can still click through quickly since fields are pre-filled, but they experience the guided onboarding and understand the app's value before seeing the dashboard.

