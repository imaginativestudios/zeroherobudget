## Profile persistence
- Stage pre-signup onboarding under the returned account ID and consume it before session state is exposed; this preserves confirmation-delayed setup without assigning drafts to unrelated accounts.
- Update profile fields through functional `useUserLocalStorage` setters using the latest account-scoped stored value, so consecutive onboarding saves and separate hook instances cannot overwrite unrelated fields with stale React state.
- Store optional referral attribution in Supabase user metadata at signup (including confirmation-delayed signup), or via updateUser during signed-in onboarding; attribution must never gate signup or grant privileges.
- Wake the secret-authenticated referral worker on new profile creation, with service-only receipts and provider idempotency; exclude pre-existing accounts, lease concurrent batches, arm five-minute retries only while pending, and disarm after drain or before the provider's 24-hour idempotency window expires so email failures never block signup or duplicate mail.

## Realtime listeners
- Give each subscription-status effect a unique channel name and clean up its own channel; Supabase reuses identical topics, so concurrent hooks must not attach callbacks to an already subscribed channel.

## Celebrations and offline updates
- Evaluate achievements only after account storage and debts load; persist monotonic celebration receipts before effects to prevent remount and concurrent-hook replays.
- Register the app-shell worker only through the guarded update hook; fetch navigation HTML network-first and exclude OAuth callbacks from caching.

## Legal footers
- Reuse LegalFooterNotice for page and Layout footers; PublicPageFooter covers standalone routes without an existing footer so each page has one copyright notice.

## Search metadata
- Keep route indexing in the app's shared Helmet metadata guard, allowing only public information pages; this covers private routes and removes noindex when navigating back to public pages.
- Set sitemap lastmod only from significant page-content changes, never a build or sitemap-generation timestamp, so dates remain trustworthy.
- Public educational guides use the shared SEO and standalone footer, with explicit public routes and sitemap entries, so they remain discoverable without entering the signed-in layout.

## Public payoff calculator
- Reuse the pure debt payoff engine with page-local React state only; report incomplete simulations without a payoff date and define work hours saved against the minimum-payment-only baseline so estimates remain comparable without storing visitor data.
- Default payoff simulations and schedules to a fixed original-minimums-plus-extra budget with rollover; explicitly disable rollover for the public calculator's minimum-only baseline so freed payments do not distort savings.
## Debt storage
- Debts live only in the account-scoped `debts` store; Debt Strategy and reports read it through `useDebtItems` (calculator shape), and the retired `bdt_debts` list is merged in once and removed, so every screen shows the same debts.

## Browser storage
- Access localStorage/sessionStorage only through `src/lib/safeStorage` helpers; browsers that block site data throw on access, which otherwise blanks the app.
