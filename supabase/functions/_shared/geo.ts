// Shared geo-IP helper for edge functions.
// Uses ipwho.is (no API key, free, ~10k req/mo).

export interface GeoResult {
  ip: string | null;
  country: string | null; // ISO-2
  allowed: boolean;
  reason?: string;
}

const ALLOWED_COUNTRIES = new Set(['US']);

export function getClientIp(req: Request): string | null {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || null;
}

export async function checkCountry(req: Request): Promise<GeoResult> {
  const ip = getClientIp(req);
  if (!ip) return { ip: null, country: null, allowed: false, reason: 'no-ip' };

  try {
    const res = await fetch(`https://ipwho.is/${ip}?fields=country_code,success`);
    const data = await res.json();
    const country: string | null = data?.country_code ?? null;
    const allowed = !!country && ALLOWED_COUNTRIES.has(country);
    return { ip, country, allowed, reason: allowed ? undefined : 'country-not-allowed' };
  } catch {
    // Fail-open for availability would let non-US in; fail-closed blocks legit US.
    // We fail-open here to avoid false negatives on geo provider hiccups.
    return { ip, country: null, allowed: true, reason: 'geo-lookup-failed' };
  }
}
