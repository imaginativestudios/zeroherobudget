

## Update Legal & Privacy Pages for Plaid Integration

### Problem
Four pages still reference the old "Scout" browser extension / scraper approach and don't mention Plaid. The Privacy Policy also contradicts the local-first architecture by claiming data is stored on Supabase cloud. All pages need plain-language rewrites where appropriate.

### Pages to update

**1. `src/pages/Legal.tsx` — The Code of the Fortress**
- **Tab C "The Scout Protocol"**: Replace entirely with **"Bank Connections"** tab describing the Plaid Link integration:
  - How it works: Plaid handles authentication directly with your bank; Zero Hero never sees your bank login credentials
  - What we store: Only account name, last 4 digits, type, and balance — stored locally on your device
  - What we don't store: No account numbers, routing numbers, or login credentials on our servers
  - Disconnect anytime: Unlinking removes all locally stored data for that account
- Update tab icon from `Compass` to `Link2` and label from "The Scout Protocol" / "Connector" to "Bank Connections"
- **Tab A "Privacy"**: Add a bullet about Plaid as a third-party service provider (handles bank authentication securely; see their privacy policy)
- Rewrite copy in plain language throughout (remove jargon like "sovereign territory", "IndexedDB via RxDB")

**2. `src/pages/PrivacyPolicy.tsx` — Full Privacy Policy**
- **Fix contradiction**: The "Data Storage" section claims data is stored on Supabase cloud with PostgreSQL. Rewrite to accurately reflect the hybrid model: financial data stored locally on device, only account/auth info on Supabase
- **Add "Bank Account Linking" section**: Explain Plaid's role as a secure intermediary, what data flows where, and that Plaid has its own privacy policy
- **Update "Third Parties" section**: Add Plaid alongside Supabase and Stripe as a named service provider
- **Update date** to March 2026
- Simplify language throughout

**3. `src/pages/TermsOfService.tsx` — Terms of Service**
- **Add "Bank Account Linking" section** under Service Description: Users may optionally link bank accounts via Plaid; Zero Hero is not responsible for bank data accuracy; users can disconnect anytime
- **Remove** line 115 about scraping prohibition (contradicted the old connector feature; no longer relevant)
- **Update date** to March 2026

**4. `src/pages/DataPrivacyFAQ.tsx` — Data Privacy FAQ**
- **Add new FAQ section** "Bank Account Linking" with questions:
  - "What happens when I link a bank account?" — Plaid securely connects; we only receive account name, mask, type, balance
  - "Does Zero Hero see my bank login?" — No, Plaid handles authentication directly
  - "Where is my linked account data stored?" — Locally on your device, encrypted
  - "Can I disconnect my bank?" — Yes, all data for that account is permanently deleted from your device

**5. `supabase/functions/generate-store-images/index.ts`** — Update image generation prompts to remove "No Plaid" bullet and "Privacy-First Bank Scout" references (these are now inaccurate since we use Plaid)

### Files changed
1. `src/pages/Legal.tsx`
2. `src/pages/PrivacyPolicy.tsx`
3. `src/pages/TermsOfService.tsx`
4. `src/pages/DataPrivacyFAQ.tsx`
5. `supabase/functions/generate-store-images/index.ts`

