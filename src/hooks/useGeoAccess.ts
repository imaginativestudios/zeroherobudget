import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeoResult {
  country: string | null;
  allowed: boolean;
  loading: boolean;
}

let cached: { country: string | null; allowed: boolean } | null = null;

export const useGeoAccess = () => {
  const [state, setState] = useState<GeoResult>({
    country: cached?.country ?? null,
    allowed: cached?.allowed ?? true,
    loading: !cached,
  });

  useEffect(() => {
    if (cached) return;
    (async () => {
      try {
        const { data } = await supabase.functions.invoke('geo-check');
        const allowed = data?.allowed !== false; // fail-open
        cached = { country: data?.country ?? null, allowed };
        setState({ country: cached.country, allowed, loading: false });
      } catch {
        cached = { country: null, allowed: true };
        setState({ country: null, allowed: true, loading: false });
      }
    })();
  }, []);

  return state;
};

export const checkGeoAccess = async (): Promise<{ allowed: boolean; country: string | null }> => {
  if (cached) return cached;
  try {
    const { data } = await supabase.functions.invoke('geo-check');
    const allowed = data?.allowed !== false;
    cached = { country: data?.country ?? null, allowed };
    return cached;
  } catch {
    cached = { country: null, allowed: true };
    return cached;
  }
};
