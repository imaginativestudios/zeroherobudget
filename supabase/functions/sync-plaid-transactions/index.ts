import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLAID_BASE = "https://sandbox.plaid.com";

function jsonError(status: number, error: string) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Map Plaid PFC primary -> internal budget category buckets used in the app
function mapCategory(plaidCategory: string | null | undefined, amount: number): string {
  if (!plaidCategory) return amount < 0 ? "Income" : "Other";
  const c = plaidCategory.toUpperCase();
  if (c.includes("INCOME") || c.includes("TRANSFER_IN")) return "Income";
  if (c.includes("FOOD") || c.includes("RESTAURANT")) return "Food & Dining";
  if (c.includes("GROCER")) return "Groceries";
  if (c.includes("TRANSPORT") || c.includes("TRAVEL")) return "Transportation";
  if (c.includes("RENT") || c.includes("MORTGAGE") || c.includes("UTILIT")) return "Housing";
  if (c.includes("ENTERTAIN") || c.includes("RECREATION")) return "Entertainment";
  if (c.includes("MEDICAL") || c.includes("HEALTH")) return "Healthcare";
  if (c.includes("LOAN") || c.includes("DEBT")) return "Debt Payment";
  if (c.includes("SHOP") || c.includes("MERCHANDISE")) return "Shopping";
  return "Other";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const cronHeader = req.headers.get("x-cron-secret");
    const isCron = !!cronSecret && cronHeader === cronSecret;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    let userIdFilter: string | null = null;

    if (!isCron) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) return jsonError(401, "Unauthorized");

      const supabaseAuth = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
      if (userErr || !userData?.user) return jsonError(401, "Unauthorized");
      userIdFilter = userData.user.id;
    }

    const clientId = Deno.env.get("PLAID_CLIENT_ID");
    const secret = Deno.env.get("PLAID_SECRET");
    if (!clientId || !secret) return jsonError(500, "Plaid not configured");

    // Fetch plaid_items: caller's items for user requests, all active items for cron
    let itemsQuery = supabaseAdmin
      .from("plaid_items")
      .select("id, item_id, access_token, cursor, household_id, user_id")
      .eq("status", "active");
    if (userIdFilter) itemsQuery = itemsQuery.eq("user_id", userIdFilter);
    const { data: items, error: itemsErr } = await itemsQuery;
    if (itemsErr) {
      console.error("plaid_items fetch error:", itemsErr);
      return jsonError(500, "Failed to load bank connections");
    }
    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ synced: 0, items: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalAdded = 0;
    let totalModified = 0;
    let totalRemoved = 0;

    for (const item of items) {
      // Look up account_id mapping for this item
      const { data: accs } = await supabaseAdmin
        .from("accounts")
        .select("id, plaid_account_id")
        .eq("plaid_item_id", item.id);
      const accMap = new Map<string, string>(
        (accs || []).map((a: any) => [a.plaid_account_id, a.id])
      );

      // Pull pages from /transactions/sync
      let cursor: string | null = item.cursor || null;
      let hasMore = true;
      const added: any[] = [];
      const modified: any[] = [];
      const removed: any[] = [];

      while (hasMore) {
        const syncRes = await fetch(`${PLAID_BASE}/transactions/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: clientId,
            secret,
            access_token: item.access_token,
            cursor: cursor ?? undefined,
            count: 500,
          }),
        });
        const syncData = await syncRes.json();
        if (!syncRes.ok) {
          console.error("Plaid sync error:", syncData);
          break;
        }
        added.push(...(syncData.added || []));
        modified.push(...(syncData.modified || []));
        removed.push(...(syncData.removed || []));
        cursor = syncData.next_cursor;
        hasMore = !!syncData.has_more;
      }

      // Upsert added + modified
      const upserts = [...added, ...modified].map((tx: any) => {
        const accountId = accMap.get(tx.account_id);
        if (!accountId) return null;
        // Plaid: positive amount = money out, negative = money in
        const amount = Math.abs(tx.amount);
        const flow = tx.amount < 0 ? "income" : "expense";
        const plaidCat = tx.personal_finance_category?.primary || tx.category?.[0];
        return {
          user_id: userId,
          household_id: item.household_id,
          account_id: accountId,
          plaid_transaction_id: tx.transaction_id,
          date: tx.date,
          amount,
          description: tx.merchant_name || tx.name || "Unknown",
          category: mapCategory(plaidCat, tx.amount),
          flow,
        };
      }).filter(Boolean);

      if (upserts.length > 0) {
        const { error: txErr } = await supabaseAdmin
          .from("transactions")
          .upsert(upserts, { onConflict: "plaid_transaction_id" });
        if (txErr) console.error("transactions upsert error:", txErr);
      }

      // Delete removed
      if (removed.length > 0) {
        const ids = removed.map((r: any) => r.transaction_id);
        const { error: delErr } = await supabaseAdmin
          .from("transactions")
          .delete()
          .in("plaid_transaction_id", ids);
        if (delErr) console.error("transactions delete error:", delErr);
      }

      // Refresh balances
      try {
        const balRes = await fetch(`${PLAID_BASE}/accounts/balance/get`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: clientId, secret, access_token: item.access_token }),
        });
        const balData = await balRes.json();
        if (balRes.ok) {
          for (const acc of balData.accounts || []) {
            const localId = accMap.get(acc.account_id);
            if (localId && acc.balances?.current != null) {
              await supabaseAdmin
                .from("accounts")
                .update({ balance: acc.balances.current })
                .eq("id", localId);
            }
          }
        }
      } catch (e) {
        console.error("balance refresh error:", e);
      }

      // Save new cursor + last_synced_at
      await supabaseAdmin
        .from("plaid_items")
        .update({ cursor, last_synced_at: new Date().toISOString() })
        .eq("id", item.id);

      totalAdded += added.length;
      totalModified += modified.length;
      totalRemoved += removed.length;
    }

    return new Response(
      JSON.stringify({
        items: items.length,
        added: totalAdded,
        modified: totalModified,
        removed: totalRemoved,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("sync-plaid-transactions error:", err);
    return jsonError(500, "Internal server error");
  }
});
