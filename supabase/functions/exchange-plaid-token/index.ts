import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCors } from "../_shared/cors.ts";

const PLAID_ENV = (Deno.env.get("PLAID_ENV") || "sandbox").toLowerCase();
const PLAID_BASE =
  PLAID_ENV === "production" ? "https://production.plaid.com"
  : PLAID_ENV === "development" ? "https://development.plaid.com"
  : "https://sandbox.plaid.com";

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req);

  function jsonError(status: number, error: string) {
    return new Response(JSON.stringify({ error }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
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

    const logDatabaseError = (operation: string, error: { message: string; code: string }) => {
      // Database messages can contain row details; redact any Plaid token first.
      console.error(operation, {
        message: error.message.replace(/access-[^\s,)'"\]}]+/gi, "[redacted]"),
        code: error.code,
      });
    };
    const removePlaidItem = async (token: string): Promise<boolean> => {
      try {
        const response = await fetch(`${PLAID_BASE}/item/remove`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: clientId, secret, access_token: token }),
        });
        if (response.ok) return true;
        const result = await response.json().catch(() => ({}));
        if (result?.error_code === "ITEM_NOT_FOUND") return true;
        console.error("Plaid item/remove failed", { status: response.status });
      } catch {
        console.error("Plaid item/remove request failed");
      }
      return false;
    };
    const deleteItemRow = async (id: string) => {
      const { error } = await supabaseAdmin.from("plaid_items").delete()
        .eq("id", id).eq("user_id", userId);
      if (error) logDatabaseError("plaid_items cleanup error", error);
    };

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
      console.error("Plaid exchange failed", { status: exchangeRes.status });
      return jsonError(502, "Token exchange failed");
    }
    const accessToken: string = exchangeData.access_token;
    const itemId: string = exchangeData.item_id;

    // Remove old, account-less connections left behind by failed saves.
    // Page candidates so cleanup is not limited to PostgREST's default row cap.
    try {
      const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const staleItems: { id: string; access_token: string }[] = [];
      for (let offset = 0; ; offset += 100) {
        const { data: candidates, error } = await supabaseAdmin.from("plaid_items")
          .select("id, access_token, accounts(id)")
          .eq("user_id", userId).lt("created_at", cutoff)
          .order("id").range(offset, offset + 99);
        if (error) {
          logDatabaseError("plaid_items cleanup lookup error", error);
          break;
        }
        for (const item of candidates || []) {
          if (item.accounts.length === 0) staleItems.push(item);
        }
        if (!candidates || candidates.length < 100) break;
      }
      for (const item of staleItems) {
        if (await removePlaidItem(item.access_token)) await deleteItemRow(item.id);
      }
    } catch {
      console.error("Stale Plaid connection cleanup failed");
    }

    // Get accounts (and item.institution_id)
    const accountsRes = await fetch(`${PLAID_BASE}/accounts/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, secret, access_token: accessToken }),
    });
    const accountsData = await accountsRes.json();
    if (!accountsRes.ok) {
      console.error("Plaid accounts failed", { status: accountsRes.status });
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
      if (itemErr) logDatabaseError("plaid_items upsert error", itemErr);
      return jsonError(500, "Failed to save bank connection");
    }

    // Map Plaid type -> our account type
    const plaidAccounts = accountsData.accounts || [];
    const accountRows = plaidAccounts.flatMap((acc: any) => {
      const type = String(acc.type || "").toLowerCase();
      const subtype = String(acc.subtype || "").toLowerCase();
      if (type === "loan" || ["mortgage", "student", "auto"].includes(subtype)) return [];
      let accountType = "checking";
      if (type === "depository") {
        accountType = ["savings", "money market", "cd", "hsa"].includes(subtype) ? "savings" : "checking";
      } else if (type === "credit") {
        accountType = "credit";
      } else if (type === "investment" || type === "brokerage") {
        accountType = "investment";
      } else if (["savings", "money market", "cd", "hsa"].includes(subtype) || type === "savings") {
        accountType = "savings";
      } else if (subtype === "credit card") {
        accountType = "credit";
      } else if (subtype === "brokerage" || subtype === "investment") {
        accountType = "investment";
      } else if (type === "cash") {
        accountType = "cash";
      }
      return [{
        user_id: userId,
        household_id: householdId,
        name: `${acc.name || institutionName} ••${acc.mask || "0000"}`,
        type: accountType,
        balance: acc.balances?.current ?? 0,
        is_active: true,
        plaid_account_id: acc.account_id,
        plaid_item_id: itemRow.id,
      }];
    });

    // Upsert accounts on plaid_account_id
    if (accountRows.length > 0) {
      const { error: accErr } = await supabaseAdmin
        .from("accounts")
        .upsert(accountRows, { onConflict: "plaid_account_id" });
      if (accErr) {
        logDatabaseError("accounts upsert error", accErr);
        await removePlaidItem(accessToken);
        await deleteItemRow(itemRow.id);
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
  } catch {
    console.error("exchange-plaid-token request failed");
    return jsonError(500, "Internal server error");
  }
});
