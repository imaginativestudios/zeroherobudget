

# Product Strategy Review: Zero Hero Budget

## The Product Today

Zero Hero is a **debt-payoff and budgeting PWA** targeting people who want to eliminate debt and build an emergency fund. It's local-first (localStorage), with optional Supabase auth, Stripe subscriptions ($5/mo, $50/yr), and a behavioral coaching layer.

---

## Feature-by-Feature Assessment

### 1. Behavioral Engine (Shadow Cost, Surplus Power, Consistency Score, Strategy Level-Up)

**Real user problem:** People don't connect daily spending to long-term debt consequences.

**Assessment: Over-engineered for the stage.**
- You have 14 components in `src/components/behavioral/`, 3 in `src/components/defense/`, plus dedicated engines (`behavioralEngine.ts`, `behavioralTriggers.ts`, `freedomEngine.ts`, `recoveryEngine.ts`).
- 3 of those components are **orphaned** — `HeroMoatCard`, `ShadowCostPreview`, and `HeroTipsFeed` are never imported.
- The Consistency Score uses a 3-factor weighted formula (participation 40%, budget adherence 40%, momentum 20%) with streak tracking, stored state, and week-over-week calculations. This is sophisticated math that most users will never understand or trust.

**Simpler alternative:** A single "Debt Impact" number shown when logging a transaction: "This $50 will cost you $73 in interest." One line, no engine. Ship the insight, not the system.

**Long-term risk:** Behavioral nudges that users don't understand become noise. If the Consistency Score drops and the user doesn't know why, it's demotivating — the opposite of coaching.

---

### 2. Gamification Layer (Fortress Levels, Moat Builder, Achievements, Streak Tracker, Victory Modals, Level-Up Modals)

**Real user problem:** Debt payoff is boring and slow. People quit.

**Assessment: Identity crisis.**
- The codebase shows a voice migration from "adventure/gaming" language to "Stoic Wisdom" — but components still reference Fortress, Moat, Hero, Castle Levels, Sanctuary.
- `MoatBuilder` uses `FortressLevelBadge` with castle level metaphors. `RegroupingBanner` uses military/tactical vocabulary. Meanwhile the onboarding now says "Emergency Fund Goal."
- The plan.md acknowledges the E2E tests are out of sync because of this language shift.

**The real question:** Is gamification the right retention mechanism for this audience? People stressed about debt often don't want to "play." They want clarity and control.

**Simpler alternative:** Replace gamification with **progress milestones** — concrete, financial achievements ("First $500 saved", "Credit card #2 paid off"). No metaphors, no levels. Just real financial wins celebrated simply.

**Long-term risk:** Maintaining two vocabularies (Stoic Wisdom vs. gaming remnants) creates a confused brand. Pick one and commit.

---

### 3. Household Management (Multi-user, invitations, role-based views)

**Real user problem:** Couples manage money together.

**Assessment: Premature for a pre-launch product.**
- You have `useHouseholds`, `useRealHouseholds`, `HouseholdViewContext`, `HouseholdSelector`, `HouseholdViewToggle`, `InvitationForm`, `AcceptInvite` page.
- This is a collaboration feature that requires Supabase auth, RLS policies, edge functions for invitations.
- Your landing page is a "Coming Soon" page. You don't have users yet.

**Simpler alternative:** Ship for single users first. Add household support only after you have retention data showing couples are a real segment.

**Long-term risk:** Multi-user data sharing is a liability and security surface area multiplier. Building it before product-market fit means maintaining complex code with zero validated demand.

---

### 4. Connector/Import System (CSV import, connector setup, category mapping)

**Real user problem:** Manual transaction entry is tedious.

**Assessment: Right problem, reasonable scope.**
- The import wizard (`DataImportWizard`, `ImportFileUpload`, `ImportColumnMapping`, `ImportPreview`) is a solid progressive-disclosure pattern.
- `ConnectorSetup` page suggests planned bank integrations (Plaid, etc.).

**Recommendation:** CSV import is the right MVP. Don't build bank connectors until you have 1,000+ active users. The regulatory and partnership overhead isn't worth it earlier.

---

### 5. Subscription/Paywall ($5/mo, $50/yr, 7-day trial)

**Real user problem:** You need revenue.

**Assessment: Pricing is fine. Gate placement needs validation.**
- You have Stripe checkout, webhook handling, trial countdown banners, subscription status checks.
- But you're gating a product that has zero public users (Coming Soon page).

**Simpler alternative:** Launch free. Add the paywall after you have 100 weekly active users and know what features they actually value enough to pay for.

**Long-term risk:** A paywall on an unvalidated product filters out the exact users you need for feedback.

---

### 6. PWA / Offline-First

**Real user problem:** Budget apps should work anywhere, including offline.

**Assessment: Good strategic bet.** Local-first with localStorage is appropriate for a budgeting app. Service worker, install prompts, offline banner — all solid.

**One concern:** localStorage has a ~5MB limit. Users with years of transaction history will hit it. No migration path to IndexedDB is visible.

---

## Strategic Recommendations

```text
Priority Matrix

                    HIGH IMPACT
                        │
   Simplify behavioral  │  Ship free, get users
   engine to 1 insight   │  Remove paywall gate
                        │
  LOW EFFORT ───────────┼─────────── HIGH EFFORT
                        │
   Delete orphaned       │  Defer households
   components            │  Defer bank connectors
                        │
                    LOW IMPACT
```

### Do Now (low effort, high clarity)
1. **Delete 3 orphaned behavioral components** and the unused `MobileOnboardingCarousel`
2. **Resolve the voice identity** — commit to Stoic Wisdom, rename Fortress/Moat/Hero references to plain language (Emergency Fund, Safety Net, Progress)
3. **Fix E2E tests** per existing plan.md

### Do Next (validate before building more)
4. **Launch without paywall** — make the Coming Soon page the actual app entry, remove the gate, get real usage data
5. **Simplify behavioral engine** — reduce to 2 user-facing concepts: "What this purchase really costs" (shadow cost) and "Your debt-free date" (freedom timeline)

### Defer
6. **Household features** — park until you have user demand signals
7. **Bank connectors** — CSV import is sufficient for now
8. **Achievements/gamification overhaul** — revisit after you know if users engage with progress tracking at all

