# Privacy accuracy, round 2 — remove remaining "stored locally" claims

Follow-up to `e69e6c0`. Rewrites the eight listed locations in `PrivacyPolicy.tsx` and `DataPrivacyFAQ.tsx` so every sentence matches the real data model: signed-in users' financial data lives in Supabase (with a local copy for offline use); demo mode is the only local-only path. Also fixes additional inaccurate sentences found during the read (listed at the end).

## `src/pages/PrivacyPolicy.tsx`

### 1. Line 71–74 — "Financial Data (Stored Locally)" heading + intro

**Current:**
- Heading: `Financial Data (Stored Locally)`
- Intro: "Your financial information is stored on your device, not on our servers. This includes:"

**Proposed:**
- Heading: `Financial Data`
- Intro: "When you use Zero Hero, you enter or import the following financial information:"

**Why:** The section should describe what is collected, not where it lives — storage location is covered in the Data Storage section. The list itself (budgets, debts, transactions, subscriptions, linked account summaries) stays unchanged.

### 2. Line 125 — "On your device" bullet

**Current:** "On your device: All financial data (budgets, debts, transactions, linked account info) is stored locally in your browser's storage. Our servers cannot access this data."

**Proposed:** "On your device: The app keeps a working copy of your data in your browser's storage so it loads fast and works offline. This copy is cleared when you sign out. In demo mode (no account), everything stays only on your device and never reaches our servers."

**Why:** States the two true modes — local copy as cache for signed-in users, local-only for demo — and removes the false "servers cannot access" claim.

### 3. Line 126 — "On our servers" bullet

**Current:** "On our servers (Supabase): Only your account profile (email, name), authentication tokens, subscription status, and household membership info. This is necessary to let you log in and manage your subscription."

**Proposed:** "On our servers (Supabase): When you're signed in, your budgets, debts, transactions, subscription tracking, and linked account summaries are stored in our database so they're available across your devices and can be shared with household members you invite. We also store your account profile (email, name), subscription status, and household membership info."

**Why:** Corrects the false "only profile data" claim to match what the code actually writes to Supabase.

### 4. Lines 236–238 — Data Retention paragraph

**Current:** "We keep your server-side account data only as long as you have an active account. When you delete your account, we remove your data within 30 days, except where we're legally required to retain it. Your locally stored financial data is deleted immediately when you clear it or uninstall."

**Proposed:** "We keep your account and financial data on our servers as long as your account exists. When you delete your account, your data is removed from our systems, except where we're legally required to retain it. The local copy on your device is cleared when you sign out, and you can also clear it yourself through your browser's site-data settings. Demo-mode data stays on your device until you clear it."

**Why:** Describes retention for server-side data (tied to account deletion) and local/demo data separately, without inventing a specific day count.

**Post-edit verification:** `rg -n -i "locally|on your device|cannot access" src/pages/PrivacyPolicy.tsx` should return only: line 155 (Plaid section — "In demo mode, data stays only on your device", which is true) and the new demo-mode sentences above. All remaining matches will be accurate.

## `src/pages/DataPrivacyFAQ.tsx`

### 5. Lines 168–172 — "The Short Answer" card

**Current:** "Zero Hero uses your browser's built-in 'localStorage' — think of it like a personal filing cabinet inside your browser. When you enter your budgets, debts, and transactions, they're saved directly to this filing cabinet on your device. It persists even when you close the tab, shut down your computer, or come back days later."

**Proposed:** "When you're signed in, your budgets, debts, and transactions are saved to your account on our servers, so they're there when you come back — on any device. The app also keeps a copy in your browser's storage so it loads fast and works offline. In demo mode (no account), everything is saved only in your browser's storage on that device."

**Why:** The current answer describes only the demo-mode model. The rewrite covers both modes.

### 6. Line 294 — "When You Could Lose Data" warning card

**Current:** "Because your data lives only on your device, certain actions can permanently delete it. This is why we strongly recommend regular backups!"

**Proposed:** "In demo mode, your data lives only on your device, and certain actions can permanently delete it. If you use demo mode, we strongly recommend regular backups. Signed-in accounts are stored on our servers and aren't affected by clearing your browser."

**Why:** The data-loss risk is real for demo mode but not for signed-in users; the warning should say so.

### 7. Line 436 — "What happens when I link a bank account?" closing paragraph

**Current:** "This data is stored locally on your device, just like all your other financial data."

**Proposed:** "When you're signed in, this data is stored in your account on our servers so it stays in sync across your devices. In demo mode, it's stored only on your device."

**Why:** Matches the Plaid storage sentence already fixed in round 1.

### 8. Lines 455–457 — "Where is my linked account data stored?" answer

**Current:** "The same place as all your other financial data — locally on your device, in your browser's storage. It never gets sent to our servers."

**Proposed:** "The same place as all your other financial data. Signed in: in your account on our servers, with a working copy in your browser for offline use. Demo mode: only in your browser's storage on your device."

**Why:** Removes the false "never sent to our servers" claim. The follow-up sentence about backups stays, qualified to demo mode.

## Additional inaccurate sentences found (not in the original list)

These make the same false claims and would contradict the fixed sections if left:

- **FAQ JSON-LD structured data (lines 48, 56, 64):** "It never leaves your device" / "we can't see it, and neither can anyone else" / localStorage-only persistence answer. These feed search engines the wrong answer. Propose rewriting all three to the signed-in/demo split, matching the visible answers.
- **"Is my data sent to any servers?" (lines 201–210):** "No. Your financial data never leaves your device… There's no cloud database holding your sensitive financial information." The question still makes sense; propose answer: "Yes, when you're signed in. Your financial data is stored in our database (hosted by Supabase) so it syncs across your devices. In demo mode, nothing is sent to our servers — it stays in your browser."
- **"What is localStorage?" bullet (line 222):** "It stays on your computer (never sent over the internet)" — true of localStorage itself as a technology, so it can stay; the surrounding answers just must not imply it's the only storage.
- **"Can I disconnect my bank?" (line 471):** "All data for that account will be permanently removed from your device immediately." Propose: "…permanently removed from your account and your device."
- **Step 2 diagram caption (line 510):** "Stored in browser localStorage" → "Saved to your account" (signed-in is the default path).

## Constraints honored

- Plain language, no filler, no invented retention periods/encryption/certifications, no absolutes like "never share" or "cannot access."
- No restyling; no sections touched beyond those listed. `TermsOfService.tsx` untouched. "Last Updated: September 29, 2026" date kept.

## Technical details

- Files: `src/pages/PrivacyPolicy.tsx` (4 edits), `src/pages/DataPrivacyFAQ.tsx` (4 listed edits + JSON-LD block + 3 additional sentences).
- Verification: re-run the `rg` pattern on both files after edits and confirm every remaining match is true under the data model.
