import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { Resend } from "npm:resend@2.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { DeletionCodeEmail } from "./_templates/deletion-code.tsx";
import { logEmail, updateEmailStatus } from "../_shared/emailLogger.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeletionCodeRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the user is authenticated
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

    const { email }: DeletionCodeRequest = await req.json();

    // Verify the email matches the authenticated user
    if (email !== user.email) {
      return new Response(
        JSON.stringify({ error: "Email mismatch" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check rate limiting (max 3 attempts per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: rateLimitData } = await supabaseAdmin
      .from("user_settings")
      .select("setting_value")
      .eq("user_id", user.id)
      .eq("setting_key", "deletion_code_attempts")
      .single();

    const attempts = rateLimitData?.setting_value as { count: number; reset_at: string } | null;
    
    if (attempts) {
      const resetTime = new Date(attempts.reset_at);
      if (resetTime > new Date() && attempts.count >= 3) {
        const minutesRemaining = Math.ceil((resetTime.getTime() - Date.now()) / 60000);
        return new Response(
          JSON.stringify({ error: `Too many attempts. Please try again in ${minutesRemaining} minutes.` }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Generate a 6-digit code using cryptographically secure random
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    const code = (100000 + (randomArray[0] % 900000)).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const resetAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Update rate limit tracking
    const newCount = (attempts && new Date(attempts.reset_at) > new Date()) ? attempts.count + 1 : 1;
    
    await supabaseAdmin
      .from("user_settings")
      .delete()
      .eq("user_id", user.id)
      .eq("setting_key", "deletion_code_attempts");
    
    await supabaseAdmin
      .from("user_settings")
      .insert({
        user_id: user.id,
        setting_key: "deletion_code_attempts",
        setting_value: { count: newCount, reset_at: resetAt },
      });
    
    // Delete any existing deletion code first
    await supabaseAdmin
      .from("user_settings")
      .delete()
      .eq("user_id", user.id)
      .eq("setting_key", "deletion_code");
    
    // Insert new deletion code
    const { error: settingsError } = await supabaseAdmin
      .from("user_settings")
      .insert({
        user_id: user.id,
        setting_key: "deletion_code",
        setting_value: { code, expires_at: expiresAt },
      });

    if (settingsError) {
      console.error("Error storing deletion code:", settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to generate code" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log email attempt as pending
    const logId = await logEmail(supabaseAdmin, {
      userId: user.id,
      recipientEmail: email,
      emailType: 'deletion_code',
      status: 'pending',
      metadata: { expires_at: expiresAt },
    });

    // Render React Email template
    const emailHtml = await renderAsync(
      React.createElement(DeletionCodeEmail, { code })
    );

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "Zero Hero <noreply@notifications.zeroherobudget.com>",
      replyTo: "support@zeroherobudget.com",
      to: [email],
      subject: "Zero Hero - Account Deletion Code",
      html: emailHtml,
      text: `Account Deletion Request\n\nYour confirmation code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nWarning: Account deletion is permanent and cannot be undone.\n\n- The Zero Hero Team`,
    });

    // Update email log based on response
    if (logId) {
      if (emailResponse.error) {
        await updateEmailStatus(supabaseAdmin, logId, 'failed', {
          errorMessage: emailResponse.error.message,
        });
        console.error("Deletion code email failed:", emailResponse.error);
        return new Response(
          JSON.stringify({ error: "Failed to send confirmation code. Please try again." }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } else {
        await updateEmailStatus(supabaseAdmin, logId, 'sent', {
          resendId: emailResponse.data?.id,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-deletion-code function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send confirmation code" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
