## Profile persistence
- Update profile fields through functional `useUserLocalStorage` setters using the latest account-scoped stored value, so consecutive onboarding saves and separate hook instances cannot overwrite unrelated fields with stale React state.

## Realtime listeners
- Give each subscription-status effect a unique channel name and clean up its own channel; Supabase reuses identical topics, so concurrent hooks must not attach callbacks to an already subscribed channel.