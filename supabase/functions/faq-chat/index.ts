import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FAQ_KNOWLEDGE = `
# Zero Hero FAQ Knowledge Base

## General Questions

**Q: What is Zero Hero?**
A: Zero Hero is a comprehensive financial management app that helps you transform debt into victory. It combines budget tracking, debt payoff strategies (Snowball and Avalanche methods), subscription management, and household collaboration features to help you achieve financial freedom.

**Q: Is Zero Hero free to use?**
A: Yes! Zero Hero is currently free to use as a prototype. You can access all features including budget tracking, debt management, subscription monitoring, and household collaboration at no cost.

**Q: What debt payoff strategies are available?**
A: Zero Hero offers two proven debt elimination strategies:
- Debt Snowball: Pay off smallest debts first for quick wins and motivation
- Debt Avalanche: Target highest interest rates first to save the most money
Both strategies include visual progress tracking and motivational achievements.

**Q: Can I use Zero Hero with my family?**
A: Absolutely! Zero Hero includes household collaboration features. You can invite family members to join your household, manage shared budgets and expenses, and track financial goals together. Multiple members can work on the same financial data simultaneously.

**Q: What browsers are supported?**
A: Zero Hero works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated to the latest version for optimal performance.

**Q: Can I access Zero Hero on my phone?**
A: Yes! Zero Hero is fully responsive and works seamlessly on mobile devices, tablets, and desktops. Access your financial data anywhere, anytime.

## Account & Authentication

**Q: How do I create an account?**
A: Click "Get Started" on the landing page, which opens a signup modal. Enter your email and create a secure password. You'll be automatically logged in and redirected to your dashboard.

**Q: How do I reset my password?**
A: Click "Forgot Password" on the login page, enter your email, and follow the reset instructions sent to your inbox. The reset link is valid for 24 hours.

**Q: Can I delete my account?**
A: Yes, you can delete your account from Settings. Note that this action is permanent and will remove all your financial data. Export your data first if you need to keep records.

**Q: What payment methods are accepted?**
A: Zero Hero is currently free to use. As we grow, we may introduce premium features with payment options including credit cards and PayPal.

## Data & Privacy

**Q: Is my financial data secure?**
A: Yes! Your data is stored securely using Supabase's enterprise-grade infrastructure with encryption at rest and in transit. We follow industry best practices for financial data protection.

**Q: Do you sell my data to third parties?**
A: Never. We never sell, rent, or share your personal financial data with third parties. Your privacy is paramount. We only use your data to provide and improve Zero Hero services.

**Q: Can I export my data?**
A: Yes! You can export your budget data, transactions, debts, and reports in CSV or PDF format from the respective pages. This allows you to keep local backups or use the data in other applications.

**Q: What happens to my data if I delete my account?**
A: All your data is permanently deleted from our servers within 30 days of account deletion. We retain no copies. Make sure to export any data you need before deleting your account.

## Features Overview

**Budget Tracking:** Create and manage monthly budgets across 10 standard categories including Housing, Utilities, Transportation, Food, and more. Track planned vs actual spending with visual charts.

**Debt Management:** Add all your debts and choose between Snowball or Avalanche payoff strategies. Visualize your debt-free date and track progress with motivational achievements.

**Subscription Management:** Track all your recurring subscriptions, get alerts for upcoming renewals, and identify opportunities to cut unnecessary expenses.

**Reports & Analytics:** Access comprehensive financial reports including income statements, net worth tracking, expense analysis, and cash flow available for debt payments.

**Household Collaboration:** Invite family members, share financial data, and work together toward common financial goals with role-based permissions.

## Troubleshooting

**Q: Why is the app loading slowly?**
A: Try these steps:
1. Check your internet connection
2. Clear your browser cache and cookies
3. Disable browser extensions that might interfere
4. Try accessing from a different browser
5. Refresh the page

**Q: My data isn't syncing across devices**
A: This is expected in prototype mode as data is stored locally in your browser. When authentication is fully implemented, data will sync across all your devices automatically.

**Q: I can't see my transactions**
A: Make sure you've added at least one account first. Transactions require an account to be associated with. Check the Transactions page filters to ensure you're not filtering out all data.

**Q: How do I clear the cache?**
A: In Chrome/Edge: Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
In Firefox: Ctrl+Shift+Del
In Safari: Cmd+Option+E
Select "Cached images and files" and clear for the time range you prefer.

## Getting Started

1. **Create your account** - Click "Get Started" and sign up
2. **Set up your first budget** - Go to Budgets page and add income and expense categories
3. **Add your debts** - Navigate to Debt Snowball page and input all debts with balances and interest rates
4. **Choose a strategy** - Select Snowball or Avalanche method
5. **Track progress** - Monitor your journey on the Dashboard and celebrate achievements!

## Contact & Support

For additional help or questions not covered here:
- Email: support@zerohero.com
- Response time: Within 24-48 hours
- Visit our Help & Support page: /help
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const systemPrompt = `You are Zero Hero's friendly support assistant. Your role is to help users with questions about Zero Hero, a financial management app.

Answer questions using ONLY the FAQ knowledge provided below. Keep responses concise (under 150 words), friendly, and helpful. Use bullet points for lists when appropriate.

If a question is outside the FAQ scope or you're unsure, politely suggest:
1. Visiting the Help & Support page at /help for comprehensive guides
2. Contacting support@zerohero.com for personalized assistance

Be encouraging and supportive - remember that users are on a journey to financial freedom!

${FAQ_KNOWLEDGE}`;

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