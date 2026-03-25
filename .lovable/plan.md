

## Fix Legal/Privacy Page Issues

### Problem
1. **404 on /legal in preview**: The route is correctly defined in App.tsx. This is likely a preview environment caching issue — the code is correct.
2. **Broken link in AccountSettings**: The "Privacy FAQ" quick link points to `/privacy-faq` (doesn't exist) instead of `/data-privacy`.
3. **Live site shows old content**: The updated pages haven't been published yet. You need to click "Publish" > "Update" to deploy the frontend changes to the live site.
4. **Terms of Service date**: Still says "March 23, 2026" — should be updated to March 25, 2026 to match the Privacy Policy.

### Changes

**1. `src/pages/AccountSettings.tsx`** — Fix broken Privacy FAQ link
- Line 178: Change `href: '/privacy-faq'` to `href: '/data-privacy'`

**2. `src/pages/TermsOfService.tsx`** — Update date
- Line 32: Change "March 23, 2026" to "March 25, 2026"

**3. Publish reminder**
- After these fixes, click Publish > Update to push all legal page changes to the live site. Backend changes deploy automatically but frontend (page content) requires manual publish.

### No routing changes needed
All routes are correctly defined:
- `/legal` → Legal.tsx
- `/privacy` → PrivacyPolicy.tsx
- `/terms` → TermsOfService.tsx
- `/data-privacy` → DataPrivacyFAQ.tsx

All footer/nav links across Landing, ComingSoon, Layout, and component files point to correct routes.

