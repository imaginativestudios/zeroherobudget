import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const audienceId = Deno.env.get("RESEND_AUDIENCE_ID");

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// HTML escape function to prevent XSS attacks
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const encodedEmail = url.searchParams.get("email");

    if (!encodedEmail) {
      return new Response(renderErrorPage("Missing email parameter"), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Decode the base64 email
    let email: string;
    try {
      email = atob(encodedEmail);
    } catch {
      return new Response(renderErrorPage("Invalid email format"), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Update database to mark as unsubscribed
    const { error: dbError } = await supabase
      .from("waitlist_signups")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("email", email);

    if (dbError) {
      console.error("Database error:", dbError);
    }

    // Remove from Resend Audience
    if (audienceId) {
      try {
        await resend.contacts.remove({
          email: email,
          audienceId: audienceId,
        });
      } catch (audienceError: any) {
        console.error("Failed to remove from audience:", audienceError);
      }
    }

    return new Response(renderSuccessPage(email), {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error: any) {
    console.error("Error in unsubscribe-waitlist function:", error);
    return new Response(renderErrorPage("An error occurred. Please try again."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
};

function renderSuccessPage(email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed - Zero Hero</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 48px;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .icon {
      font-size: 48px;
      margin-bottom: 24px;
    }
    h1 {
      color: #1f2937;
      font-size: 24px;
      margin-bottom: 16px;
    }
    p {
      color: #6b7280;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 12px;
    }
    .email {
      color: #8B5CF6;
      font-weight: 500;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">👋</div>
    <h1>You've been unsubscribed</h1>
    <p>We've removed <span class="email">${escapeHtml(email)}</span> from our waitlist.</p>
    <p>We're sorry to see you go! If you change your mind, you can always sign up again at our website.</p>
    <div class="footer">
      © 2026 Zero Hero. From balances due to a more balanced you.
    </div>
  </div>
</body>
</html>
  `;
}

function renderErrorPage(message: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - Zero Hero</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 48px;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .icon {
      font-size: 48px;
      margin-bottom: 24px;
    }
    h1 {
      color: #1f2937;
      font-size: 24px;
      margin-bottom: 16px;
    }
    p {
      color: #6b7280;
      font-size: 16px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚠️</div>
    <h1>Something went wrong</h1>
    <p>${escapeHtml(message)}</p>
  </div>
</body>
</html>
  `;
}

serve(handler);
