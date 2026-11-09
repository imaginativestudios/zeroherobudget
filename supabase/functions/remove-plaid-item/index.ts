import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCors } from "../_shared/cors.ts";

const PLAID_ENV = (Deno.env.get("PLAID_ENV") || "sandbox").toLowerCase();
const PLAID_BASE =
  PLAID_ENV === "production" ? "https://production.plaid.com"
  : PLAID_ENV === "development" ? "https://development.plaid.com"
  : "https://sandbox.plaid.com";

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req);
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json(401, { error: "Unauthorized" });

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
    if (userErr || !userData?.user) return json(401, { error: "Unauthorized" });
    const userId = userData.user.id;

    const body = await req.json().catch(() => null);
    const itemId = body?.item_id;
    if (typeof itemId !== "string" || !itemId || itemId.length > 100) {
      return json(400, { error: "item_id is required" });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const { data: item, error: itemErr } = await supabaseAdmin
      .from("plaid_items")
      .select("id, user_id, access_token")
      .eq("id", itemId)
      .maybeSingle();
    if (itemErr || !item) return json(404, { error: "Not found" });
    if (item.user_id !== userId) return json(403, { error: "Forbidden" });

    const clientId = Deno.env.get("PLAID_CLIENT_ID");
    const secret = Deno.env.get("PLAID_SECRET");
    if (!clientId || !secret) return json(500, { error: "Plaid not configured" });

    const plaidRes = await fetch(`${PLAID_BASE}/item/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, secret, access_token: item.access_token }),
    });
    if (!plaidRes.ok) {
      const plaidData = await plaidRes.json().catch(() => ({}));
      // An Item Plaid no longer knows about can still be removed locally.
      if (plaidData?.error_code !== "ITEM_NOT_FOUND") {
        console.error("Plaid item/remove error:", plaidData?.error_code);
        return json(502, { error: "Failed to disconnect bank" });
      }
    }

    const { error: delErr } = await supabaseAdmin.from("plaid_items").delete().eq("id", item.id);
    if (delErr) {
      console.error("plaid_items delete error:", delErr);
      return json(500, { error: "Failed to remove bank connection" });
    }

    return json(200, { removed: true });
  } catch (err) {
    console.error("remove-plaid-item error:", err);
    return json(500, { error: "Internal server error" });
  }
});
