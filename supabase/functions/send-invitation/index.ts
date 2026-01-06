import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
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
  inviterName: string;
  householdName: string;
  inviteeEmail: string;
  role: string;
  inviteUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      inviterName,
      householdName,
      inviteeEmail,
      role,
      inviteUrl,
    }: SendInvitationRequest = await req.json();

    // Validate required fields
    if (!inviteeEmail || !inviteUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Render the React email template to HTML
    const html = await renderAsync(
      React.createElement(HouseholdInviteEmail, {
        inviterName: inviterName || "A Zero Hero user",
        householdName: householdName || "their household",
        inviteeEmail,
        role: role || "member",
        inviteUrl,
      })
    );

    // Send the email via Resend
    const emailResponse = await resend.emails.send({
      from: "Zero Hero <noreply@notifications.zeroherobudget.com>",
      to: [inviteeEmail],
      subject: `You've been invited to join ${householdName || "a household"} on Zero Hero`,
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
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
