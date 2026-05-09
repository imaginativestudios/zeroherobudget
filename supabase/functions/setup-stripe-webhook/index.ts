// One-off helper: creates a live-mode webhook endpoint in Stripe and returns the signing secret.
// Safe to delete after use.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const url = "https://ukpejgrghpewwdfztryg.supabase.co/functions/v1/stripe-webhook";

    // Avoid duplicates
    const existing = await stripe.webhookEndpoints.list({ limit: 100 });
    const dup = existing.data.find((w) => w.url === url);
    if (dup) {
      return new Response(
        JSON.stringify({
          existed: true,
          message: "Webhook already exists. Signing secret is only revealed at creation. Delete it in Stripe Dashboard and re-run, or copy the secret from the dashboard.",
          id: dup.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const endpoint = await stripe.webhookEndpoints.create({
      url,
      enabled_events: [
        "checkout.session.completed",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "invoice.payment_failed",
      ],
      description: "Zero Hero Budget — subscription sync",
    });

    return new Response(
      JSON.stringify({ id: endpoint.id, url: endpoint.url, signing_secret: endpoint.secret }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
