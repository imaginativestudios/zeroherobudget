import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get tier name based on amount in cents
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
  return "🦸";
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ 
        subscribed: false,
        is_trialing: false,
        tier_name: null,
        tier_emoji: null,
        amount: null,
        subscription_end: null,
        trial_end: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;

    // Check for active subscriptions first
    const activeSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    // Also check for trialing subscriptions
    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 1,
    });

    // Prefer active over trialing
    const subscription = activeSubscriptions.data[0] || trialingSubscriptions.data[0];

    if (!subscription) {
      return new Response(JSON.stringify({ 
        subscribed: false,
        is_trialing: false,
        tier_name: null,
        tier_emoji: null,
        amount: null,
        subscription_end: null,
        trial_end: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const isTrialing = subscription.status === "trialing";
    const amountCents = subscription.items.data[0]?.price?.unit_amount ?? 300;
    
    // Safely handle date conversions
    let subscriptionEnd: string | null = null;
    if (subscription.current_period_end && typeof subscription.current_period_end === 'number') {
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    }
    
    let trialEnd: string | null = null;
    if (subscription.trial_end && typeof subscription.trial_end === 'number') {
      trialEnd = new Date(subscription.trial_end * 1000).toISOString();
    }

    return new Response(JSON.stringify({
      subscribed: true,
      is_trialing: isTrialing,
      tier_name: getTierName(amountCents),
      tier_emoji: getTierEmoji(amountCents),
      amount: amountCents / 100,
      subscription_end: subscriptionEnd,
      trial_end: trialEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in check-subscription:", error);
    return new Response(JSON.stringify({ error: "Unable to check subscription status" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
