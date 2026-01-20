import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@4.0.0";
import * as React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { SubscriptionWelcomeEmail } from "./_templates/subscription-welcome.tsx";
import { PaymentFailedEmail } from "./_templates/payment-failed.tsx";
import { SubscriptionCanceledEmail } from "./_templates/subscription-canceled.tsx";
import { logEmail, updateEmailStatus } from "../_shared/emailLogger.ts";

const getTierName = (amountCents: number): string => {
  if (amountCents <= 500) return "Starter";
  if (amountCents <= 900) return "Supporter";
  if (amountCents <= 1200) return "Champion";
  return "Hero";
};

const getTierEmoji = (amountCents: number): string => {
  if (amountCents <= 500) return "🌱";
  if (amountCents <= 900) return "💪";
  if (amountCents <= 1200) return "🏆";
  return "⚔️";
};

serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    console.error("Missing environment variables");
    return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
  });

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Signature verification failed:", err.message);
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const customerId = session.customer as string;
        
        if (!customerEmail) {
          break;
        }

        const subscriptionId = session.subscription as string;
        if (!subscriptionId) {
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const amountCents = subscription.items.data[0]?.price?.unit_amount || 300;
        const status = subscription.status;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: status === 'trialing' ? 'trialing' : 'active',
            stripe_customer_id: customerId,
            subscription_tier: getTierName(amountCents),
            subscription_amount: amountCents,
            subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('email', customerEmail.toLowerCase());

        if (updateError) {
          console.error("Failed to update profile:", updateError.message);
        }

        // Send welcome email
        const resendKey = Deno.env.get("RESEND_API_KEY");
        if (resendKey) {
          try {
            const resend = new Resend(resendKey);
            const isTrialing = status === 'trialing';
            const trialEndDate = new Date(subscription.current_period_end * 1000).toISOString();
            const dashboardUrl = "https://zeroherobudget.lovable.app/dashboard";
            const portalUrl = "https://zeroherobudget.lovable.app/account-settings";

            // Log email attempt
            const logId = await logEmail(supabase, {
              recipientEmail: customerEmail,
              emailType: 'subscription_welcome',
              status: 'pending',
              metadata: { tier: getTierName(amountCents), amount: amountCents / 100 },
            });

            // Render email template
            const html = await renderAsync(
              React.createElement(SubscriptionWelcomeEmail, {
                email: customerEmail,
                tierName: getTierName(amountCents),
                tierEmoji: getTierEmoji(amountCents),
                amount: amountCents / 100,
                isTrialing,
                trialEndDate,
                dashboardUrl,
                portalUrl,
              })
            );

            // Send email
            const emailResponse = await resend.emails.send({
              from: "Zero Hero <noreply@notifications.zeroherobudget.com>",
              to: [customerEmail],
              subject: "🏆 Your Quest Begins - Welcome to Zero Hero!",
              html,
            });

            // Update log with result
            if (logId) {
              if (emailResponse.error) {
                console.error("Failed to send welcome email:", emailResponse.error.message);
                await updateEmailStatus(supabase, logId, 'failed', { errorMessage: emailResponse.error.message });
              } else {
                await updateEmailStatus(supabase, logId, 'sent', { resendId: emailResponse.data?.id });
              }
            }
          } catch (emailErr) {
            console.error("Exception sending welcome email:", emailErr.message);
          }
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted || !customer.email) {
          break;
        }

        const status = subscription.status;
        const amountCents = subscription.items.data[0]?.price?.unit_amount || 0;

        let subscriptionStatus: string;
        if (status === 'active') {
          subscriptionStatus = 'active';
        } else if (status === 'trialing') {
          subscriptionStatus = 'trialing';
        } else if (status === 'past_due') {
          subscriptionStatus = 'past_due';
        } else {
          subscriptionStatus = 'canceled';
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: subscriptionStatus,
            subscription_tier: subscriptionStatus === 'canceled' ? null : getTierName(amountCents),
            subscription_amount: subscriptionStatus === 'canceled' ? null : amountCents,
            subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('email', customer.email.toLowerCase());

        if (updateError) {
          console.error("Failed to update subscription:", updateError.message);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted || !customer.email) break;

        // Get tier info before clearing it
        const amountCents = subscription.items.data[0]?.price?.unit_amount || 300;
        const tierName = getTierName(amountCents);
        const accessEndDate = new Date(subscription.current_period_end * 1000).toISOString();

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_tier: null,
            subscription_amount: null,
            subscription_end: accessEndDate,
            updated_at: new Date().toISOString(),
          })
          .eq('email', customer.email.toLowerCase());

        if (updateError) {
          console.error("Failed to mark subscription as canceled:", updateError.message);
        }

        // Send cancellation confirmation email
        const resendKey = Deno.env.get("RESEND_API_KEY");
        if (resendKey) {
          try {
            const resend = new Resend(resendKey);
            const pricingUrl = "https://zeroherobudget.lovable.app/pricing";
            const supportEmail = "support@zeroherobudget.com";

            // Log email attempt
            const logId = await logEmail(supabase, {
              recipientEmail: customer.email,
              emailType: 'subscription_canceled',
              status: 'pending',
              metadata: { tier: tierName, accessEndDate },
            });

            // Render email
            const html = await renderAsync(
              React.createElement(SubscriptionCanceledEmail, {
                email: customer.email,
                tierName,
                accessEndDate,
                pricingUrl,
                supportEmail,
              })
            );

            // Send email
            const emailResponse = await resend.emails.send({
              from: "Zero Hero <noreply@notifications.zeroherobudget.com>",
              to: [customer.email],
              subject: "👋 Your Quest is Paused - We'll Miss You!",
              html,
            });

            if (logId) {
              if (emailResponse.error) {
                console.error("Failed to send cancellation email:", emailResponse.error.message);
                await updateEmailStatus(supabase, logId, 'failed', { errorMessage: emailResponse.error.message });
              } else {
                await updateEmailStatus(supabase, logId, 'sent', { resendId: emailResponse.data?.id });
              }
            }
          } catch (emailErr) {
            console.error("Exception sending cancellation email:", emailErr.message);
          }
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted || !customer.email) break;

        // Get subscription details for the email
        const subscriptionId = invoice.subscription as string;
        let tierName = "Starter";
        let amount = 3;
        let nextRetryDate: string | undefined;

        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const amountCents = subscription.items.data[0]?.price?.unit_amount || 300;
            tierName = getTierName(amountCents);
            amount = amountCents / 100;
            
            // Calculate next retry date (Stripe typically retries after 3-5 days)
            nextRetryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
          } catch (subErr) {
            console.error("Could not retrieve subscription details:", subErr.message);
          }
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('email', customer.email.toLowerCase());

        if (updateError) {
          console.error("Failed to mark as past_due:", updateError.message);
        }

        // Send payment failed email
        const resendKey = Deno.env.get("RESEND_API_KEY");
        if (resendKey) {
          try {
            const resend = new Resend(resendKey);
            const portalUrl = "https://zeroherobudget.lovable.app/account-settings";
            const supportEmail = "support@zeroherobudget.com";

            // Log email attempt
            const logId = await logEmail(supabase, {
              recipientEmail: customer.email,
              emailType: 'payment_failed',
              status: 'pending',
              metadata: { tier: tierName, amount, invoiceId: invoice.id },
            });

            // Render email
            const html = await renderAsync(
              React.createElement(PaymentFailedEmail, {
                email: customer.email,
                tierName,
                amount,
                nextRetryDate,
                portalUrl,
                supportEmail,
              })
            );

            // Send email
            const emailResponse = await resend.emails.send({
              from: "Zero Hero <noreply@notifications.zeroherobudget.com>",
              to: [customer.email],
              subject: "⚠️ Action needed: We couldn't process your payment",
              html,
            });

            if (logId) {
              if (emailResponse.error) {
                console.error("Failed to send payment failed email:", emailResponse.error.message);
                await updateEmailStatus(supabase, logId, 'failed', { errorMessage: emailResponse.error.message });
              } else {
                await updateEmailStatus(supabase, logId, 'sent', { resendId: emailResponse.data?.id });
              }
            }
          } catch (emailErr) {
            console.error("Exception sending payment failed email:", emailErr.message);
          }
        }

        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error in stripe-webhook:", error);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
