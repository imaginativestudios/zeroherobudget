import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { checkCountry } from "../_shared/geo.ts";
import { buildCors } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = buildCors(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const result = await checkCountry(req);
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
