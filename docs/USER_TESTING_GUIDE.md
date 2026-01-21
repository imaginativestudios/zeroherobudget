# Zero Hero User Testing Guide

A comprehensive guide for beta testing the Zero Hero financial wellness application.

---

## Table of Contents

1. [Introduction & Testing Goals](#introduction--testing-goals)
2. [Test Environment Setup](#test-environment-setup)
3. [Test Scenarios](#test-scenarios)
   - [A: First-Time Visitor](#scenario-a-first-time-visitor-landing-page)
   - [B: Onboarding Wizard](#scenario-b-onboarding-wizard)
   - [C: Demo Mode Exploration](#scenario-c-demo-mode-exploration)
   - [D: Authentication Flow](#scenario-d-authentication-flow)
   - [E: Dashboard & Checklist](#scenario-e-dashboard--getting-started-checklist)
   - [F: Core Features](#scenario-f-core-features)
   - [G: PWA Installation](#scenario-g-pwa-installation)
   - [H: Stripe Checkout](#scenario-h-stripe-checkout--subscription)
   - [I: Data Management](#scenario-i-data-management)
4. [Bug Report Template](#bug-report-template)
5. [Feedback Collection Form](#feedback-collection-form)
6. [Terminology Reference](#terminology-reference)

---

## Introduction & Testing Goals

### Purpose

This user testing guide helps validate the Zero Hero app before public release. Your feedback is invaluable in identifying usability issues, bugs, and areas for improvement.

### What We're Validating

- **Onboarding clarity**: Is the 6-step wizard intuitive and encouraging?
- **Navigation flow**: Can users find features easily?
- **Core functionality**: Do budget, debt, and transaction features work correctly?
- **Visual design**: Is the "Sophisticated Adventure" theme engaging without being confusing?
- **Mobile experience**: Does the app work well on smaller screens?
- **Error handling**: Are error messages helpful and clear?

### Testing Timeline

- **Duration**: 1-2 hours for complete testing
- **Focus areas**: Complete at least Scenarios A-F
- **Feedback due**: Within 48 hours of testing session

---

## Test Environment Setup

### Browser Requirements

Test on at least one of each category:

| Category | Browsers |
|----------|----------|
| Primary | Chrome (latest), Firefox (latest) |
| Secondary | Safari (macOS/iOS), Edge |

### Device Testing

| Device Type | Screen Width | Priority |
|-------------|--------------|----------|
| Desktop | 1280px+ | High |
| Tablet | 768px-1024px | Medium |
| Mobile | 320px-375px | High |

### Starting Fresh

To ensure a clean testing environment, clear localStorage:

1. Open browser DevTools (F12 or Cmd+Shift+I)
2. Go to **Application** → **Local Storage**
3. Right-click and select **Clear**
4. Refresh the page

### Testing URLs

| Environment | URL |
|-------------|-----|
| Preview | https://id-preview--33f67e62-8c56-4bb1-b4f8-e1c8a3c81742.lovable.app |
| Production | https://zeroherobudget.lovable.app |

---

## Test Scenarios

### Scenario A: First-Time Visitor (Landing Page)

**Goal**: Verify the landing page loads correctly and CTAs work.

| Step | Action | Expected Behavior | Pass/Fail |
|------|--------|-------------------|-----------|
| A1 | Visit root URL (`/`) | Landing page loads with hero section, logo, and headline "From Balances Due to a More Balanced You" | ☐ |
| A2 | Scroll down | "The Three Oaths" section visible with 3 cards (Sanctuary, Freedom Engine, Growth Over Guilt) | ☐ |
| A3 | Continue scrolling | "The Path" section shows 4 journey levels (Wayfarer → Luminary) | ☐ |
| A4 | Scroll to mockups | "See It In Action" section displays device mockups | ☐ |
| A5 | Click "Begin Your Quest" | Navigates to `/onboarding` | ☐ |
| A6 | Return to landing, click "Sign In" | Auth modal opens with login form | ☐ |
| A7 | Check footer links | Pricing, Legal, Support links work | ☐ |

**Notes:**
```
Issues found:


```

---

### Scenario B: Onboarding Wizard

**Goal**: Complete the 6-step onboarding process.

| Step | Action | Expected Behavior | Pass/Fail |
|------|--------|-------------------|-----------|
| B1 | Land on Step 1 | "What's your hourly wage?" question displays | ☐ |
| B2 | Leave wage empty, click Continue | Button disabled OR shows validation | ☐ |
| B3 | Enter $35, click Continue | Advances to Step 2 | ☐ |
| B4 | Alternative: Click "Skip for now" | Advances to Step 2 without wage | ☐ |
| B5 | Step 2: Enter debt name "Credit Card" | Name field accepts input | ☐ |
| B6 | Enter balance: 5000 | Balance field accepts positive number | ☐ |
| B7 | Enter APR: 24.99 | APR field accepts decimal | ☐ |
| B8 | Enter min payment: 150 | Payment field accepts positive number | ☐ |
| B9 | Click Continue | Advances to Step 3 | ☐ |
| B10 | Step 3: View moat options | $500, $1,000, $2,000 options display | ☐ |
| B11 | Select $1,000 | Option highlights/selects | ☐ |
| B12 | Click Continue | Advances to Step 4 (Aha Moment) | ☐ |
| B13 | Step 4: Freedom date displays | Shows calculated debt-free date | ☐ |
| B14 | Click Continue | Advances to Step 5 (Pricing) | ☐ |
| B15 | Step 5: Adjust price slider | Tier name updates (Supporter → Champion → Hero) | ☐ |
| B16 | Click "Start Free Trial" OR "Skip" | Advances to Step 6 | ☐ |
| B17 | Step 6: Confetti/celebration | Visual celebration displays | ☐ |
| B18 | Click "Enter the Fortress" | Redirects to `/dashboard` | ☐ |

**Notes:**
```
Issues found:


```

---

### Scenario C: Demo Mode Exploration

**Goal**: Navigate and use features without authentication.

| Step | Action | Expected Behavior | Pass/Fail |
|------|--------|-------------------|-----------|
| C1 | Complete onboarding (skip trial) | Dashboard loads | ☐ |
| C2 | Verify demo badge | "Demo Mode" badge visible in header/sidebar | ☐ |
| C3 | Navigate to Budget (sidebar) | Budget page loads, can add income/expenses | ☐ |
| C4 | Add an expense: "Groceries" $400 | Expense appears in list | ☐ |
| C5 | Navigate to Debt Strategy | Debt page loads with any debts from onboarding | ☐ |
| C6 | Add new debt: "Car Loan" $15,000 | Debt appears with calculations | ☐ |
| C7 | Toggle Snowball ↔ Avalanche | Strategy changes, order may update | ☐ |
| C8 | Navigate to Transactions | Transaction list displays | ☐ |
| C9 | Add transaction: $50 Groceries | Transaction appears in list | ☐ |
| C10 | Navigate to Reports | Reports page loads with chart options | ☐ |
| C11 | Navigate to Subscriptions | Subscription tracker displays | ☐ |
| C12 | Navigate to Financial Tips | Tips page loads with advice cards | ☐ |

**Notes:**
```
Issues found:


```

---

### Scenario D: Authentication Flow

**Goal**: Test signup, login, and password reset.

| Step | Action | Expected Behavior | Pass/Fail |
|------|--------|-------------------|-----------|
| D1 | From landing, click "Sign In" | Auth modal opens | ☐ |
| D2 | Modal shows Login tab by default | Login form visible | ☐ |
| D3 | Click "Sign Up" tab | Signup form displays | ☐ |
| D4 | Submit empty signup form | Validation errors appear | ☐ |
| D5 | Enter invalid email "test" | "Invalid email" error | ☐ |
| D6 | Enter valid email + password | Form accepts input | ☐ |
| D7 | Submit signup | Success message OR email confirmation | ☐ |
| D8 | Switch to Login tab | Login form displays | ☐ |
| D9 | Enter incorrect credentials | Error message displays | ☐ |
| D10 | Enter correct credentials | Redirects to dashboard | ☐ |
| D11 | Click "Forgot Password?" | Password reset flow initiates | ☐ |
| D12 | Submit reset request | Confirmation message displays | ☐ |

**Notes:**
```
Issues found:


```

---

### Scenario E: Dashboard & Getting Started Checklist

**Goal**: Verify dashboard layout and checklist functionality.

| Step | Action | Expected Behavior | Pass/Fail |
|------|--------|-------------------|-----------|
| E1 | Fresh user lands on dashboard | "Your Quest Begins" checklist visible | ☐ |
| E2 | Checklist shows 5 tasks | Set income, Add expense, Track debt, Build Sanctuary, Record transaction | ☐ |
| E3 | Progress bar shows 0% | Bar is empty or shows 0/5 | ☐ |
| E4 | Click task link (e.g., "Set Income") | Navigates to correct page | ☐ |
| E5 | Complete a task | Return to dashboard, task shows checkmark | ☐ |
| E6 | Progress bar updates | Shows new percentage | ☐ |
| E7 | Complete all 5 tasks | Confetti celebration triggers | ☐ |
| E8 | Checklist auto-hides | Checklist collapses or disappears | ☐ |
| E9 | Defense zone visible | Moat Builder card shows Sanctuary progress | ☐ |
| E10 | Offense zone visible | Boss Card shows primary debt (if exists) | ☐ |
| E11 | Intel Feed visible | Tips or insights display | ☐ |

**Notes:**
```
Issues found:


```

---

### Scenario F: Core Features

**Goal**: Test main app functionality in depth.

#### Budget (The Atlas)

| Step | Action | Expected Behavior | Pass/Fail |
|------|--------|-------------------|-----------|
| F1 | Navigate to Budget | Page loads with income/expense sections | ☐ |
| F2 | Add income: $5,000 Salary | Income row appears, total updates | ☐ |
| F3 | Add expense: $1,500 Rent (Housing) | Expense appears in Housing category | ☐ |
| F4 | Add expense: $200 Electric (Utilities) | Expense appears in Utilities category | ☐ |
| F5 | Edit expense amount | Amount updates correctly | ☐ |
| F6 | Delete expense | Expense removed, totals update | ☐ |
| F7 | Verify "Available for Debt" calculates | Shows income minus expenses | ☐ |

#### Debt Strategy (Shadow Path)

| Step | Action | Expected Behavior | Pass/Fail |
|------|--------|-------------------|-----------|
| F8 | Navigate to Debt Strategy | Page loads with Overview/Schedule/Compare tabs | ☐ |
| F9 | Add debt: $8,000 @ 18% APR, $200 min | Debt appears in list | ☐ |
| F10 | View payoff chart | Line chart shows balance over time | ☐ |
| F11 | Switch to Schedule tab | Payment schedule table displays | ☐ |
| F12 | Switch to Compare tab | Snowball vs Avalanche comparison shows | ☐ |
| F13 | Use Freedom Slider | Extra payment amount adjusts payoff date | ☐ |

#### Transactions (Journey Log)

| Step | Action | Expected Behavior | Pass/Fail |
|------|--------|-------------------|-----------|
| F14 | Navigate to Transactions | Transaction list displays | ☐ |
| F15 | Click "Add Transaction" | Form/modal opens | ☐ |
| F16 | Add: $75 Grocery Store, Food category | Transaction appears with category badge | ☐ |
| F17 | Filter by month | Only selected month's transactions show | ☐ |
| F18 | Search for "Grocery" | Matching transactions filter | ☐ |
| F19 | Edit transaction | Changes save correctly | ☐ |
| F20 | Delete transaction | Transaction removed from list | ☐ |

#### Subscriptions

| Step | Action | Expected Behavior | Pass/Fail |
|------|--------|-------------------|-----------|
| F21 | Navigate to Subscriptions | Subscription table displays | ☐ |
| F22 | Add: Netflix $15.99 monthly | Subscription appears with next billing date | ☐ |
| F23 | Pause subscription | Status changes to paused | ☐ |
| F24 | Resume subscription | Status changes to active | ☐ |
| F25 | View monthly total | KPI card shows accurate sum | ☐ |

**Notes:**
```
Issues found:


```

---

### Scenario G: PWA Installation

**Goal**: Test Progressive Web App installation flow.

| Step | Action | Expected Behavior | Pass/Fail |
|------|--------|-------------------|-----------|
| G1 | Navigate to `/install` | Install page loads | ☐ |
| G2 | (Android/Desktop) "Install" button visible | Button appears if not already installed | ☐ |
| G3 | Click Install button | Browser install prompt appears | ☐ |
| G4 | Complete installation | App icon added to home screen/desktop | ☐ |
| G5 | (iOS) Safari instructions visible | Step-by-step guide displays | ☐ |
| G6 | After install, revisit `/install` | "Already Installed" message shows | ☐ |
| G7 | Open installed PWA | App launches in standalone mode | ☐ |

**Notes:**
```
Issues found:


```

---

### Scenario H: Stripe Checkout & Subscription

**Goal**: Test payment flow (use test mode).

| Step | Action | Expected Behavior | Pass/Fail |
|------|--------|-------------------|-----------|
| H1 | Navigate to `/pricing` | Pricing page loads with slider | ☐ |
| H2 | Adjust slider to $5 | "Supporter" tier displays | ☐ |
| H3 | Adjust slider to $10 | "Champion" tier displays | ☐ |
| H4 | Adjust slider to $25 | "Hero" tier displays | ☐ |
| H5 | Click "Start Free Trial" (not logged in) | Auth modal appears | ☐ |
| H6 | Log in, click "Start Free Trial" | Redirects to Stripe checkout | ☐ |
| H7 | Complete checkout (test card 4242...) | Redirects to `/checkout/success` | ☐ |
| H8 | Return to `/pricing` | Shows subscription details | ☐ |
| H9 | Click "Manage Subscription" | Stripe customer portal opens | ☐ |

**Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

**Notes:**
```
Issues found:


```

---

### Scenario I: Data Management

**Goal**: Test export, backup, and restore functionality.

| Step | Action | Expected Behavior | Pass/Fail |
|------|--------|-------------------|-----------|
| I1 | Navigate to Data Management | Page loads with backup options | ☐ |
| I2 | Click "Export Transactions" | CSV file downloads | ☐ |
| I3 | Open CSV | Contains transaction data | ☐ |
| I4 | Click "Create Backup" | JSON backup file downloads | ☐ |
| I5 | Open backup JSON | Contains all data types | ☐ |
| I6 | Click "Restore from Backup" | File picker opens | ☐ |
| I7 | Select backup file | Restore options dialog appears | ☐ |
| I8 | Confirm restore | Data restores, confirmation shows | ☐ |
| I9 | Click "Clear All Data" | Warning dialog appears | ☐ |
| I10 | Confirm clear | All data removed, redirects to clean state | ☐ |

**Notes:**
```
Issues found:


```

---

## Bug Report Template

Copy and fill out for each bug found:

```markdown
### Bug Report

**Tester Name:** 
**Date:** 
**Device:** [e.g., iPhone 14, Windows Desktop]
**Browser:** [e.g., Chrome 120, Safari 17]
**Screen Size:** [e.g., 375px mobile, 1440px desktop]

---

**Page/Feature:** [e.g., Dashboard, Onboarding Step 3]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Actual Behavior:**


**Screenshots/Screen Recording:**
[Attach or describe]

**Console Errors (if visible):**
[Open DevTools > Console, copy any red errors]

---

**Severity:**
- [ ] 🔴 Critical (app crashes, data loss, can't proceed)
- [ ] 🟠 Major (feature broken, workaround difficult)
- [ ] 🟡 Minor (feature works but incorrectly)
- [ ] 🔵 Cosmetic (visual issues, typos)

**Frequency:**
- [ ] Always happens
- [ ] Sometimes happens
- [ ] Happened once
```

---

## Feedback Collection Form

Complete after testing session:

```markdown
### Zero Hero User Testing Feedback

**Tester Name:** 
**Date:** 
**Time Spent Testing:** 

---

### Ratings (1-5, where 5 is excellent)

| Category | Rating | Comments |
|----------|--------|----------|
| Overall Experience | /5 | |
| Onboarding Clarity | /5 | |
| Navigation Ease | /5 | |
| Visual Design | /5 | |
| Feature Completeness | /5 | |
| Mobile Experience | /5 | |
| Performance/Speed | /5 | |

---

### Open Questions

**What worked well?**


**What was confusing or frustrating?**


**What features are missing that you'd expect?**


**Did the "adventure" theme (Sanctuary, Shadow, Quest) enhance or detract from the experience?**


**Would you recommend Zero Hero to a friend? Why or why not?**


**Any other comments, suggestions, or ideas?**


---

### Top 3 Issues (ranked by importance)

1. 
2. 
3. 
```

---

## Terminology Reference

Zero Hero uses a "Sophisticated Adventure" theme. Here's a quick reference:

| Standard Term | Zero Hero Term | Where Used |
|---------------|----------------|------------|
| Budget | The Atlas | Page title, navigation |
| Debt | The Shadow | Debt-related features |
| Emergency Fund | The Sanctuary | Savings/moat features |
| Pay off debt | Clear Shadow | Buttons, actions |
| Overspent | Off the Path | Budget warnings |
| Under budget | Ahead of the Journey | Budget success |
| Paid off | Cleared / Restored | Debt completion |
| Reports | Intel Center / Discoveries | Navigation, headers |
| Transactions | Journey Log | Navigation, headers |
| Achievements | Milestones | Achievement system |
| User levels | Wayfarer → Pathfinder → Sage → Luminary | Progression system |

**Note:** Action buttons remain literal (e.g., "Add Expense" not "Add Provision") for clarity.

---

## Contact

For questions during testing, reach out to:
- **Email:** support@zeroherobudget.com
- **GitHub Issues:** [Project Repository]

Thank you for helping make Zero Hero better! 🎯
