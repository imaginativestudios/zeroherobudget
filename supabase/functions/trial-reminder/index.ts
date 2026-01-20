import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@4.0.0";
import * as React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { TrialEndingReminderEmail } from "./_templates/trial-ending-reminder.tsx";
import { logEmail, updateEmailStatus } from "../_shared/emailLogger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getTierName = (amountCents: number): string => {
  if (amountCents <= 500) return "Starter";
  if (amountCents <= 900) return "Supporter";
  if (amountCents <= 1200) return "Champion";
  return "Hero";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeKey || !supabaseUrl || !serviceRoleKey) {
    console.error("Missing environment variables");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    // Calculate the date 2 days from now (target trial end date)
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const twoDaysFromNowStart = Math.floor(twoDaysFromNow.setHours(0, 0, 0, 0) / 1000);
    const twoDaysFromNowEnd = Math.floor(twoDaysFromNow.setHours(23, 59, 59, 999) / 1000);

    // Fetch all trialing subscriptions
    const subscriptions = await stripe.subscriptions.list({
      status: "trialing",
      limit: 100,
    });

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const subscription of subscriptions.data) {
      const trialEnd = subscription.trial_end;
      if (!trialEnd) continue;

      // Check if trial ends within the 2-day window
      if (trialEnd >= twoDaysFromNowStart && trialEnd <= twoDaysFromNowEnd) {
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        
        if (customer.deleted || !customer.email) {
          continue;
        }

        const amountCents = subscription.items.data[0]?.price?.unit_amount || 300;
        const trialEndDate = new Date(trialEnd * 1000).toISOString();
        const daysRemaining = Math.ceil((trialEnd * 1000 - Date.now()) / (24 * 60 * 60 * 1000));

        if (!resendKey) {
          continue;
        }

        try {
          const resend = new Resend(resendKey);
          const dashboardUrl = "https://zeroherobudget.lovable.app/dashboard";
          const portalUrl = "https://zeroherobudget.lovable.app/account-settings";

          // Log email attempt
          const logId = await logEmail(supabase, {
            recipientEmail: customer.email,
            emailType: 'trial_ending_reminder',
            status: 'pending',
            metadata: { daysRemaining, tier: getTierName(amountCents) },
          });

          // Render email
          const html = await renderAsync(
            React.createElement(TrialEndingReminderEmail, {
              email: customer.email,
              daysRemaining,
              trialEndDate,
              tierName: getTierName(amountCents),
              amount: amountCents / 100,
              dashboardUrl,
              portalUrl,
            })
          );

          // Send email
          const emailResponse = await resend.emails.send({
            from: "Zero Hero <noreply@notifications.zeroherobudget.com>",
            to: [customer.email],
            subject: `⏳ Your Zero Hero trial ends in ${daysRemaining} days`,
            html,
          });

          if (logId) {
            if (emailResponse.error) {
              console.error("Failed to send reminder:", emailResponse.error.message);
              await updateEmailStatus(supabase, logId, 'failed', { errorMessage: emailResponse.error.message });
              emailsFailed++;
            } else {
              await updateEmailStatus(supabase, logId, 'sent', { resendId: emailResponse.data?.id });
              emailsSent++;
            }
          }
        } catch (emailErr) {
          console.error("Exception sending reminder:", emailErr.message);
          emailsFailed++;
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailsSent, 
      emailsFailed,
      totalTrialing: subscriptions.data.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error in trial-reminder:", error);
    return new Response(JSON.stringify({ error: "Trial reminder processing failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
