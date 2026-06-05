## Goal
Make `/admin/login` reliably deliver admins to the right place, and verify end-to-end that signing in unlocks `/admin/beta-codes`.

## Best-practice redirect behavior
Standard SaaS pattern (Stripe/Linear/Vercel) is:
1. If the user was sent to login from a protected page, return them there.
2. Otherwise drop them on a small admin hub that lists every admin tool.

That avoids hard-coding one destination (currently `/admin/waitlist`) and keeps future admin pages discoverable.

## Changes

1. **New `/admin` hub page** (`src/pages/AdminHub.tsx`)
   - Guarded by `useAdminAuth` (redirects to `/admin/login` if not admin).
   - Simple card grid linking to: Waitlist, Beta Codes (room to grow).
   - Shared header with sign-out, matching existing admin pages.

2. **`AdminLogin.tsx` — smarter redirect**
   - Read `location.state?.from` (set by guarded pages when they bounce to login).
   - After successful sign-in / already-authed effect: `navigate(from ?? '/admin', { replace: true })`.
   - Replaces the hard-coded `/admin/waitlist`.

3. **`AdminBetaCodes.tsx` + `AdminWaitlist.tsx` — preserve intent**
   - When redirecting unauth users to `/admin/login`, pass `{ state: { from: location.pathname } }` so login returns them to the page they tried to open.

4. **`src/App.tsx`**
   - Add `<Route path="/admin" element={<AdminHub />} />`.

## Verification (after build mode)
Using browser tools with the credentials you provide:
1. `view_preview` → `/admin/beta-codes` while logged out → expect bounce to `/admin/login` with `from` state.
2. Fill email + password → submit → expect redirect back to `/admin/beta-codes` with the codes table rendered.
3. Navigate to `/admin/login` directly while authed → expect redirect to `/admin` hub.
4. Confirm no console/network errors (especially no `has_role` permission errors).

Report results inline; fix anything that fails before closing out.

## Out of scope
No changes to RLS, the `has_role` function, or beta-code CRUD behavior.
