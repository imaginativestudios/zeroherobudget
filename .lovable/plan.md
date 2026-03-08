

# Sync Onboarding Wizard: E2E Tests, Demo Data & Orphaned Components

## Issues Found

### 1. E2E Tests Out of Sync with Live UI
The `e2e/onboarding.spec.ts` references old "adventure" language that was replaced with the Stoic Wisdom voice:

| Test Expects | Actual UI |
|---|---|
| "Name Your Primary Debt Boss" | "Name Your Primary Debt" |
| "Set Your Moat Depth" | "Set Your Emergency Fund Goal" |
| "See My Freedom Path" button | "See My Payoff Timeline" button |
| "Enter the Fortress" button | "Go to Dashboard" button |

### 2. Orphaned MobileOnboardingCarousel
`src/components/MobileOnboardingCarousel.tsx` is **never imported or used anywhere** in the app. It still uses old gaming language ("Welcome to Zero Hero", "Pay Down Your Debt"). It should either be removed or integrated.

### 3. Subscription Model in PricingStep
The PricingStep pricing is **correct** — $5/mo and $50/yr with 7-day trial, matching `STRIPE_PRICES` in constants. No changes needed here.

---

## Plan

### File: `e2e/onboarding.spec.ts`
Update all assertions to match current Stoic Wisdom UI labels:
- `"Name Your Primary Debt Boss"` → `"Name Your Primary Debt"`
- `"Set Your Moat Depth"` → `"Set Your Emergency Fund Goal"`
- `"See My Freedom Path"` → `"See My Payoff Timeline"`
- `"Enter the Fortress"` → `"Go to Dashboard"`
- `"Custom"` → verify the custom goal selector still uses this label

### File: `src/components/MobileOnboardingCarousel.tsx`
**Delete** this orphaned component. It is not imported or rendered anywhere.

---

## Files to Modify

| File | Action |
|---|---|
| `e2e/onboarding.spec.ts` | Update test assertions to match current UI labels |
| `src/components/MobileOnboardingCarousel.tsx` | Delete (orphaned, unused component) |

