import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLAID_BASE = "https://sandbox.plaid.com";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate
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

    const clientId = Deno.env.get("PLAID_CLIENT_ID");
    const secret = Deno.env.get("PLAID_SECRET");
    if (!clientId || !secret) {
      return new Response(JSON.stringify({ error: "Plaid not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const publicToken = body?.public_token;
    if (!publicToken || typeof publicToken !== "string") {
      return new Response(JSON.stringify({ error: "Missing public_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Exchange public token for access token
    const exchangeRes = await fetch(`${PLAID_BASE}/item/public_token/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, secret, public_token: publicToken }),
    });
    const exchangeData = await exchangeRes.json();

    if (!exchangeRes.ok) {
      console.error("Plaid exchange error:", JSON.stringify(exchangeData));
      return new Response(JSON.stringify({ error: "Token exchange failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = exchangeData.access_token;
    const itemId = exchangeData.item_id;

    // Get accounts
    const accountsRes = await fetch(`${PLAID_BASE}/accounts/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, secret, access_token: accessToken }),
    });
    const accountsData = await accountsRes.json();

    if (!accountsRes.ok) {
      console.error("Plaid accounts error:", JSON.stringify(accountsData));
      return new Response(JSON.stringify({ error: "Failed to retrieve accounts" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get institution info
    const institutionId = accountsData.item?.institution_id;
    let institutionName = "Unknown Bank";
    if (institutionId) {
      try {
        const instRes = await fetch(`${PLAID_BASE}/institutions/get_by_id`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: clientId,
            secret,
            institution_id: institutionId,
            country_codes: ["US"],
          }),
        });
        const instData = await instRes.json();
        if (instRes.ok && instData.institution?.name) {
          institutionName = instData.institution.name;
        }
      } catch {
        // Non-critical, keep default name
      }
    }

    // Map to sanitized account metadata — never send access_token to client
    const accounts = (accountsData.accounts || []).map((acc: any) => {
      const subtype = acc.subtype || acc.type || "depository";
      const typeMap: Record<string, string> = {
        checking: "checking",
        savings: "savings",
        credit: "credit",
        "credit card": "credit",
        loan: "loan",
        mortgage: "loan",
        investment: "investment",
        brokerage: "investment",
        "401k": "investment",
        ira: "investment",
      };
      const accountType = typeMap[subtype] || subtype;

      return {
        id: acc.account_id,
        institutionId: institutionId || itemId,
        institutionName: escapeHtml(institutionName),
        maskedAccountName: `${escapeHtml(acc.name || accountType)} ••${acc.mask || "0000"}`,
        accountType,
        accessToken: `plaid-item-${itemId}`, // opaque reference, not the real token
        status: "active",
        linkedAt: new Date().toISOString(),
        balance: acc.balances?.current ?? null,
      };
    });

    return new Response(JSON.stringify({ accounts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("exchange-plaid-token error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
