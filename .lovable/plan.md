## Verify + Simplify the Current Stripe Setup

Goal: confirm payments work end-to-end and trim the maintenance surface — without migrating off your external Supabase project (which would be required for Lovable's built-in payments and isn't worth the cost).

---

### Part A — Verification (you + me)

I'll review code paths and produce findings; you'll confirm a few dashboard-only items.

**Code-side checks I will run:**
1. Read `stripe-webhook`, `check-subscription`, `create-checkout`, `customer-portal`, `trial-reminder` end-to-end
2. Confirm webhook signature verification, idempotency, and that all four events update `profiles` correctly
3. Confirm `useSubscriptionStatus` + realtime profile subscription wires correctly into `Pricing`, `AccountSettings`, `CheckoutSuccess`
4. Confirm `create-checkout` trial-abuse prevention logic is sound
5. Use the live Stripe tools to list current Products / Prices / active Subscriptions and confirm the hardcoded Price IDs (`price_1T8uXbLOOLpslU1kYziRovGh`, `price_1T8uY7LOOLpslU1kOaOq6kVT`) still exist and match the displayed $5/mo and $50/yr
6. Pull recent `stripe-webhook` logs to confirm events are arriving and being processed without errors

**Dashboard checklist for you (I'll deliver as a checklist):**
- Stripe → Developers → Webhooks: endpoint pointing at the deployed `stripe-webhook` URL, subscribed to `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, signing secret matches `STRIPE_WEBHOOK_SECRET`
- Stripe → Settings → Billing → Customer Portal: activated and configured
- Stripe key mode (test vs live) matches the Price IDs' mode
- Supabase secret `ENVIRONMENT=production` so `test-subscription` is blocked in prod
- pg_cron job for `trial-reminder` is scheduled (or external scheduler) with the `x-cron-secret` header
- Custom domain `pay.zeroherobudget.com` DNS records still healthy

**Output:** a short pass/fail report with any fixes needed.

---

### Part B — Simplification (since you said "drop nice-to-haves to simplify")

Concrete deletions and consolidations to reduce code:

**1. Remove `test-subscription` entirely**
- Delete `supabase/functions/test-subscription/`
- Remove the "Development Testing" section + handlers from `src/pages/AccountSettings.tsx`
- Remove the entry from `supabase/config.toml`
- Net: ~153 lines of edge function + dev UI gone; you keep real Stripe test mode for testing

**2. Remove the custom checkout domain**
- Stop relying on `pay.zeroherobudget.com` for Stripe Checkout (use Stripe's default checkout domain)
- You can leave the DNS records in place or remove them; either way no app code change beyond removing references in any docs
- Net: one less moving piece (DNS + Stripe domain config) to maintain

**3. Remove the `trial-reminder` cron + email**
- Delete `supabase/functions/trial-reminder/` and its `_templates/trial-ending-reminder.tsx`
- Stripe automatically emails customers about trial end via "Customer emails" in Stripe Settings → Billing — enable that instead
- Remove pg_cron job (separate manual SQL via migration)
- Remove `CRON_SECRET` from secrets if not used elsewhere (I'll check first)
- Net: ~171 lines + email template + cron infra gone

**4. Simplify the branded `/checkout-success` page**
- Keep the page (it's just a redirect target), but remove the confetti library + heavy animations if they're unused elsewhere
- Reduces bundle size; success page becomes a simple confirmation
- (Optional — flag for your call before deleting)

**5. Trim `stripe-webhook` transactional emails (optional)**
- Currently sends Welcome / Payment Failed / Cancellation via Resend
- Stripe can send all of these natively (Settings → Billing → Customer emails)
- If you enable Stripe's emails, we can delete `subscription-welcome.tsx`, `payment-failed.tsx`, `subscription-canceled.tsx` and the Resend calls from `stripe-webhook` → keeps webhook focused purely on DB sync
- (Optional — flag for your call; some teams prefer their own templates)

**6. Bump pinned Stripe SDK versions**
- `stripe-webhook` uses `stripe@14.21.0` + apiVersion `2023-10-16`
- Other functions use `stripe@18.5.0` + `2025-08-27.basil`
- Align them all to the newer version for consistency

---

### What stays

- `create-checkout`, `check-subscription`, `customer-portal`, `stripe-webhook` (slimmed)
- `useSubscriptionStatus` hook + realtime profile subscription
- Pricing page, Account Settings subscription card, sidebar "Manage Subscription" link
- `profiles` subscription columns and RLS

---

### Files changed (Part B)

**Deleted:**
- `supabase/functions/test-subscription/index.ts`
- `supabase/functions/trial-reminder/index.ts`
- `supabase/functions/trial-reminder/_templates/trial-ending-reminder.tsx`
- (Optional) `supabase/functions/stripe-webhook/_templates/*.tsx`

**Edited:**
- `src/pages/AccountSettings.tsx` — remove dev testing section
- `supabase/config.toml` — remove `[functions.test-subscription]` and `[functions.trial-reminder]`
- `supabase/functions/stripe-webhook/index.ts` — bump Stripe SDK; optionally remove email sends
- (Optional) drop `canvas-confetti` from `src/pages/CheckoutSuccess.tsx`

**Migration:**
- One SQL migration to drop the pg_cron job for `trial-reminder` (if it exists)

---

### Order of operations

1. I run Part A verification first and report findings
2. You confirm dashboard checklist
3. I implement Part B deletions in one batch, you review
4. We do a single end-to-end test in Stripe test mode (checkout → webhook → profile update → portal → cancel)

If any Part A check fails, we fix it before deleting anything in Part B.