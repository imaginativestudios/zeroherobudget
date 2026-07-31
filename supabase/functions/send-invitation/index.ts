import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { HouseholdInviteEmail } from "./_templates/household-invite.tsx";
import { logEmail, updateEmailStatus } from "../_shared/emailLogger.ts";
import { buildCors } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface SendInvitationRequest {
  inviteeEmail: string;
  inviteUrl: string;
  invitationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = buildCors(req);
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

    // Initialize admin client for email logging
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
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

    // Log email attempt as pending
    const logId = await logEmail(supabaseAdmin, {
      userId: userId,
      recipientEmail: inviteeEmail,
      emailType: 'household_invite',
      status: 'pending',
      metadata: { 
        household_id: invitation.household_id, 
        invitation_id: invitationId,
        household_name: householdName,
        role: invitation.role,
      },
    });

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
      replyTo: "support@zeroherobudget.com",
      to: [inviteeEmail],
      subject: `You've been invited to join ${householdName} on Zero Hero`,
      html,
      text: `You've been invited to join ${householdName} on Zero Hero!\n\n${inviterName} has invited you to join their household "${householdName}" as a ${invitation.role || "member"}.\n\nAccept your invitation here: ${inviteUrl}\n\nThis invitation expires in 7 days.\n\n- The Zero Hero Team`,
    });

    // Update email log based on response
    if (logId) {
      if (emailResponse.error) {
        await updateEmailStatus(supabaseAdmin, logId, 'failed', {
          errorMessage: emailResponse.error.message,
        });
        console.error("Invitation email failed:", emailResponse.error);
        return new Response(
          JSON.stringify({ error: "Failed to send invitation email. Please try again." }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } else {
        await updateEmailStatus(supabaseAdmin, logId, 'sent', {
          resendId: emailResponse.data?.id,
        });
      }
    }

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
