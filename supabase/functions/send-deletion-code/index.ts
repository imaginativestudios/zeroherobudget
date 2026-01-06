import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { Resend } from "npm:resend@2.0.0";

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

    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
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

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "Zero Hero <noreply@notifications.zeroherobudget.com>",
      replyTo: "support@zeroherobudget.com",
      to: [email],
      subject: "Account Deletion Confirmation Code",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #dc2626; margin-bottom: 24px;">Account Deletion Request</h1>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            You've requested to delete your Zero Hero account. To confirm this action, please enter the following code:
          </p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
            <code style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</code>
          </div>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            This code will expire in 10 minutes. If you didn't request this, please ignore this email and your account will remain safe.
          </p>
          <p style="color: #dc2626; font-size: 14px; font-weight: 500; margin-top: 24px;">
            Warning: Account deletion is permanent and cannot be undone.
          </p>
        </div>
      `,
      text: `Account Deletion Request\n\nYour confirmation code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nWarning: Account deletion is permanent and cannot be undone.\n\n- The Zero Hero Team`,
    });

    console.log("Deletion code email sent:", emailResponse);

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
