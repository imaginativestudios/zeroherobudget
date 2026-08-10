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

      // Delete-then-insert, not upsert. The only unique constraint on
      // user_settings is (user_id, household_id, setting_key); household_id is
      // NULL for these rows, so `onConflict: "user_id,setting_key"` matched no
      // index and raised 42P10 on every call. The result was discarded, so the
      // counter never incremented, currentAttempts read 0 forever, and the
      // MAX_ATTEMPTS cap on a 6-digit code never engaged. Confirmed against
      // production 2026-08-10.
      //
      // Naming all three columns does not fix it: household_id is NULL and
      // Postgres treats NULLs as distinct, so rows would accumulate until the
      // .maybeSingle()/.single() reads above start erroring. This is the
      // pattern send-deletion-code already uses on the same keys.
      const { error: attemptsDeleteError } = await supabaseAdmin
        .from("user_settings")
        .delete()
        .eq("user_id", user.id)
        .eq("setting_key", "deletion_code_attempts");

      const { error: attemptsInsertError } = await supabaseAdmin
        .from("user_settings")
        .insert({
          user_id: user.id,
          setting_key: "deletion_code_attempts",
          setting_value: { count: newCount },
        });

      // Fail closed. This counter is the only brute-force control on this
      // endpoint; if it cannot be recorded, the attempt must not be treated as
      // a normal wrong guess, or the code becomes freely guessable.
      if (attemptsDeleteError || attemptsInsertError) {
        console.error(
          "verify-deletion-code: could not record failed attempt; refusing to continue",
          attemptsDeleteError ?? attemptsInsertError
        );
        return new Response(
          JSON.stringify({ error: "Verification failed" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

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

    // The security-critical half of the same defect. This upsert raised 42P10
    // exactly like the one above, its error was discarded, and the function
    // still returned { verified: true } -- while delete-account:58 kept
    // returning 403 because the flag it reads was never written. Account
    // deletion had not completed for any user since 2026-07-09, and
    // DeleteAccountDialog.tsx clears local data *before* calling
    // delete-account, so every attempt destroyed the user's local financial
    // data and left the account standing.
    //
    // Deleting first also gives the inserted row a fresh updated_at, which is
    // what delete-account's 10-minute freshness window is measured against.
    const { error: flagDeleteError } = await supabaseAdmin
      .from("user_settings")
      .delete()
      .eq("user_id", user.id)
      .eq("setting_key", "deletion_verified");

    const { error: flagInsertError } = await supabaseAdmin
      .from("user_settings")
      .insert({
        user_id: user.id,
        setting_key: "deletion_verified",
        setting_value: "true",
      });

    // Never report success for a flag that was not written. Returning
    // { verified: true } here while the write failed is precisely what hid this
    // defect for a month.
    if (flagDeleteError || flagInsertError) {
      console.error(
        "verify-deletion-code: could not set deletion_verified",
        flagDeleteError ?? flagInsertError
      );
      return new Response(
        JSON.stringify({ error: "Could not confirm deletion. Please request a new code and try again." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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
