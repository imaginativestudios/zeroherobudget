import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { buildCors } from "../_shared/cors.ts";

const PLAID_ENV = (Deno.env.get("PLAID_ENV") || "sandbox").toLowerCase();
const PLAID_BASE =
  PLAID_ENV === "production" ? "https://production.plaid.com"
  : PLAID_ENV === "development" ? "https://development.plaid.com"
  : "https://sandbox.plaid.com";

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
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

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    const clientId = Deno.env.get("PLAID_CLIENT_ID");
    const secret = Deno.env.get("PLAID_SECRET");
    if (!clientId || !secret) {
      console.error("Missing PLAID_CLIENT_ID or PLAID_SECRET");
      return new Response(JSON.stringify({ error: "Plaid not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional body: { item_id } switches to Plaid update mode (reconnect)
    let itemId: string | null = null;
    try {
      const raw = await req.text();
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.item_id != null) {
          if (typeof parsed.item_id !== "string" || parsed.item_id.length > 100) {
            return new Response(JSON.stringify({ error: "Invalid item_id" }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          itemId = parsed.item_id;
        }
      }
    } catch {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // New bank links require an active/trialing subscription (or beta access).
    if (!itemId) {
      const allowed = await hasBankLinkingAccess(userId, userData.user.email ?? null);
      if (!allowed) {
        return new Response(JSON.stringify({ error: "subscription_required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const linkBody: Record<string, unknown> = {
      client_id: clientId,
      secret,
      user: { client_user_id: userId },
      client_name: "Zero Hero Budget",
      country_codes: ["US"],
      language: "en",
    };

    if (itemId) {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        { auth: { persistSession: false } }
      );
      const { data: item, error: itemErr } = await supabaseAdmin
        .from("plaid_items")
        .select("user_id, access_token")
        .eq("id", itemId)
        .maybeSingle();
      if (itemErr || !item) {
        return new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (item.user_id !== userId) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      linkBody.access_token = item.access_token;
    } else {
      linkBody.products = ["transactions"];
    }

    const redirectUri = Deno.env.get("PLAID_REDIRECT_URI");
    if (redirectUri) linkBody.redirect_uri = redirectUri;

    const plaidRes = await fetch(`${PLAID_BASE}/link/token/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(linkBody),
    });

    const plaidData = await plaidRes.json();

    if (!plaidRes.ok) {
      console.error("Plaid error:", JSON.stringify(plaidData));
      return new Response(JSON.stringify({ error: "Failed to create link token" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ link_token: plaidData.link_token }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-link-token error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function hasBankLinkingAccess(userId: string, email: string | null): Promise<boolean> {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("beta_access")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.beta_access === true) return true;

  if (!email) return false;
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    console.error("STRIPE_SECRET_KEY is not set");
    return false;
  }
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length === 0) return false;
  const customerId = customers.data[0].id;

  const active = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
  if (active.data.length > 0) return true;
  const trialing = await stripe.subscriptions.list({ customer: customerId, status: "trialing", limit: 1 });
  return trialing.data.length > 0;
}
