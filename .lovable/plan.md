## Hybrid Beta Access System

Combine a Supabase-backed eligibility flag (source of truth) with a per-device localStorage toggle for UI visibility.

### 1. Database
Add `beta_access` boolean column to `profiles` (default `false`). Admins can flip it per user from the Supabase dashboard or a future admin UI. RLS already restricts profile reads/writes to the owner, so no policy changes are needed for the user-facing read.

### 2. New hook: `useBetaAccess`
Single source of truth used everywhere (`RootPage`, `BetaTesterBadge`, future settings toggle):

- `eligible` — from `profiles.beta_access` (server) OR legacy `?beta=true` localStorage flag for unauthenticated visitors
- `enabledOnDevice` — from `localStorage["beta_ui_enabled"]` (defaults to `true` when eligible)
- `isBeta` = `eligible && enabledOnDevice`
- `enable()` / `disable()` — toggle device-level flag
- URL params still work: `?beta=true` sets device flag on, `?beta=false` sets it off

### 3. RootPage
Replace direct `localStorage` read with `useBetaAccess().isBeta`. Logged-in beta-eligible users see Landing automatically on any device.

### 4. BetaTesterBadge
Use the same hook. Badge appears whenever `isBeta` is true, regardless of how it was enabled.

### 5. Settings UI (small addition)
Add a "Beta features" toggle in `AccountSettings` — only visible when `eligible` is true. Lets the user hide/show beta UI on the current device without losing eligibility.

### 6. Migration path
- Existing users with `localStorage["beta_access"] === "true"` keep working (treated as device opt-in).
- Granting beta to a user = set `profiles.beta_access = true` in Supabase. They get it on every device automatically.
- Revoking = set it back to `false`.

### Files touched
- migration: add `beta_access` column to `profiles`
- new: `src/hooks/useBetaAccess.ts`
- edit: `src/pages/RootPage.tsx`, `src/components/BetaTesterBadge.tsx`, `src/pages/AccountSettings.tsx`
- update `useRealProfile` / `Profile` type to include `beta_access`
