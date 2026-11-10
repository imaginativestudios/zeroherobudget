## Profile persistence
- Stage pre-signup onboarding under the returned account ID and consume it before session state is exposed; this preserves confirmation-delayed setup without assigning drafts to unrelated accounts.
- Update profile fields through functional `useUserLocalStorage` setters using the latest account-scoped stored value, so consecutive onboarding saves and separate hook instances cannot overwrite unrelated fields with stale React state.

## Realtime listeners
- Give each subscription-status effect a unique channel name and clean up its own channel; Supabase reuses identical topics, so concurrent hooks must not attach callbacks to an already subscribed channel.

## Celebrations and offline updates
- Evaluate achievements only after account storage and debts load; persist monotonic celebration receipts before effects to prevent remount and concurrent-hook replays.
- Register the app-shell worker only through the guarded update hook; fetch navigation HTML network-first and exclude OAuth callbacks from caching.

## Legal footers
- Reuse LegalFooterNotice for page and Layout footers; PublicPageFooter covers standalone routes without an existing footer so each page has one copyright notice.