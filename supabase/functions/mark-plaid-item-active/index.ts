import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCors } from "../_shared/cors.ts";

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
      .select("id, user_id")
      .eq("id", itemId)
      .maybeSingle();
    if (itemErr || !item) return json(404, { error: "Not found" });
    if (item.user_id !== userData.user.id) return json(403, { error: "Forbidden" });

    const { error: updErr } = await supabaseAdmin
      .from("plaid_items")
      .update({ status: "active" })
      .eq("id", item.id);
    if (updErr) {
      console.error("plaid_items update error:", updErr);
      return json(500, { error: "Failed to update bank connection" });
    }

    return json(200, { status: "active" });
  } catch (err) {
    console.error("mark-plaid-item-active error:", err);
    return json(500, { error: "Internal server error" });
  }
});
