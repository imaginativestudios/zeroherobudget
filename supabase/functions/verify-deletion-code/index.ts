import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { buildCors } from "../_shared/cors.ts";

interface VerifyCodeRequest {
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = buildCors(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { code }: VerifyCodeRequest = await req.json();

    if (!code || code.length !== 6) {
      return new Response(
        JSON.stringify({ error: "Invalid code format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get the stored code using admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const MAX_ATTEMPTS = 5;

    // Check existing failed attempts
    const { data: attemptsRow } = await supabaseAdmin
      .from("user_settings")
      .select("setting_value")
      .eq("user_id", user.id)
      .eq("setting_key", "deletion_code_attempts")
      .maybeSingle();

    const currentAttempts = (attemptsRow?.setting_value as { count?: number } | null)?.count ?? 0;

    if (currentAttempts >= MAX_ATTEMPTS) {
      // Burn the code so user must request a new one
      await supabaseAdmin
        .from("user_settings")
        .delete()
        .eq("user_id", user.id)
        .in("setting_key", ["deletion_code", "deletion_code_attempts"]);

      return new Response(
        JSON.stringify({ error: "Too many failed attempts. Please request a new code." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: setting, error: fetchError } = await supabaseAdmin
      .from("user_settings")
      .select("setting_value")
      .eq("user_id", user.id)
      .eq("setting_key", "deletion_code")
      .single();

    if (fetchError || !setting) {
      return new Response(
        JSON.stringify({ error: "No deletion code found. Please request a new one." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const storedData = setting.setting_value as { code: string; expires_at: string };

    // Check expiration
    if (new Date(storedData.expires_at) < new Date()) {
      await supabaseAdmin
        .from("user_settings")
        .delete()
        .eq("user_id", user.id)
        .in("setting_key", ["deletion_code", "deletion_code_attempts"]);

      return new Response(
        JSON.stringify({ error: "Code has expired. Please request a new one." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the code
    if (storedData.code !== code) {
      const newCount = currentAttempts + 1;
      await supabaseAdmin
        .from("user_settings")
        .upsert({
          user_id: user.id,
          setting_key: "deletion_code_attempts",
          setting_value: { count: newCount },
        }, { onConflict: "user_id,setting_key" });

      if (newCount >= MAX_ATTEMPTS) {
        await supabaseAdmin
          .from("user_settings")
          .delete()
          .eq("user_id", user.id)
          .in("setting_key", ["deletion_code", "deletion_code_attempts"]);
      }

      return new Response(
        JSON.stringify({ error: "Invalid code" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Delete the code and reset attempts after successful verification,
    // then set a short-lived deletion_verified flag the delete-account function checks.
    await supabaseAdmin
      .from("user_settings")
      .delete()
      .eq("user_id", user.id)
      .in("setting_key", ["deletion_code", "deletion_code_attempts"]);

    await supabaseAdmin
      .from("user_settings")
      .upsert({
        user_id: user.id,
        setting_key: "deletion_verified",
        setting_value: "true",
      }, { onConflict: "user_id,setting_key" });

    return new Response(
      JSON.stringify({ verified: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in verify-deletion-code function:", error);
    return new Response(
      JSON.stringify({ error: "Verification failed" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
