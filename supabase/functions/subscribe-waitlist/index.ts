import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Send welcome email
    const emailResponse = await resend.emails.send({
      from: "Zero Hero <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to the Zero Hero Waitlist! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7E22CE; text-align: center;">Welcome to Zero Hero!</h1>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Thank you for your interest in Zero Hero! We're excited to have you on our waitlist.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Zero Hero is being built to help you <strong>transform debt into victory</strong> through:
          </p>
          
          <ul style="font-size: 16px; line-height: 1.8;">
            <li>Smart debt payoff strategies (Snowball & Avalanche methods)</li>
            <li>Budget tracking and spending visualization</li>
            <li>Subscription management to reduce recurring expenses</li>
            <li>Household collaboration for shared financial goals</li>
            <li>Progress tracking with achievements and insights</li>
          </ul>
          
          <p style="font-size: 16px; line-height: 1.6;">
            We'll notify you as soon as Zero Hero launches. Get ready to take control of your financial future!
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Best regards,<br>
            <strong>The Zero Hero Team</strong>
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            From balances due to a more balanced you.
          </p>
        </div>
      `,
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
    console.error("Error in subscribe-waitlist function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to subscribe to waitlist",
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
