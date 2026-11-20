import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@18.5.0";

/** Bank linking/sync requires beta access or an active/trialing Stripe subscription. */
export async function hasBankLinkingAccess(userId: string, email: string | null): Promise<boolean> {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("beta_access")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.beta_access === true) return true;

  if (!email) return false;
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    console.error("STRIPE_SECRET_KEY is not set");
    return false;
  }
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length === 0) return false;
  const customerId = customers.data[0].id;

  const active = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
  if (active.data.length > 0) return true;
  const trialing = await stripe.subscriptions.list({ customer: customerId, status: "trialing", limit: 1 });
  return trialing.data.length > 0;
}
