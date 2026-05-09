# Your Go-Live Walkthrough (Non-Technical)

You have 5 things left. Do them in this order. Each one tells you exactly where to click.

---

## ✅ Step 1 — Switch Plaid from "Test Mode" to "Real Mode"

**Why:** Right now your app only works with fake bank logins. Real customers can't connect their real bank.

### Part A — Apply to Plaid (do this first, it takes 2–5 days)

1. Open https://dashboard.plaid.com/team/keys in your browser.
2. Sign in with your Plaid account.
3. Look for a button that says **"Request Production Access"** (top right).
4. Fill out their form. Plaid asks:
   - Your company name → **Zero Hero Budget**
   - What you do → "Personal budgeting app that helps users track spending and pay off debt."
   - Live URL → **https://zeroherobudget.com**
   - Privacy policy → **https://zeroherobudget.com/legal**
5. Submit. Wait for their approval email.

### Part B — When Plaid approves you (come back to me)

Just say **"Plaid approved me"** in chat. I'll handle the rest — I just need you to do these 2 clicks:

1. In Lovable, click the **gear icon → Project Settings → Edge Function Secrets**.
2. Update three secrets to the values Plaid gives you:
   - `PLAID_CLIENT_ID` → your live client ID
   - `PLAID_SECRET` → your live production secret
   - Add a new one: `PLAID_ENV` = `production`

That's it. No code touching needed.

---

## ✅ Step 2 — Confirm Stripe is Taking Real Money

**Why:** Make sure when someone hits "Subscribe", real $5 actually moves.

1. Open https://dashboard.stripe.com in your browser.
2. **Top-left corner:** find the toggle that says "Test mode". Make sure it is **OFF** (the dot should be gray, not orange).
3. Click **Developers → API keys**.
4. Confirm the keys you see start with `sk_live_…` and `pk_live_…` (not `sk_test_…`).
5. Now do a real test:
   - Open your app at https://zeroherobudget.com
   - Sign up with a fresh email
   - Click upgrade → enter your real card → pay $5
   - Go back to Stripe Dashboard → **Payments** → confirm $5 shows up
   - Go to your app → Settings → click "Manage Subscription" → cancel it
   - In Stripe, click **Refunds** to refund yourself

If all 6 work — Stripe is good to go. ✅

---

## ✅ Step 3 — Make Sure Your Emails Land in the Inbox (not Spam)

**Why:** If signup confirmation emails go to spam, users never log in.

1. Open https://resend.com/domains in your browser.
2. Find your sending domain (probably `zeroherobudget.com`).
3. Look at the three columns: **SPF**, **DKIM**, **DMARC**.
4. All three must show a green ✅ checkmark.
   - If any is red ❌ → click it, copy the DNS record it shows you, and paste it into your domain provider (where you bought zeroherobudget.com).
   - Wait 1 hour, then refresh. They should turn green.
5. Send yourself a test:
   - Sign up at your app with a personal Gmail address.
   - Check your inbox **and your spam folder**.
   - The confirmation email should arrive in the **inbox** within 1 minute.

---

## ✅ Step 4 — Final QA Walkthrough (30 minutes, do this on your phone)

Pretend you're a brand-new customer. Do every step. If something feels off, tell me.

| # | Do this | Should happen |
|---|---------|---------------|
| 1 | Open https://zeroherobudget.com on your phone | Landing page loads fast, looks clean |
| 2 | Tap "Get Started" → sign up with a fresh email | You receive a confirmation email |
| 3 | Click confirmation link | You land in the onboarding flow |
| 4 | Finish onboarding → reach Dashboard | Dashboard renders with default categories |
| 5 | Tap "Connect Bank" → pick a real bank → log in | Your real accounts appear in the list |
| 6 | Wait 30 seconds, refresh | Real transactions show up under "Transactions" |
| 7 | Add a debt → log a payment to it | The debt balance goes down |
| 8 | Start the 7-day free trial → enter card | Stripe accepts it, no error |
| 9 | Open Settings → Manage Subscription → cancel | Cancellation confirmed |
| 10 | Add the app to your home screen (PWA install) | Icon appears, opens like a native app |

---

## ✅ Step 5 — Open the Doors (Launch Day)

When Steps 1–4 all pass, message me **"ready to launch"**. I'll do two things in 30 seconds:

1. Remove the "Coming Soon" wall so the public sees the real app.
2. Confirm the published version is the latest one.

Then you click **Publish → Update** in the top-right of Lovable to push it live.

🎉 You're live.

---

## What to do right now

**Just do Step 1 Part A today.** That's the only thing with a waiting period — everything else can happen in one afternoon once Plaid approves you.

Come back and tell me **"Plaid approved me"** the moment it happens, and we'll knock out the rest together.
