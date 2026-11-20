// Shared geo-IP helper for edge functions.
// Uses ipwho.is (no API key, free, ~10k req/mo).

export interface GeoResult {
  ip: string | null;
  country: string | null; // ISO-2
  allowed: boolean;
  reason?: string;
}

const ALLOWED_COUNTRIES = new Set(['US']);

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const IPV6 = /^[0-9a-fA-F:]{2,39}$/;
const isPublicIp = (ip: string) =>
  (IPV4.test(ip) && !/^(10\.|127\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip)) ||
  (IPV6.test(ip) && ip.includes(':') && !/^(::1?$|fe80:|fc|fd)/i.test(ip));

// Prefer the edge-provided client address (set by the platform's proxy, not
// the caller); only well-formed public IPs are ever sent to the lookup provider.
export function getClientIp(req: Request): string | null {
  const candidates = [
    req.headers.get('cf-connecting-ip'),
    req.headers.get('x-real-ip'),
    req.headers.get('x-forwarded-for')?.split(',').pop(),
  ];
  for (const c of candidates) {
    const ip = c?.trim();
    if (ip && isPublicIp(ip)) return ip;
  }
  return null;
}

export async function checkCountry(req: Request): Promise<GeoResult> {
  const ip = getClientIp(req);
  if (!ip) return { ip: null, country: null, allowed: false, reason: 'no-ip' };

  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=country_code,success`);
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
