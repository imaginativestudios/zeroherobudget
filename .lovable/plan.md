

# Update Remaining Hardcoded Pricing Reference

## Finding
The onboarding pricing step (`PricingStep.tsx`) and main Pricing page already use `STRIPE_PRICES` constants — they're already showing $12/month and $99/year correctly.

There is **one hardcoded reference** that needs updating:

### `src/components/AuthModal.tsx` (line 206)
Currently says: `"7 days free, then just $5/month"`
Change to: `"7 days free, then just $12/month"`

Better yet, import `STRIPE_PRICES` from constants and use `${STRIPE_PRICES.monthly.amount}` so it stays in sync automatically.

That's the only change needed — everything else is already dynamic.

