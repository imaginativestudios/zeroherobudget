import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FAQ_KNOWLEDGE = `
# Zero Hero FAQ Knowledge Base

## General Questions

**Q: What is Zero Hero?**
A: Zero Hero is your companion on the Hero's Journey to financial freedom. It combines your War Map (budget tracking), Battle Plan (debt payoff strategies like Snowball and Avalanche), subscription management, and household collaboration features to help you vanquish your Balance Foes and become Victorious.

**Q: Does Zero Hero offer a free trial?**
A: Zero Hero offers a 7-day free trial to help you get started. After your trial, affordable subscription plans give you full access to your War Map, Battle Plan, Quest Log (transactions), Intel Center (reports), and household collaboration features.

**Q: What debt payoff strategies are available?**
A: Zero Hero offers two proven tactics for slaying Balance Foes:
- Snowball: Target smallest Balance Foes first for quick victories and motivation
- Avalanche: Target highest interest rates first to save the most gold
Both strategies include visual progress tracking and heroic achievements.

**Q: Can I use Zero Hero with my family?**
A: Absolutely! Zero Hero includes household collaboration features. You can invite fellow heroes to join your household, manage shared War Maps and deployments, and track financial quests together.

**Q: What browsers are supported?**
A: Zero Hero works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for optimal performance.

**Q: Can I access Zero Hero on my phone?**
A: Yes! Zero Hero is fully responsive and works seamlessly on mobile devices, tablets, and desktops. Access your financial kingdom anywhere, anytime.

## Account & Authentication

**Q: How do I create an account?**
A: Click "Get Started" on the landing page, which opens a signup modal. Enter your email and create a secure password. You'll be automatically logged in and redirected to your dashboard.

**Q: How do I reset my password?**
A: Click "Forgot Password" on the login page, enter your email, and follow the reset instructions sent to your inbox. The reset link is valid for 24 hours.

**Q: Can I delete my account?**
A: Yes, you can delete your account from Settings. Note that this action is permanent and will remove all your financial data. Export your data first if you need to keep records.

**Q: What payment methods are accepted?**
A: Zero Hero accepts credit cards through our secure Stripe integration for subscription payments.

## Data & Privacy

**Q: Is my financial data secure?**
A: Yes! Your data is stored securely using Supabase's enterprise-grade infrastructure with encryption at rest and in transit. We follow industry best practices for financial data protection.

**Q: Do you sell my data to third parties?**
A: Never. We never sell, rent, or share your personal financial data with third parties. Your privacy is paramount.

**Q: Can I export my data?**
A: Yes! You can export your War Map data, Quest Log (transactions), Balance Foes (debts), and Intel (reports) in CSV or PDF format from the respective pages.

**Q: What happens to my data if I delete my account?**
A: All your data is permanently deleted from our servers within 30 days of account deletion. We retain no copies. Make sure to export any data you need before deleting your account.

## Features Overview

**War Map (Budget):** Create and manage monthly plans across 10 standard categories including Housing, Utilities, Transportation, Food, and more. Track planned vs actual deployments with visual charts.

**Battle Plan (Debt Management):** Add all your Balance Foes and choose between Snowball or Avalanche tactics. Visualize your victory date and track progress with heroic achievements.

**Subscription Management:** Track all your recurring obligations, get alerts for upcoming renewals, and identify opportunities to cut unnecessary deployments.

**Intel Center (Reports):** Access comprehensive financial intelligence including income analysis, Kingdom Wealth (net worth) tracking, War Chest analysis, and deployment breakdowns.

**Household Collaboration:** Invite fellow heroes, share financial data, and work together toward common financial quests with role-based permissions.

## Troubleshooting

**Q: Why is the app loading slowly?**
A: Try these steps:
1. Check your internet connection
2. Clear your browser cache and cookies
3. Disable browser extensions that might interfere
4. Try accessing from a different browser
5. Refresh the page

**Q: My data isn't syncing across devices**
A: Ensure you're logged in with the same account on all devices. Data syncs automatically when you're authenticated.

**Q: I can't see my Quest Log entries**
A: Make sure you've added at least one account first. Quest Log entries require an account to be associated with. Check the filters to ensure you're not filtering out all data.

**Q: How do I clear the cache?**
A: In Chrome/Edge: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
In Firefox: Ctrl+Shift+Del
In Safari: Cmd+Option+E
Select "Cached images and files" and clear for the time range you prefer.

## Getting Started

1. **Create your account** - Click "Get Started" and sign up
2. **Set up your War Map** - Go to War Map page and add income and deployment categories
3. **Add your Balance Foes** - Navigate to Battle Plan page and input all Balance Foes with balances and interest rates
4. **Choose your tactics** - Select Snowball or Avalanche method
5. **Track your quest** - Monitor your journey on the Dashboard and celebrate Victories!

## Contact & Support

For additional help or questions not covered here:
- Email: support@zeroherobudget.com
- Response time: Within 24-48 hours
- Visit our Help & Support page: /help
`;

const FINANCIAL_KNOWLEDGE = `
# Financial Wisdom Knowledge Base

## Emergency Fund Fundamentals

**Why 3-6 months of expenses?**
An emergency fund covers unexpected job loss, medical bills, or major repairs without going into debt. This cushion provides peace of mind and financial stability. Start with $1,000, then work toward 3-6 months of essential expenses.

**Where to keep it:**
Store your emergency fund in a high-yield savings account (4-5% APY) that's easily accessible but separate from checking. Online banks like Marcus, Ally, and American Express offer competitive rates with no minimums.

**Building it slowly:**
Even saving $25-50 per paycheck adds up. Automate transfers on payday—treat savings like a non-negotiable bill. Small consistent contributions beat irregular large deposits.

## The 50/30/20 Rule

This widely-recognized budgeting framework allocates:
- **50% to Needs:** Housing, utilities, food, insurance, minimum debt payments
- **30% to Wants:** Entertainment, dining out, hobbies, subscriptions
- **20% to Savings & Debt:** Emergency fund, retirement, extra debt payments

**Modification for aggressive debt payoff:** Consider 50/20/30 to accelerate progress while maintaining balance.

## Debt Payoff Strategies

**Debt Snowball Method:**
Pay smallest balances first regardless of interest rate. Quick wins provide psychological motivation and momentum. Best for those needing encouragement and visible progress.

**Debt Avalanche (Mathematically optimal):**
Pay highest interest rates first to minimize total interest paid. Saves the most money long-term. Best for disciplined individuals focused on maximum efficiency.

**Hybrid approach:**
Start with snowball for initial motivation, switch to avalanche once momentum builds. Combines psychological benefits with mathematical optimization.

**What to avoid:**
Never use payday loans (300%+ APR), rent-to-own schemes, or high-interest store cards. Build emergency fund to avoid these predatory traps.

## Credit Score Factors

Your score (300-850) breaks down as:
- **Payment history (35%):** Always pay on time—set up autopay
- **Credit utilization (30%):** Keep balances below 30% of limits, ideally below 10%
- **Length of history (15%):** Don't close old accounts
- **Credit mix (10%):** Mix of credit types helps slightly
- **New inquiries (10%):** Limit new credit applications

**Quick improvements:**
Request credit limit increases to lower utilization ratio instantly. Dispute errors on credit reports—bureaus must investigate within 30 days. Monitor free through AnnualCreditReport.com and credit card services.

## Smart Saving Strategies

**Automate everything:**
Set up automatic transfers on payday before you see the money. Removes willpower from equation. Even $25 per paycheck builds the habit and adds up over time.

**High-yield savings accounts:**
Traditional banks pay under 0.5%. Online banks offer 4-5% APY—that's free money for being smart about where you park cash. Every dollar works harder.

**Sinking funds:**
Create mini-savings for predictable irregular expenses: car repairs, insurance premiums, holiday gifts. Divide annual costs by 12 for monthly contributions. Eliminates financial stress from "expected surprises."

**Pay yourself first:**
Before paying bills or discretionary spending, automatically transfer money to savings. This prioritizes your financial future—you adjust spending around what remains.

## Investing Basics

**Start early with compound interest:**
$100/month from age 25 to 65 at 8% returns = $265,000. Wait until 35 = only $122,000. Time is your biggest advantage. Even small regular contributions leverage compounding powerfully.

**Employer 401(k) match:**
This is free money—prioritize contributing enough to capture full match before other investing. Typical match: 50% of first 6% you contribute = instant 50% return.

**Index funds vs. individual stocks:**
Index funds provide instant diversification across hundreds of companies with minimal fees (0.03-0.20%). Most investors beat the market less than 10% of the time. Simple portfolio: 70% total stock market index, 30% total bond market, rebalanced annually.

**Power of compound interest:**
Einstein called it the "eighth wonder." $10,000 at 8% becomes $46,610 in 20 years without adding another dollar. Your returns generate their own returns exponentially.

## Common Financial Mistakes

**Lifestyle inflation:**
When income increases, expenses often rise proportionally. Combat by committing 50% of raises to savings before adjusting lifestyle. Live like you got a 50% raise, save the other 50%.

**No emergency fund:**
Without savings, every unexpected expense becomes a crisis requiring high-interest debt. This creates vicious cycles. Your emergency fund is financial insurance—essential even if you hope to never use it.

**Ignoring retirement:**
Social Security replaces only ~40% of pre-retirement income. Waiting means missing decades of compound growth. Aim to save 15% of gross income for retirement including employer match. Starting in your 20s, even modestly, far exceeds large contributions starting in your 40s.

**Not tracking spending:**
You can't improve what you don't measure. Track expenses for one month to identify leaks. Most people are shocked by subscription accumulation and small daily purchases that add up.

## Financial Milestones to Celebrate

**First $1,000 saved:**
Breaks the paycheck-to-paycheck cycle. Small buffer against surprises. Proves you can build wealth—harder than it seems.

**Debt-free (except mortgage):**
Eliminating consumer debt frees cash flow for wealth building. Former debt payments can now fund investments. Many find this transformative. Don't inflate lifestyle immediately—redirect payments to savings.

**3-month emergency fund:**
Covers most short-term setbacks. Significantly reduces financial anxiety. Keep building toward 6 months.

**6-month emergency fund:**
True financial stability. Can weather most storms: job loss, medical issues, major repairs. Once fully funded, redirect contributions to wealth-building investments.

**Positive net worth:**
Assets exceed liabilities. Psychological milestone showing you're building wealth, not just servicing debt.

## Additional Wisdom

**Good debt vs. bad debt:**
Good debt builds assets or earning potential with reasonable rates (mortgages, student loans). Bad debt funds consumption without creating value (high-interest credit cards, payday loans). Prioritize paying off anything above 8% interest rate.

**Tax-advantaged accounts:**
401(k), IRA, HSA provide tax benefits that supercharge wealth building. Contribute to these before taxable investment accounts. HSA is triple tax-advantaged if used for medical expenses.

**Insurance needs:**
Health, auto, renter's/homeowner's insurance protect against catastrophic losses. Term life insurance if others depend on your income. Skip unnecessary warranties and insurance on items you could replace out-of-pocket.

**Negotiation saves thousands:**
Negotiate salary, credit card interest rates, medical bills, cable/internet, and insurance premiums. A single successful salary negotiation can add $100,000+ over a career. Most people never ask.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate the JWT token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Invalid authentication:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const { messages } = await req.json();
    console.log("Received chat request with", messages?.length || 0, "messages");

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are Zero Hero's friendly assistant. You help users with:
1. Questions about the Zero Hero app (features, how-to, troubleshooting)
2. General personal finance advice and best practices

Use the knowledge bases provided below to answer questions. Keep responses concise (under 150 words), friendly, and actionable. Use bullet points for clarity.

For app questions, reference the FAQ. For financial advice, cite general best practices without giving specific investment recommendations. For complex personal situations, suggest consulting a licensed financial professional.

Be encouraging and supportive - users are on a journey to financial freedom!

${FAQ_KNOWLEDGE}

${FINANCIAL_KNOWLEDGE}`;

    console.log("Calling Lovable AI with google/gemini-2.5-flash model");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "I'm a bit busy right now. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "The assistant is temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to get response from AI service" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from Lovable AI");

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Error in faq-chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});