import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0?dts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Fixed price IDs for monthly and annual plans
const PRICE_IDS = {
  monthly: 'price_1SsW56LOOLpslU1kncgwtvl1',
  annual: 'price_1SsW5ULOOLpslU1kdyaY3yy1',
} as const;

type PricingInterval = keyof typeof PRICE_IDS;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
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

    const { interval } = await req.json();
    
    // Validate interval
    if (!interval || !PRICE_IDS[interval as PricingInterval]) {
      throw new Error("Invalid subscription interval. Must be 'monthly' or 'annual'");
    }

    const priceId = PRICE_IDS[interval as PricingInterval];

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    let hasHadSubscription = false;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      
      // Check if they already have an active or trialing subscription
      const activeSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      
      const trialingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
        limit: 1,
      });
      
      if (activeSubscriptions.data.length > 0 || trialingSubscriptions.data.length > 0) {
        throw new Error("You already have an active subscription. Please manage it from your account settings.");
      }
      
      // Check if they've ever had a subscription (to prevent trial abuse)
      const allSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
      });
      hasHadSubscription = allSubscriptions.data.length > 0;
    }

    const origin = req.headers.get("origin") || "https://ukpejgrghpewwdfztryg.lovableproject.com";
    
    // Create checkout session with fixed pricing and 7-day free trial for new customers
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/checkout-success`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        interval: interval,
      },
    };
    
    // Only add trial for customers who have never subscribed before
    if (!hasHadSubscription) {
      sessionConfig.subscription_data = {
        trial_period_days: 7,
      };
    }
    
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in create-checkout:", error);
    
    // Only expose safe, expected error messages to the client
    const safeErrors = [
      "Invalid subscription interval. Must be 'monthly' or 'annual'",
      "You already have an active subscription. Please manage it from your account settings.",
    ];
    const clientMessage = safeErrors.includes(errorMessage) 
      ? errorMessage 
      : "Unable to create checkout session";
    
    return new Response(JSON.stringify({ error: clientMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
