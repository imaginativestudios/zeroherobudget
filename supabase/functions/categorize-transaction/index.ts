import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

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

// Helper to sanitize strings for SQL LIKE patterns
const sanitizeForLike = (str: string): string => {
  return str.replace(/[%_\\]/g, '\\$&');
};

// Simple in-memory rate limiter per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10; // max requests per window
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  userLimit.count++;
  return true;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, amount } = await req.json();
    
    // Input validation
    if (!description) {
      return new Response(
        JSON.stringify({ error: "Transaction description is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate description length to prevent abuse
    if (typeof description !== 'string' || description.length > 500) {
      return new Response(
        JSON.stringify({ error: "Invalid description format or length" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization header for authenticated requests
    const authHeader = req.headers.get('authorization');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader ?? '' } }
    });
    
    // Get user ID for rate limiting
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    }
    
    // Check rate limit for authenticated users
    if (userId && !checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment before trying again." }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Query user's categorization history for similar transactions
    let historicalContext = "";
    if (authHeader) {
      // Sanitize input for LIKE pattern to prevent pattern injection
      const firstWord = sanitizeForLike(description.split(' ')[0] || '');
      
      if (firstWord.length > 0) {
        const { data: history } = await supabase
          .from('transaction_categorization_history')
          .select('transaction_description, user_selected_category')
          .ilike('transaction_description', `%${firstWord}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (history && history.length > 0) {
          historicalContext = `\n\nUser's past categorization patterns for similar transactions:\n${
            history.map(h => `- "${h.transaction_description}" → ${h.user_selected_category}`).join('\n')
          }`;
        }
      }
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
- "ATM Withdrawal" → Miscellaneous${historicalContext}`;

    const userPrompt = amount 
      ? `Transaction: "${description}", Amount: $${amount.toFixed(2)}`
      : `Transaction: "${description}"`;

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
    
    // Validate the category is one of our allowed categories
    if (!CATEGORIES.includes(suggestedCategory)) {
      // Try to find a partial match
      const match = CATEGORIES.find(cat => 
        suggestedCategory.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(suggestedCategory.toLowerCase())
      );
      suggestedCategory = match || "Miscellaneous";
    }

    return new Response(
      JSON.stringify({ 
        category: suggestedCategory,
        confidence: "high" 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Log detailed error server-side only
    console.error("Error in categorize-transaction function:", error);
    // Return generic error to client
    return new Response(
      JSON.stringify({ error: "Unable to categorize transaction. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
