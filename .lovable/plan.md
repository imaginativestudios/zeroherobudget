

# Remove Bank Connector Page

The `/settings/connector` page is a browser extension setup guide (copy code snippets to build a Chrome extension for transaction import). It's separate from the inline bank linking flow on `/accounts`.

## Changes

1. **Delete** `src/pages/ConnectorSetup.tsx`
2. **`src/App.tsx`** — Remove the route and import for `ConnectorSetup`
3. **`src/components/Layout.tsx`** — Remove the "Bank Connector" sidebar link (~lines 265-280)
4. **`src/components/MobileMoreDrawer.tsx`** — Remove the "Bank Connector" menu item (line 33)
5. **`src/components/MobileBottomNav.tsx`** — Remove `/settings/connector` from the routes array (line 37)
6. **`src/pages/SiteMap.tsx`** — Remove the connector entry (line 50)

Also safe to remove if no other references exist:
- `src/lib/extensionCode.ts` (provides the code snippets only used by ConnectorSetup)

