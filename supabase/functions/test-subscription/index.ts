import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[TEST-SUBSCRIPTION] ${step}`, details ? JSON.stringify(details) : '');
};

const getTierName = (amountCents: number): string => {
  if (amountCents <= 500) return "Starter";
  if (amountCents <= 900) return "Supporter";
  if (amountCents <= 1200) return "Champion";
  return "Hero";
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // SECURITY: Block in production environment
  const environment = Deno.env.get("ENVIRONMENT");
  if (environment === "production") {
    logStep("BLOCKED: Production environment");
    return new Response(JSON.stringify({ error: "Endpoint disabled in production" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Create client with service role for updating profiles
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Create client with user's auth for getting user info
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUser = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  try {
    // Verify user authentication
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims?.sub) {
      logStep("Auth failed", { error: claimsError?.message });
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    
    // SECURITY: Check if user is admin (additional protection layer)
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    const isAdmin = !!roleData;
    
    // Only allow if in dev environment OR user is admin
    if (!isAdmin && environment !== "development") {
      logStep("BLOCKED: Non-admin user in non-dev environment", { userId });
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("User authenticated", { userId, isAdmin });

    const { action, tier, amount } = await req.json();
    const amountCents = amount || 1500;
    const tierName = tier || getTierName(amountCents);

    logStep("Processing action", { action, tier: tierName, amount: amountCents });

    let updateData: Record<string, unknown>;

    if (action === "activate") {
      updateData = {
        subscription_status: "active",
        subscription_tier: tierName,
        subscription_amount: amountCents,
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else if (action === "trial") {
      updateData = {
        subscription_status: "trialing",
        subscription_tier: tierName,
        subscription_amount: amountCents,
        subscription_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else if (action === "clear") {
      updateData = {
        subscription_status: "free",
        subscription_tier: null,
        subscription_amount: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      };
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (updateError) {
      logStep("ERROR: Failed to update profile", { error: updateError.message });
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Profile updated successfully", { action, userId });

    return new Response(JSON.stringify({ success: true, action }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    logStep("ERROR: Unexpected error", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
