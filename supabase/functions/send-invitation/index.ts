import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { HouseholdInviteEmail } from "./_templates/household-invite.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendInvitationRequest {
  inviteeEmail: string;
  inviteUrl: string;
  invitationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client with user's auth
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user's token and get claims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      console.error("Invalid token:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.user.id;

    const { inviteeEmail, inviteUrl, invitationId }: SendInvitationRequest = await req.json();

    // Validate required fields
    if (!inviteeEmail || !inviteUrl || !invitationId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the invitation exists and was created by this user (RLS will enforce this)
    // Also get household name and inviter info
    const { data: invitation, error: invitationError } = await supabase
      .from("household_invitations")
      .select(`
        id,
        email,
        role,
        household_id,
        invited_by,
        households!inner(name),
        profiles!household_invitations_invited_by_fkey(display_name, first_name, email)
      `)
      .eq("id", invitationId)
      .eq("invited_by", userId)
      .eq("status", "pending")
      .maybeSingle();

    if (invitationError) {
      console.error("Error fetching invitation:", invitationError);
      return new Response(
        JSON.stringify({ error: "Failed to verify invitation" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!invitation) {
      console.error("Invitation not found or user not authorized");
      return new Response(
        JSON.stringify({ error: "Invitation not found or you are not authorized to send this invitation" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify email matches the invitation
    if (invitation.email.toLowerCase() !== inviteeEmail.toLowerCase()) {
      console.error("Email mismatch");
      return new Response(
        JSON.stringify({ error: "Email does not match invitation" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Extract household and inviter info
    const householdName = (invitation.households as any)?.name || "My Household";
    const inviterProfile = invitation.profiles as any;
    const inviterName = inviterProfile?.display_name || inviterProfile?.first_name || inviterProfile?.email || "A Zero Hero user";

    // Render the React email template to HTML
    const html = await renderAsync(
      React.createElement(HouseholdInviteEmail, {
        inviterName,
        householdName,
        inviteeEmail,
        role: invitation.role || "member",
        inviteUrl,
      })
    );

    // Send the email via Resend
    const emailResponse = await resend.emails.send({
      from: "Zero Hero <noreply@notifications.zeroherobudget.com>",
      to: [inviteeEmail],
      subject: `You've been invited to join ${householdName} on Zero Hero`,
      html,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
