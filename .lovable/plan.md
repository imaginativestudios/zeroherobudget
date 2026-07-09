## Goal

Make it obvious at a glance which pages real users see vs. which are for you (dev, admin, pre-launch). Nothing gets deleted — anything stale is moved to `src/pages/_archive/` and de-routed; anything internal-but-live is moved to `src/pages/internal/` under a `/internal/*` route prefix.

## Page audit

**Live user pages (stay put — no changes)**
Dashboard, Journey, Budget, DebtSnowball, Transactions, Accounts, Wealth, DataManagement, Achievements, FinancialTips, Reports (+ reports/*), Household, Subscriptions, AccountSettings, SubscriptionStatus, Auth, ResetPassword, Onboarding, Landing, Pricing, CheckoutSuccess, AcceptInvite, PrivacyPolicy, TermsOfService, Legal, HelpSupport, DataPrivacyFAQ, Install, NotFound.

**Move to `src/pages/internal/` — routes become `/internal/*`**
- `IconStyleGuide.tsx` → `/internal/style-guide/icons` (was `/style-guide/icons`)
- `ColorPaletteGuide.tsx` → `/internal/style-guide/colors` (was `/style-guide/colors`)
- `SiteMap.tsx` → `/internal/sitemap` (was `/sitemap`)
- `ComingSoon.tsx` → `/internal/coming-soon` (was rendered by `/` via RootPage; kept reachable for preview)
- `JoinBeta.tsx` → `/internal/join-beta` (was `/join`; add redirect from `/join` so any existing invite links still land)
- `Unavailable.tsx` → `/internal/unavailable` (was `/unavailable`; geo-check redirect target updated)
- `AdminHub.tsx`, `AdminLogin.tsx`, `AdminWaitlist.tsx`, `AdminBetaCodes.tsx` → keep `/admin/*` routes (admin URLs are already clearly namespaced), but move the files into `src/pages/internal/admin/` so the file tree matches.

**Move to `src/pages/_archive/` — remove from router**
- `Index.tsx` — not imported anywhere in `App.tsx`, only re-exports `ComingSoon`. Dead file.

Anything else that turns up as unused during the move (checked via `rg` for imports) gets archived the same way with a note in the PR.

## Router changes (`src/App.tsx`)

- Update imports to new paths (`@/pages/internal/...`, `@/pages/internal/admin/...`).
- Rename public routes to `/internal/*` per list above.
- Add redirects so nothing 404s for existing links/bookmarks:
  - `/style-guide/icons` → `/internal/style-guide/icons`
  - `/style-guide/colors` → `/internal/style-guide/colors`
  - `/sitemap` → `/internal/sitemap`
  - `/join` → `/internal/join-beta`
  - `/unavailable` → `/internal/unavailable`
- `RootPage.tsx` keeps rendering `ComingSoon` inline for the `/` gate — the `/internal/coming-soon` route is just so you can preview it directly.
- Update `useGeoAccess` (or wherever `/unavailable` is navigated to) to point at `/internal/unavailable`.

## Naming convention

- **Folder** `src/pages/internal/` = "not part of the normal end-user flow" (dev tools, admin, pre-launch gates).
- **Route prefix** `/internal/*` = same signal in the URL bar so you can tell instantly during QA.
- **Folder** `src/pages/_archive/` = kept for reference, not routed, not imported. Underscore prefix sorts it to the top of the file tree.

## Verification

- `rg "from \"@/pages/"` to confirm no stale imports.
- Click through `/dashboard`, `/budgets`, `/debts`, `/transactions`, `/accounts`, `/reports`, `/pricing`, `/auth` → all still load.
- Visit `/internal/style-guide/icons`, `/internal/sitemap`, `/internal/coming-soon`, `/admin` → all load.
- Visit old paths (`/sitemap`, `/join`, `/style-guide/icons`) → redirect cleanly to new paths.
- `tsgo` passes.

## Out of scope

- No changes to page contents, styles, or business logic.
- No changes to how demo mode (localStorage) works inside real user pages like Dashboard — that's a mode, not a separate page.
- No SEO/metadata changes for the moved routes (they're internal; robots already excludes admin).
