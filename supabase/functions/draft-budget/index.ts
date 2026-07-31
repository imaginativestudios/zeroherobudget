import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCors } from "../_shared/cors.ts";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

serve(async (req) => {
  const corsHeaders = buildCors(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { income, expenses, debts, transactions, subscriptions } = await req.json();

    // Validate input lengths
    if (expenses?.length > 200 || debts?.length > 100 || transactions?.length > 500 || subscriptions?.length > 100) {
      return new Response(JSON.stringify({ error: "Too much data provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const totalPlanned = (expenses || []).reduce((s: number, e: any) => s + (e.currentAmount || 0), 0);
    const unassigned = Math.max(0, (income || 0) - totalPlanned);

    // Build 3-month category averages from transactions
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const recentTx = (transactions || []).filter((t: any) => {
      if (t.flow !== "out") return false;
      const d = new Date(t.date);
      return d >= threeMonthsAgo && d <= now;
    });

    const categoryTotals: Record<string, number> = {};
    recentTx.forEach((t: any) => {
      const cat = t.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (t.amount || 0);
    });
    const monthsElapsed = Math.max(1, Math.min(3, (now.getTime() - threeMonthsAgo.getTime()) / (30 * 24 * 60 * 60 * 1000)));
    const categoryAverages = Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      monthlyAverage: Math.round(total / monthsElapsed),
    }));

    // Upcoming bills (subscriptions due within 14 days)
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const upcomingBills = (subscriptions || [])
      .filter((s: any) => {
        if (!s.is_active || !s.next_billing_date) return false;
        const d = new Date(s.next_billing_date);
        return d >= now && d <= fourteenDaysFromNow;
      })
      .map((s: any) => ({
        name: escapeHtml(String(s.name || "").slice(0, 100)),
        amount: s.amount,
        dueDate: s.next_billing_date,
        daysUntilDue: Math.ceil((new Date(s.next_billing_date).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
      }));

    // High-interest debt info
    const highInterestDebts = (debts || [])
      .filter((d: any) => d.interestRate > 20 && d.balance > 0)
      .sort((a: any, b: any) => b.interestRate - a.interestRate);

    const systemPrompt = `You are a supportive zero-based budget coach for the app "Zero Hero". 
Your job is to suggest how to allocate every unassigned dollar to budget categories.

RULES:
1. Allocate fixed bills first (Housing, Utilities, Insurance, Transportation).
2. Use 3-month historical spending averages for variable categories (Groceries, Gas, Entertainment, Dining).
3. If high-interest debt (>20% APR) exists, allocate 10% of any surplus to extra debt payments.
4. Prioritize bills due soonest.
5. Every dollar must have a job — total allocations should equal income (${income || 0}).
6. For each allocation, provide a 1-sentence reasoning explaining WHY.
7. If an expense already has a planned amount, you may adjust it up or down based on data.
8. Be encouraging and specific in your reasoning.`;

    const userPrompt = `Here is my financial snapshot:

**Monthly Income:** $${income || 0}
**Currently Unassigned:** $${unassigned}

**Current Budget Categories:**
${(expenses || []).map((e: any) => `- ${escapeHtml(String(e.name || "").slice(0, 100))} (${escapeHtml(String(e.category || "").slice(0, 50))}): currently $${e.currentAmount || 0}/mo`).join("\n")}

**Debts:**
${(debts || []).length === 0 ? "None" : (debts || []).map((d: any) => `- ${escapeHtml(String(d.name || "").slice(0, 100))}: $${d.balance} balance, ${d.interestRate}% APR, $${d.minimumPayment} min payment`).join("\n")}

**3-Month Spending Averages:**
${categoryAverages.length === 0 ? "No transaction history yet" : categoryAverages.map((c) => `- ${escapeHtml(c.category)}: $${c.monthlyAverage}/mo average`).join("\n")}

**Bills Due Within 14 Days:**
${upcomingBills.length === 0 ? "None" : upcomingBills.map((b: any) => `- ${b.name}: $${b.amount} due in ${b.daysUntilDue} days`).join("\n")}

${highInterestDebts.length > 0 ? `\n**High-Interest Alert:** ${highInterestDebts[0].name} has ${highInterestDebts[0].interestRate}% APR. Consider allocating 10% of surplus ($${Math.round(unassigned * 0.1)}) to extra payments.` : ""}

Please draft budget allocations for ALL my categories. For each, suggest the right dollar amount and explain why.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_budget_allocations",
              description: "Return suggested budget allocations for all expense categories with reasoning.",
              parameters: {
                type: "object",
                properties: {
                  allocations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        expenseId: { type: "string", description: "The expense ID if updating an existing category, or 'new' for a new suggestion" },
                        name: { type: "string", description: "Category/expense name" },
                        category: { type: "string", description: "Budget category" },
                        suggestedAmount: { type: "number", description: "Suggested monthly dollar amount" },
                        reasoning: { type: "string", description: "1-sentence explanation for this allocation" },
                      },
                      required: ["expenseId", "name", "category", "suggestedAmount", "reasoning"],
                      additionalProperties: false,
                    },
                  },
                  summary: {
                    type: "string",
                    description: "A brief 2-3 sentence overall summary of the budget strategy.",
                  },
                },
                required: ["allocations", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_budget_allocations" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Failed to generate budget draft" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "AI did not return structured data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("draft-budget error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? "An error occurred generating your budget draft" : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
