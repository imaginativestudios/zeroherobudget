import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const raw = typeof body?.code === "string" ? body.code : "";
    const code = raw.trim().toUpperCase();

    if (!code || code.length < 3 || code.length > 64 || !/^[A-Z0-9_-]+$/.test(code)) {
      return new Response(JSON.stringify({ valid: false, error: "Invalid code format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: invite, error } = await admin
      .from("beta_invite_codes")
      .select("id, max_uses, used_count, expires_at, active")
      .eq("code", code)
      .maybeSingle();

    if (error || !invite || !invite.active) {
      return new Response(JSON.stringify({ valid: false, error: "Invalid or expired code" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return new Response(JSON.stringify({ valid: false, error: "This code has expired" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (invite.max_uses != null && invite.used_count >= invite.max_uses) {
      return new Response(JSON.stringify({ valid: false, error: "This code has reached its limit" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to authenticate the caller and flip their profile flag
    const authHeader = req.headers.get("Authorization");
    let userGranted = false;
    if (authHeader) {
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: userData } = await userClient.auth.getUser();
      const userId = userData?.user?.id;
      if (userId) {
        const { error: updateErr } = await admin
          .from("profiles")
          .update({ beta_access: true })
          .eq("id", userId);
        if (!updateErr) userGranted = true;
      }
    }

    // Increment usage counter
    await admin
      .from("beta_invite_codes")
      .update({ used_count: invite.used_count + 1 })
      .eq("id", invite.id);

    return new Response(
      JSON.stringify({ valid: true, userGranted }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (_err) {
    return new Response(JSON.stringify({ valid: false, error: "Something went wrong" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
