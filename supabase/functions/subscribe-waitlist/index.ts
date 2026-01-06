import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { WaitlistWelcomeEmail } from "./_templates/waitlist-welcome.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const audienceId = Deno.env.get("RESEND_AUDIENCE_ID");

// Initialize Supabase client with service role key for database writes
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WaitlistRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: WaitlistRequest = await req.json();

    console.log("Subscribing email to waitlist:", email);

    // Validate email format
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get IP address and user agent for tracking
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Insert into database (upsert to handle duplicates gracefully)
    const { data: signupData, error: dbError } = await supabase
      .from("waitlist_signups")
      .upsert(
        { 
          email, 
          source: "coming_soon",
          ip_address: ipAddress,
          user_agent: userAgent
        },
        { 
          onConflict: "email",
          ignoreDuplicates: true 
        }
      )
      .select()
      .single();

    if (dbError && dbError.code !== "23505") { // Ignore duplicate key errors
      console.error("Database error:", dbError);
      // Continue even if DB insert fails - still send email
    } else {
      console.log("Signup saved to database:", signupData);
    }

    // Generate unsubscribe URL with base64-encoded email
    const encodedEmail = btoa(email);
    const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe-waitlist?email=${encodedEmail}`;

    // Render React Email template
    const emailHtml = await renderAsync(
      React.createElement(WaitlistWelcomeEmail, { email, unsubscribeUrl })
    );

    // Send welcome email
    const emailResponse = await resend.emails.send({
      from: "Zero Hero <noreply@notifications.zeroherobudget.com>",
      replyTo: "support@zeroherobudget.com",
      to: [email],
      subject: "Welcome to Zero Hero - You're on the List!",
      html: emailHtml,
      text: `Welcome to Zero Hero!\n\nYou're officially on the waitlist! We're thrilled to have you join our community of people taking control of their finances.\n\nWe'll notify you as soon as we're ready to welcome you aboard.\n\n- The Zero Hero Team\n\nP.S. Reply to this email if you have any questions!\n\nTo unsubscribe: ${unsubscribeUrl}`,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    // Add contact to Resend Audience
    if (audienceId) {
      try {
        const audienceResponse = await resend.contacts.create({
          email: email,
          audienceId: audienceId,
        });
        console.log("Contact added to audience:", audienceResponse);
      } catch (audienceError: any) {
        // Log but don't fail the request if audience addition fails
        console.error("Failed to add contact to audience:", audienceError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Successfully subscribed to waitlist",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    // Log detailed error server-side only
    console.error("Error in subscribe-waitlist function:", error);
    // Return generic error to client - never expose internal details
    return new Response(
      JSON.stringify({ 
        error: "Unable to process your request. Please try again later."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
