# Launch Readiness Plan — Zero Hero Budget

The product is feature-complete. What's left is mostly **environment switches, hardening, and go-live ops** — not new features. Here's what to ship.

---

## 1. Plaid: move from Sandbox → Production

Currently all three Plaid edge functions hardcode `https://sandbox.plaid.com`:
- `create-link-token`
- `exchange-plaid-token`
- `sync-plaid-transactions`

Steps:
- Apply for Plaid Production access (requires their compliance review — can take days).
- Replace `PLAID_BASE` with an env-driven value (`PLAID_ENV` → `sandbox` | `development` | `production`).
- Add Production `PLAID_CLIENT_ID` / `PLAID_SECRET` (or swap the existing secrets).
- Whitelist the production redirect URI in Plaid dashboard.
- Re-test Link → exchange → sync end-to-end with a real bank.

## 2. Stripe: confirm live mode

- Verify Stripe account is fully activated (not test mode).
- Confirm live `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY` are the live keys.
- Verify `STRIPE_WEBHOOK_SECRET` is bound to the **live** webhook endpoint, with events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
- Run one real $5/mo and one $50/yr purchase end-to-end, then cancel via Customer Portal.
- Confirm `pay.zeroherobudget.com` resolves and serves Stripe Checkout.

## 3. Remove the Coming Soon wall

- `src/pages/ComingSoon.tsx` and the `?beta=true` bypass currently gate the public site.
- Decide launch moment, then route `/` to the real app (or keep ComingSoon as `/waitlist`).
- Remove or repurpose `subscribe-waitlist` flow if no longer needed.

## 4. Security & data hardening

- Run the Supabase linter; resolve any ERROR-level findings (the recent migration surfaced 40 warnings — most are GraphQL anon-exposure WARNs worth reviewing).
- Run a fresh security scan and fix any HIGH findings.
- Confirm `plaid_items.access_token` cannot be selected by `authenticated` (already revoked — verify in prod).
- Confirm `CRON_SECRET` is set and the daily Plaid sync cron is firing (check `cron.job_run_details`).
- Verify no `service_role` key reaches the browser bundle.

## 5. Email deliverability

- Confirm Resend domain DKIM/SPF/DMARC are green for the sender domain.
- Send a real signup confirmation, password reset, invitation, deletion code, and trial reminder — confirm inbox delivery (not spam).

## 6. Legal, billing, and trust

- `/legal` Terms + Privacy reviewed and dated.
- Disclaimers on AI tips visible and current.
- Trial reminder cron job verified (memory: `automated-trial-reminders-cron`).
- Refund/cancellation language matches Stripe Customer Portal behavior.

## 7. Pre-launch QA pass

A short scripted run-through on a clean account:
1. Sign up → email confirm → onboarding.
2. Connect a real bank via Plaid → see accounts + transactions populated.
3. Set up budget + a debt → log a transaction → debt balance updates.
4. Start trial → upgrade to paid → manage in Customer Portal → cancel.
5. Invite a household member → accept → confirm shared data view.
6. Install PWA on iOS + Android, test offline banner, pull-to-refresh.
7. Mobile swipe nav across Dashboard → Budget → Debts → Transactions.

## 8. Observability for day 1

- Confirm edge function logs are accessible and you know where to look (Stripe webhook, Plaid sync, auth-email-hook).
- Optional: hook a simple uptime monitor at `/` and at one edge function.
- Optional: add Lovable Analytics review cadence (daily for week 1).

## 9. Marketing & distribution (non-code)

- Publish the project (Update in publish dialog) so latest frontend is live.
- Confirm `zeroherobudget.com` + `www.` both resolve and primary is set.
- Social/launch assets, App Store/Play Store listings if applicable, Chrome extension submission (ZIP release kit already exists — memory: `chrome-release-kit-system`).

---

## Suggested order

1. Plaid Production access (longest lead time — start now).
2. Stripe live verification + live test purchase.
3. Security + linter cleanup.
4. Email deliverability check.
5. QA pass on a fresh account.
6. Remove Coming Soon → publish → announce.

If you want, pick any item above and I'll execute it next (e.g., "make Plaid env-driven", "run the security scan", or "remove the Coming Soon wall").
