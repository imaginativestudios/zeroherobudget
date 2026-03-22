

## Beta Testing URL Plan

### Problem
The root URL (`/`) shows the Coming Soon page. Testers need a way to bypass it and access the full app flow (Landing → Onboarding → Auth → Dashboard → all features).

### Solution
Use a URL parameter `?beta=true` on the root route that stores a flag in `localStorage`. Once set, the root route renders the Landing page instead of Coming Soon for the rest of that browser session.

**Beta test URL:** `https://zeroherobudget.lovable.app/?beta=true`

### Changes

**1. Update `src/App.tsx` — new root component**
- Replace `<ComingSoon />` with a new `<RootPage />` component that checks for the beta flag.

**2. Create `src/pages/RootPage.tsx`**
- On mount, check for `?beta=true` query param → if present, set `localStorage.setItem('beta_access', 'true')`
- If `localStorage.getItem('beta_access') === 'true'`, render `<Landing />`
- Otherwise render `<ComingSoon />`
- Include a way to exit beta mode (e.g., `?beta=false` clears the flag)

**3. No other files need changes**
- All existing navigation to `/` will correctly show Landing for beta testers and ComingSoon for everyone else
- Stripe is already in test/sandbox mode via the existing keys
- Auth, onboarding, and all features work as-is

### How testers use it
1. Visit `https://zeroherobudget.lovable.app/?beta=true`
2. They see the real Landing page
3. They can sign up, onboard, subscribe via Stripe test mode, and test all features
4. The beta flag persists across page refreshes until cleared

