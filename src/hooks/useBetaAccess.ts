import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const LEGACY_KEY = "beta_access";
const DEVICE_KEY = "beta_ui_enabled";

function readDeviceFlag(): boolean | null {
  const v = localStorage.getItem(DEVICE_KEY);
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

export function useBetaAccess() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [serverEligible, setServerEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deviceFlag, setDeviceFlag] = useState<boolean | null>(() => readDeviceFlag());
  const [legacyFlag, setLegacyFlag] = useState(
    () => localStorage.getItem(LEGACY_KEY) === "true"
  );

  // Handle URL params (?beta=true / ?beta=false)
  useEffect(() => {
    const betaParam = searchParams.get("beta");
    if (betaParam === "true") {
      localStorage.setItem(DEVICE_KEY, "true");
      localStorage.setItem(LEGACY_KEY, "true");
      setDeviceFlag(true);
      setLegacyFlag(true);
    } else if (betaParam === "false") {
      localStorage.setItem(DEVICE_KEY, "false");
      localStorage.removeItem(LEGACY_KEY);
      setDeviceFlag(false);
      setLegacyFlag(false);
    }
  }, [searchParams]);

  // Fetch server-side eligibility
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setServerEligible(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("profiles")
      .select("beta_access")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setServerEligible(Boolean((data as { beta_access?: boolean } | null)?.beta_access));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const eligible = serverEligible || legacyFlag;
  // Default to enabled when eligible and no explicit device choice has been made
  const enabledOnDevice = deviceFlag ?? true;
  const isBeta = eligible && enabledOnDevice;

  const enable = useCallback(() => {
    localStorage.setItem(DEVICE_KEY, "true");
    setDeviceFlag(true);
  }, []);

  const disable = useCallback(() => {
    localStorage.setItem(DEVICE_KEY, "false");
    setDeviceFlag(false);
  }, []);

  return {
    isBeta,
    eligible,
    enabledOnDevice,
    loading,
    enable,
    disable,
  };
}
