// Shared CORS handling for all edge functions.
//
// Previously every function shipped `Access-Control-Allow-Origin: "*"`, which
// let any website on the internet invoke them -- including create-checkout,
// customer-portal, exchange-plaid-token, and delete-account. Bearer tokens sent
// in an Authorization header are unaffected by the browser's credentialed-
// wildcard restriction, so "*" provided no protection there.
//
// This echoes back the request's Origin only when it appears in ALLOWED_ORIGINS,
// and otherwise falls back to the primary production origin. Echoing (rather
// than returning the whole list) is required: Access-Control-Allow-Origin
// accepts exactly one origin value, never a list.
//
// `Vary: Origin` is mandatory whenever the response varies by Origin, or a
// shared cache can serve one origin's response to another origin.

const ALLOWED_ORIGINS = [
  "https://zeroherobudget.com",
  "https://www.zeroherobudget.com",
  "https://zeroherobudget.lovable.app",
  "https://ukpejgrghpewwdfztryg.lovableproject.com",
];

// Used when the request carries no Origin header (server-to-server calls) or an
// origin that is not allowed. Not a permission grant -- a disallowed origin's
// browser will reject the response because the value will not match its origin.
const FALLBACK_ORIGIN = "https://zeroherobudget.lovable.app";

// Superset of every Allow-Headers list previously used across the functions.
// Permitting extra request headers is harmless; omitting one breaks preflight.
const ALLOW_HEADERS = [
  "authorization",
  "x-client-info",
  "apikey",
  "content-type",
  "x-supabase-client-platform",
  "x-supabase-client-platform-version",
  "x-supabase-client-runtime",
  "x-supabase-client-runtime-version",
].join(", ");

export function isAllowedOrigin(origin: string | null): boolean {
  return origin !== null && ALLOWED_ORIGINS.includes(origin);
}

/**
 * Build CORS headers for a request. Call once at the top of the handler:
 *
 *   serve(async (req) => {
 *     const corsHeaders = buildCors(req);
 *     ...
 *   });
 */
export function buildCors(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin(origin) ? origin! : FALLBACK_ORIGIN,
    "Access-Control-Allow-Headers": ALLOW_HEADERS,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };
}
