import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[STRIPE-WEBHOOK] ${step}`, details ? JSON.stringify(details) : '');
};

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
    logStep("ERROR: Missing environment variables");
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
      logStep("ERROR: Missing stripe-signature header");
      return new Response(JSON.stringify({ error: "Missing signature" }), { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep("ERROR: Signature verification failed", { error: err.message });
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
    }
    
    logStep("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const customerId = session.customer as string;
        
        if (!customerEmail) {
          logStep("No customer email in session");
          break;
        }

        const subscriptionId = session.subscription as string;
        if (!subscriptionId) {
          logStep("No subscription ID in session - might be a one-time payment");
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
          logStep("ERROR: Failed to update profile", { error: updateError.message });
        } else {
          logStep("Profile updated after checkout", { email: customerEmail, status, tier: getTierName(amountCents) });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted || !customer.email) {
          logStep("Customer deleted or no email");
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
          logStep("ERROR: Failed to update subscription", { error: updateError.message });
        } else {
          logStep("Subscription updated", { email: customer.email, status: subscriptionStatus });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted || !customer.email) break;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_tier: null,
            subscription_amount: null,
            subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('email', customer.email.toLowerCase());

        if (updateError) {
          logStep("ERROR: Failed to mark subscription as canceled", { error: updateError.message });
        } else {
          logStep("Subscription canceled", { email: customer.email });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        const customer = await stripe.customers.retrieve(customerId);
        if (customer.deleted || !customer.email) break;

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('email', customer.email.toLowerCase());

        if (updateError) {
          logStep("ERROR: Failed to mark as past_due", { error: updateError.message });
        } else {
          logStep("Payment failed, marked past_due", { email: customer.email });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logStep("ERROR: Unexpected error", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
