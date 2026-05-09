import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLAID_ENV = (Deno.env.get("PLAID_ENV") || "sandbox").toLowerCase();
const PLAID_BASE =
  PLAID_ENV === "production" ? "https://production.plaid.com"
  : PLAID_ENV === "development" ? "https://development.plaid.com"
  : "https://sandbox.plaid.com";

function jsonError(status: number, error: string) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return jsonError(401, "Unauthorized");

    // Auth client (uses caller's JWT)
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
    if (userErr || !userData?.user) return jsonError(401, "Unauthorized");
    const userId = userData.user.id;

    // Service role client (writes plaid_items / accounts)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const clientId = Deno.env.get("PLAID_CLIENT_ID");
    const secret = Deno.env.get("PLAID_SECRET");
    if (!clientId || !secret) return jsonError(500, "Plaid not configured");

    const body = await req.json();
    const publicToken = body?.public_token;
    if (!publicToken || typeof publicToken !== "string") {
      return jsonError(400, "Missing public_token");
    }

    // Exchange public_token -> access_token
    const exchangeRes = await fetch(`${PLAID_BASE}/item/public_token/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, secret, public_token: publicToken }),
    });
    const exchangeData = await exchangeRes.json();
    if (!exchangeRes.ok) {
      console.error("Plaid exchange error:", exchangeData);
      return jsonError(502, "Token exchange failed");
    }
    const accessToken: string = exchangeData.access_token;
    const itemId: string = exchangeData.item_id;

    // Get accounts (and item.institution_id)
    const accountsRes = await fetch(`${PLAID_BASE}/accounts/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, secret, access_token: accessToken }),
    });
    const accountsData = await accountsRes.json();
    if (!accountsRes.ok) {
      console.error("Plaid accounts error:", accountsData);
      return jsonError(502, "Failed to retrieve accounts");
    }

    // Institution name (best effort)
    const institutionId: string | null = accountsData.item?.institution_id ?? null;
    let institutionName = "Unknown Bank";
    if (institutionId) {
      try {
        const instRes = await fetch(`${PLAID_BASE}/institutions/get_by_id`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: clientId, secret, institution_id: institutionId, country_codes: ["US"],
          }),
        });
        const instData = await instRes.json();
        if (instRes.ok && instData.institution?.name) institutionName = instData.institution.name;
      } catch { /* non-critical */ }
    }

    // Resolve household (primary household_id if any)
    const { data: hm } = await supabaseAdmin
      .from("household_members")
      .select("household_id")
      .eq("profile_id", userId)
      .eq("is_primary", true)
      .maybeSingle();
    const householdId: string | null = hm?.household_id ?? null;

    // Insert plaid_items (upsert on item_id)
    const { data: itemRow, error: itemErr } = await supabaseAdmin
      .from("plaid_items")
      .upsert(
        {
          user_id: userId,
          household_id: householdId,
          item_id: itemId,
          access_token: accessToken,
          institution_id: institutionId,
          institution_name: institutionName,
          status: "active",
        },
        { onConflict: "item_id" }
      )
      .select("id")
      .single();
    if (itemErr || !itemRow) {
      console.error("plaid_items upsert error:", itemErr);
      return jsonError(500, "Failed to save bank connection");
    }

    // Map Plaid type -> our account type
    const typeMap: Record<string, string> = {
      depository: "checking",
      checking: "checking",
      savings: "savings",
      credit: "credit",
      "credit card": "credit",
      loan: "loan",
      mortgage: "loan",
      investment: "investment",
      brokerage: "investment",
    };

    const plaidAccounts = accountsData.accounts || [];
    const accountRows = plaidAccounts.map((acc: any) => {
      const subtype = (acc.subtype || acc.type || "depository").toString().toLowerCase();
      const accountType = typeMap[subtype] || "checking";
      return {
        user_id: userId,
        household_id: householdId,
        name: `${acc.name || institutionName} ••${acc.mask || "0000"}`,
        type: accountType,
        balance: acc.balances?.current ?? 0,
        is_active: true,
        plaid_account_id: acc.account_id,
        plaid_item_id: itemRow.id,
      };
    });

    // Upsert accounts on plaid_account_id
    if (accountRows.length > 0) {
      const { error: accErr } = await supabaseAdmin
        .from("accounts")
        .upsert(accountRows, { onConflict: "plaid_account_id" });
      if (accErr) {
        console.error("accounts upsert error:", accErr);
        return jsonError(500, "Failed to save accounts");
      }
    }

    // Re-read for client (sanitized — no tokens)
    const { data: saved } = await supabaseAdmin
      .from("accounts")
      .select("id, name, type, balance, plaid_account_id, plaid_item_id")
      .eq("plaid_item_id", itemRow.id);

    const sanitized = (saved || []).map((a: any) => ({
      id: a.plaid_account_id,
      institutionId: institutionId || itemId,
      institutionName,
      maskedAccountName: a.name,
      accountType: a.type,
      accessToken: `plaid-item-${itemRow.id}`,
      status: "active",
      linkedAt: new Date().toISOString(),
      balance: a.balance,
    }));

    return new Response(JSON.stringify({ accounts: sanitized }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("exchange-plaid-token error:", err);
    return jsonError(500, "Internal server error");
  }
});
