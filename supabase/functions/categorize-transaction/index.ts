import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CATEGORIES = [
  "Housing",
  "Utilities",
  "Transportation",
  "Food",
  "Insurance & Healthcare",
  "Personal Care",
  "Entertainment",
  "Savings & Investments",
  "Debt Payments",
  "Miscellaneous"
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, amount } = await req.json();
    
    if (!description) {
      return new Response(
        JSON.stringify({ error: "Transaction description is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a financial transaction categorization assistant. Your job is to analyze transaction descriptions and suggest the most appropriate category.

Available categories:
${CATEGORIES.map((cat, i) => `${i + 1}. ${cat}`).join('\n')}

Analyze the transaction description and amount (if provided) and return ONLY the category name that best fits. Return exactly one category name from the list above, with no additional text or explanation.

Examples:
- "Whole Foods Market" → Food
- "Shell Gas Station" → Transportation
- "Netflix Subscription" → Entertainment
- "Electric Company" → Utilities
- "Mortgage Payment" → Housing
- "CVS Pharmacy" → Insurance & Healthcare
- "Target" → Personal Care (if small amount) or Miscellaneous
- "Starbucks" → Food
- "ATM Withdrawal" → Miscellaneous`;

    const userPrompt = amount 
      ? `Transaction: "${description}", Amount: $${amount.toFixed(2)}`
      : `Transaction: "${description}"`;

    console.log("Categorizing transaction:", userPrompt);

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service requires payment. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to categorize transaction" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let suggestedCategory = data.choices?.[0]?.message?.content?.trim() || "";
    
    console.log("AI suggested category:", suggestedCategory);
    
    // Validate the category is one of our allowed categories
    if (!CATEGORIES.includes(suggestedCategory)) {
      // Try to find a partial match
      const match = CATEGORIES.find(cat => 
        suggestedCategory.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(suggestedCategory.toLowerCase())
      );
      suggestedCategory = match || "Miscellaneous";
      console.log("Adjusted category to:", suggestedCategory);
    }

    return new Response(
      JSON.stringify({ 
        category: suggestedCategory,
        confidence: "high" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in categorize-transaction function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
