import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { amount } = await req.json();
    
    // Validate amount is between $3 and $15 (300-1500 cents)
    const amountCents = Math.round(amount * 100);
    if (amountCents < 300 || amountCents > 1500) {
      throw new Error("Amount must be between $3 and $15");
    }
    logStep("Amount validated", { amountCents });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    let hasHadSubscription = false;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
      
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
      logStep("Checked subscription history", { hasHadSubscription });
    }

    const origin = req.headers.get("origin") || "https://ukpejgrghpewwdfztryg.lovableproject.com";
    
    // Create checkout session with dynamic pricing and 7-day free trial for new customers
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product: "prod_ToGDxQx1RgvD3J", // Zero Hero Subscription product
            unit_amount: amountCents,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/pricing?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        selected_amount: amountCents.toString(),
      },
    };
    
    // Only add trial for customers who have never subscribed before
    if (!hasHadSubscription) {
      sessionConfig.subscription_data = {
        trial_period_days: 7,
      };
      logStep("Adding 7-day trial for new customer");
    } else {
      logStep("Skipping trial for returning customer");
    }
    
    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in create-checkout:", error);
    
    // Only expose safe, expected error messages to the client
    const safeErrors = [
      "Amount must be between $3 and $15",
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
