import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';
import { buildCors } from "../_shared/cors.ts";

// ── Category groups with keyword hints ───────────────────────────────
const CATEGORY_GROUPS = [
  { group: "Housing",    categories: ["Rent / Mortgage", "Property Taxes", "Home Insurance", "Home Maintenance"], keywords: ["rent", "mortgage", "landlord", "zillow", "home depot", "lowes", "plumber"] },
  { group: "Utilities",  categories: ["Electric", "Water / Sewer", "Internet", "Phone"], keywords: ["electric", "power", "comcast", "xfinity", "spectrum", "t-mobile", "verizon", "at&t"] },
  { group: "Transportation", categories: ["Car Payment", "Gas / Fuel", "Car Insurance", "Maintenance / Repairs", "Public Transportation"], keywords: ["shell", "chevron", "exxon", "geico", "progressive", "uber", "lyft", "metro"] },
  { group: "Food",       categories: ["Groceries", "Restaurants / Takeout", "Coffee / Snacks"], keywords: ["whole foods", "kroger", "aldi", "doordash", "uber eats", "starbucks", "mcdonald", "chipotle"] },
  { group: "Health",     categories: ["Health Insurance", "Medical / Doctor", "Pharmacy", "Gym / Fitness"], keywords: ["cvs", "walgreens", "pharmacy", "doctor", "copay", "blue cross", "planet fitness"] },
  { group: "Lifestyle",  categories: ["Shopping", "Entertainment", "Hobbies", "Subscriptions"], keywords: ["amazon", "target", "netflix", "spotify", "hulu", "disney+", "apple music"] },
  { group: "Financial",  categories: ["Savings", "Investments", "Debt Payments", "Emergency Fund"], keywords: ["savings", "transfer", "robinhood", "credit card payment", "student loan"] },
  { group: "Family / Personal", categories: ["Childcare", "Pets", "Personal Care"], keywords: ["daycare", "vet", "petsmart", "salon", "barber"] },
  { group: "Children & Education", categories: ["Tuition / School Fees", "School Supplies", "Activities / Lessons"], keywords: ["tuition", "school", "textbook", "lesson"] },
  { group: "Other",      categories: ["Gifts / Donations", "Travel", "Miscellaneous"], keywords: ["gift", "donation", "airline", "hotel", "airbnb", "atm", "cash"] },
];

// Flat list of all valid category names
const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap(g => g.categories);

// Helper to sanitize strings for SQL LIKE patterns
const sanitizeForLike = (str: string): string => {
  return str.replace(/[%_\\]/g, '\\$&');
};

// Simple in-memory rate limiter per user
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60000;

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (userLimit.count >= RATE_LIMIT_MAX) return false;
  userLimit.count++;
  return true;
};

serve(async (req) => {
  const corsHeaders = buildCors(req);
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
    if (typeof description !== 'string' || description.length > 500) {
      return new Response(
        JSON.stringify({ error: "Invalid description format or length" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const userId = user.id;

    if (!checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment before trying again." }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Query user's categorization history
    let historicalContext = "";
    const firstWord = sanitizeForLike(description.split(' ')[0] || '');
    if (firstWord.length > 0) {
      const { data: history } = await supabase
        .from('transaction_categorization_history')
        .select('transaction_description, user_selected_category')
        .ilike('transaction_description', `%${firstWord}%`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (history && history.length > 0) {
        historicalContext = `\n\nUser's past categorization patterns:\n${
          history.map(h => `- "${h.transaction_description}" → ${h.user_selected_category}`).join('\n')
        }`;
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

    // Build keyword hints for the prompt
    const keywordHints = CATEGORY_GROUPS.map(g =>
      `${g.group}: ${g.categories.join(", ")} — keywords: ${g.keywords.join(", ")}`
    ).join("\n");

    const systemPrompt = `You are a financial transaction categorization assistant. Analyze the description and suggest the best category.

Available category groups and their sub-categories:
${keywordHints}

Return ONLY one category name from the sub-categories above (e.g. "Groceries", "Gas / Fuel", "Subscriptions"). Return the exact name, no explanation.

Examples:
- "Whole Foods Market" → Groceries
- "Shell Gas Station" → Gas / Fuel
- "Netflix" → Subscriptions
- "Duke Energy" → Electric
- "State Farm" → Car Insurance
- "Starbucks" → Coffee / Snacks
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

    // Validate against our known categories
    if (!ALL_CATEGORIES.includes(suggestedCategory)) {
      const match = ALL_CATEGORIES.find(cat =>
        suggestedCategory.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(suggestedCategory.toLowerCase())
      );
      suggestedCategory = match || "Miscellaneous";
    }

    return new Response(
      JSON.stringify({ category: suggestedCategory, confidence: "high" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in categorize-transaction function:", error);
    return new Response(
      JSON.stringify({ error: "Unable to categorize transaction. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
