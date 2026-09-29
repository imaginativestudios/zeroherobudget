# Privacy accuracy round 3 plan

No source files have been edited. This plan reconciles public copy to the signed-in Supabase model and demo-only device storage.

## Part A — `/data-privacy` hero

Keep the current card, arrows, spacing, and visual style. Replace only content and reuse Lucide icons.

- **Headline:** “Your data, your control”
- **Subtitle:** “How Zero Hero stores, protects, and lets you delete your financial data”
- **Node 1 — Smartphone icon**
  - Label: “Your device”
  - Detail: “Works offline, cleared on sign-out”
- **Node 2 — Database icon**
  - Label: “Your account”
  - Detail: “Stored securely, synced across devices”
- **Node 3 — Lock icon**
  - Label: “Only you”
  - Detail: “Shared only with the services you use, never sold”
- **Badge/link 1:** “Never sold or used for ads” → link to the Privacy Policy’s “Data Sharing and Third Parties” section.
- **Badge/link 2:** “Delete your account and data” → link or anchor near the account-deletion explanation.

The first badge is supported by the current policy commitment and no-advertising statement. I recommend **“Delete your account and data” instead of “Delete everything in one step”** because deletion currently requires a checkbox, typing `DELETE`, an emailed code, and final confirmation. Calling it one step would be misleading.

Keep the existing demo-mode explanation below the hero. Also replace the page’s SEO description with:

> Learn how Zero Hero stores and protects your financial data, what syncs with your account, what stays in your browser, and how deletion works.

## Part B — site-wide audit

Action counts below count grouped copy changes, not every repeated label: **Rewrite 25 · Qualify 6 · Keep 17**.

### `src/pages/DataPrivacyFAQ.tsx`

| Line(s) | Current text | Action | Proposed text / reason |
|---|---|---|---|
| 37 | “private with local-first storage…” | Rewrite | Use the SEO description above. |
| 103–149 | “Your Data, Your Device”; browser-only diagram; “No external servers”; “We can’t see your data” | Rewrite | Apply Part A exactly. |
| 48, 56; other JSON-LD answers | Signed-in server storage plus demo-only local storage | Keep | Correctly distinguishes both modes. |
| 190–195 | Data is stored in localStorage; “private notebook” | Rewrite | “When you’re signed in, your data is stored in your account on our Supabase-hosted database and a working copy is kept in this browser for fast, offline use. In demo mode, it is stored only in this browser.” |
| 204–210 | Signed-in data is on Supabase; demo mode stays in browser | Keep | Accurate. |
| 219–226 | General localStorage explanation; “never sent over the internet” | Qualify | Introduce it as the demo-mode store and signed-in working copy. Replace the bullet with “The browser stores it on this device; signed-in data also syncs with your account.” |
| 295–297 | Demo-only loss warning; signed-in server distinction | Keep | Accurate. |
| 346–351 | “Not automatically…doesn’t sync” | Rewrite | “When you’re signed in, your data syncs across devices through your account. In demo mode, it stays in this browser; use backup and restore to move it.” |
| 438–461 | Signed-in bank data on servers; demo data on device | Keep | Accurate. |
| 448–450 | Plaid credentials never reach Zero Hero | Keep | This narrowly describes credentials, not account data. |
| 474–475 | Disconnect removes account data from account and device | Keep | Matches the deletion path. |

### Global privacy components

| File:line | Current text | Action | Proposed text / reason |
|---|---|---|---|
| `LocalFirstBadge.tsx:23–38,58,67,91,117,126` | “Local-First Privacy”; device-only/no-server/encrypted claims; related labels | Rewrite | Visible label: “Privacy & your data.” ARIA: “Learn about privacy and your data.” Body: “Signed-in data is stored in your account and synced across devices, with a browser copy for offline use. Demo-mode data stays on this device.” Chips: “Never sold,” “Account controls,” “Works offline.” |
| `Layout.tsx:294` | “Your Privacy” | Keep | Accurate sidebar label. The requested “Learn about local-first privacy” text is actually the badge’s ARIA label, not the sidebar. |
| `PrivacyNotice.tsx:28–30` | “stays on your device”; “We never see or store…” | Rewrite | “Signed-in data syncs securely with your account. Demo-mode data stays on this device.” |
| `PrivacyBadge.tsx:21,29` | “stays local”; “stored locally” | Rewrite | Compact: “Privacy & your data.” Default: “Your account data syncs across devices.” |
| `OfflineBanner.tsx:15` | “You’re offline · Changes saved locally” | Keep | Correctly describes the browser working copy; no server-exclusion claim. |

### Account-linking copy

| File:line | Current text | Action | Proposed text / reason |
|---|---|---|---|
| `ConsentScreen.tsx:28–30` | “Stored only on your device”; encryption/only-you claim | Rewrite | “Stored based on how you use Zero Hero” / “When signed in, basic linked-account details are stored in your account and synced. In demo mode, they stay on this device.” |
| `ConsentScreen.tsx:40–42` | Balances/transactions “never” reach servers | Rewrite | “Sensitive numbers stay with Plaid” / “We do not receive full account or routing numbers. Signed-in balances and transactions are stored in your account; demo-mode data stays on this device.” |
| `ConsentScreen.tsx:52–54` | Disconnect deletes local data only | Rewrite | “You can unlink anytime. Data for that connection is removed from your account and device.” |
| `DisconnectDialog.tsx:27–30` | Device-only deletion; no server storage | Rewrite | “This will disconnect [account]. Data for this connection will be permanently removed from your account and this device.” |
| `LinkedAccountsList.tsx:197–200` | Signed-in branch accurate; demo branch says encrypted/device-only | Keep | Both branches are supported: demo linked-account metadata uses AES-GCM local storage. |
| `LinkedAccountsList.tsx:216` | Toast says removed from device | Qualify | “{name} has been disconnected and its data removed.” |
| `LinkedAccountsList.tsx:111` | Incognito persistence warning | Keep | Browser-session warning, not a storage-model promise. |

### Product, onboarding, legal, and marketing pages

| File:line | Current text | Action | Proposed text / reason |
|---|---|---|---|
| `DataManagement.tsx:181–195` | “never leaves”; no servers; “No cloud storage”; “No tracking” | Rewrite | Heading: “Your data, under your control.” Body: “Signed-in data is stored in your account and synced across devices, with a local working copy for offline use. Demo-mode data stays on this device.” Badges: “Works offline,” “Never sold,” “Delete your data.” |
| `Onboarding.tsx:335` | Hourly wage “stays on your device” | Rewrite | “We use this to calculate how many hours of work you’re ‘buying back’ from the banks.” |
| `Onboarding.tsx:650` | “Your data stays on your device” | Rewrite | “Learn how your data is stored and protected.” Keep the privacy link. |
| `onboarding/PricingStep.tsx:312` | “Your data stays private” | Keep | General policy-backed privacy statement; it does not imply device-only storage. |
| `Landing.tsx:176` | “Local-First Privacy” | Rewrite | “Privacy & data controls.” |
| `internal/ComingSoon.tsx:265,389–390` | Local-first/device-always claims | Rewrite | “Privacy & data controls” / “Works offline and syncs when you sign in.” Internal route is still reachable. |
| `Legal.tsx:98–100` | Device-only data; servers cannot access it | Rewrite | Heading: “How Your Data Is Stored.” Body: “Signed-in financial data is stored in our Supabase-hosted database and synced across devices. The browser keeps a working copy for offline use. Demo-mode data stays on this device.” |
| `Legal.tsx:274` | Linked data stored only locally | Rewrite | “After you connect, we receive the following account information. Signed-in data is stored in your account; demo-mode data stays on this device:” |
| `Legal.tsx:312` | Disconnect removes data only from device | Rewrite | “When you unlink an account, its data is removed from your account and device.” |
| `TermsOfService.tsx:149` | Disconnect removes data only from device | Rewrite | “…permanently removes related data from your account and device.” This is the audit hit that permits the otherwise-restricted Terms edit. |
| `Install.tsx:22,45,60,74` | Offline/install/device wording | Keep | Describes PWA behavior and installation, not data location. |
| `PrivacyPolicy.tsx:125–126,154–157,169–181,232–239` | Correct signed-in/demo model, processors, deletion | Keep | Authoritative copy is accurate. |
| `PrivacyPolicy.tsx:35` | “Last Updated: March 25, 2026” | Rewrite | Restore the required “Last Updated: September 29, 2026.” |

### Help, AI answers, public metadata, and email

| File:line | Current text | Action | Proposed text / reason |
|---|---|---|---|
| `HelpSupport.tsx:355` | TLS 1.3, AES-256, regular audits | Rewrite | “Signed-in data is stored in our Supabase-hosted database and protected through authenticated access and row-level access rules. We do not receive your bank login credentials.” Avoid unverified algorithms/audits. |
| `HelpSupport.tsx:362` | No sale; essential providers under strict agreements | Qualify | “We do not sell or rent your data. We share only what is needed with the service providers listed in our Privacy Policy, or when required by law.” |
| `HelpSupport.tsx:376` | 30/90-day retention and anonymized analytics | Rewrite | “Deleting your account removes your account data from our systems, except where we are legally required to retain it. See our Privacy Policy for details.” |
| `public/llms.txt:68` | “Local-first data storage” | Rewrite | “Browser working copy for offline use; signed-in data syncs through Supabase, while demo-mode data stays on the device.” |
| `generate-store-images/index.ts:15,31–33` | “Privacy-First,” “Local-first,” “Bank-grade,” “100% local” | Rewrite | “Clear, controlled budgeting”; bullets “Works offline • Syncs when signed in • You control your data”; footer “Your budget. Your account. Your control.” |
| `stripe-webhook/.../subscription-canceled.tsx:68` | “safely stored and secure” | Qualify | “Your account data remains available if you resubscribe.” |
| `payment-failed.tsx:94`; deletion-code email | Contextual “data is safe” / account-safe wording | Keep | Narrow reassurance about payment/deletion-code state. |
| `index.html`; `public/site.webmanifest`; `docs/EMAIL_TEMPLATES.md`; `functionalVocabulary.ts`; `README.md` | No user-facing local-only privacy claim | Keep | README “locally” refers to development. Manifest has no description field. |

## `faq-chat` system-prompt findings

No line says data is local-only. Its full relevant storage/privacy answers are:

> **Q: Is my financial data secure?**  
> A: Yes! Your data is stored securely using Supabase's enterprise-grade infrastructure with encryption at rest and in transit. We follow industry best practices for financial data protection.

> **Q: Do you sell my data to third parties?**  
> A: Never. We never sell, rent, or share your personal financial data with third parties. Your privacy is paramount.

> **Q: What happens to my data if I delete my account?**  
> A: All your data is permanently deleted from our servers within 30 days of account deletion. We retain no copies. Make sure to export any data you need before deleting your account.

Replace them with:

- **Security:** “When you’re signed in, your data is stored in our Supabase-hosted database and synced across devices. Your browser keeps a working copy for offline use. In demo mode, data stays on your device. See our Privacy Policy for details.”
- **Sale/sharing:** “We do not sell or rent your data. We share only what is needed with the service providers listed in our Privacy Policy, or when required by law.”
- **Deletion:** “Deleting your account removes your account data from our systems, except where we are legally required to retain it. Export anything you need before deleting your account.”

## Uncertainties and owner decisions

1. “Delete everything in one step” is not literally true of the current multi-confirmation deletion flow; the plan uses “Delete your account and data.”
2. “Never sold or used for ads” is supported by the current Privacy Policy and treated as an owner policy commitment, not a technical guarantee.
3. Supabase’s precise encryption algorithms, “enterprise-grade,” regular security audits, confidentiality contract terms, 30/90-day retention, and anonymized analytics are not verifiable from this repository; the plan removes those claims rather than guessing.
4. Disconnect currently deletes the Plaid item and cascading account rows, but the client code does not explicitly call Plaid `/item/remove`; copy promises data removal, not explicit revocation of Plaid access. The FAQ will continue directing users to my.plaid.com for direct revocation.
5. Generated store images may already exist outside the repository. This plan fixes future generation prompts; published assets need a separate manual check.
