import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCors } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PLAID_CLIENT_ID = Deno.env.get("PLAID_CLIENT_ID");
const PLAID_SECRET = Deno.env.get("PLAID_SECRET");
const PLAID_ENV = Deno.env.get("PLAID_ENV") ?? "sandbox";
const PLAID_BASE = PLAID_ENV === "production"
  ? "https://production.plaid.com"
  : PLAID_ENV === "development"
    ? "https://development.plaid.com"
    : "https://sandbox.plaid.com";

serve(async (req) => {
  const corsHeaders = buildCors(req);

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Verify JWT and get user id
    const authed = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await authed.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = claimsData.claims.sub as string;

    // Confirm deletion was verified via user_settings deletion_verified flag
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: verifySetting } = await admin
      .from("user_settings")
      .select("setting_value, updated_at")
      .eq("user_id", userId)
      .eq("setting_key", "deletion_verified")
      .maybeSingle();

    const verifiedAt = verifySetting?.updated_at
      ? new Date(verifySetting.updated_at as string).getTime()
      : 0;
    const withinWindow = Date.now() - verifiedAt < 10 * 60 * 1000;
    if (!verifySetting || verifySetting.setting_value !== "true" || !withinWindow) {
      return json({ error: "Deletion not verified. Please request a fresh confirmation code." }, 403);
    }

    // Revoke Plaid items (best effort)
    if (PLAID_CLIENT_ID && PLAID_SECRET) {
      const { data: plaidItems } = await admin
        .from("plaid_items")
        .select("access_token")
        .eq("user_id", userId);
      for (const item of plaidItems ?? []) {
        try {
          await fetch(`${PLAID_BASE}/item/remove`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: PLAID_CLIENT_ID,
              secret: PLAID_SECRET,
              access_token: (item as { access_token: string }).access_token,
            }),
          });
        } catch (e) {
          console.error("Plaid revoke failed", e);
        }
      }
    }

    // Delete rows from every user-owned table. Order minimizes FK conflicts.
    const tables = [
      "transaction_categorization_history",
      "transactions",
      "subscription_matches",
      "subscriptions",
      "debts",
      "expenses",
      "accounts",
      "plaid_items",
      "user_settings",
      "user_roles",
      "household_invitations",
      "household_members",
      "email_logs",
    ];
    for (const t of tables) {
      const { error } = await admin.from(t).delete().eq("user_id", userId);
      if (error && !/column .*user_id.* does not exist/i.test(error.message)) {
        console.error(`delete ${t} failed`, error.message);
      }
    }
    // household_invitations may key on invited_by instead.
    // Do NOT chain .catch() here -- PostgrestFilterBuilder is a thenable, not a
    // Promise. It implements then() only, so .catch is undefined and calling it
    // throws a TypeError before the request is ever sent. Check the returned
    // error the same way the loop above does.
    const { error: invErr } = await admin
      .from("household_invitations")
      .delete()
      .eq("invited_by", userId);
    if (invErr) {
      console.error("delete household_invitations by invited_by failed", invErr.message);
    }
    // Delete profile (also cascades to any FK-linked rows)
    await admin.from("profiles").delete().eq("id", userId);

    // Finally delete the auth user
    const { error: authDelErr } = await admin.auth.admin.deleteUser(userId);
    if (authDelErr) {
      console.error("auth user delete failed", authDelErr);
      return json({ error: "Failed to delete authentication account." }, 500);
    }

    return json({ success: true });
  } catch (e) {
    console.error("delete-account error", e);
    return json({ error: "Unable to complete deletion." }, 500);
  }
});

