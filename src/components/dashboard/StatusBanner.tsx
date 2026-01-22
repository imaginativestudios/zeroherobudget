/**
 * StatusBanner Component - Unified Priority Banner System
 * 
 * Displays only the highest-priority status banner to reduce visual clutter.
 * Priority order: TrialCountdown > RegroupingBanner > PrivacyNotice
 */

import { TrialCountdownBanner } from './TrialCountdownBanner';
import { RegroupingBanner } from '@/components/defense/RegroupingBanner';
import { PrivacyNotice } from '@/components/PrivacyNotice';
import type { PricingInterval } from '@/lib/constants';

interface StatusBannerProps {
  // Trial status
  isTrialing: boolean;
  trialEnd: string | null;
  interval?: PricingInterval | null;
  
  // Moat status
  isRegrouping: boolean;
  isVulnerable: boolean;
  bannerDismissed: boolean;
}

type BannerType = 'trial' | 'regrouping' | 'privacy' | null;

export function StatusBanner({
  isTrialing,
  trialEnd,
  interval,
  isRegrouping,
  isVulnerable,
  bannerDismissed,
}: StatusBannerProps) {
  // Determine which banner to show based on priority
  const getActiveBanner = (): BannerType => {
    // Priority 1: Trial countdown (most urgent - time-sensitive)
    if (isTrialing && trialEnd) {
      return 'trial';
    }
    
    // Priority 2: Regrouping/Vulnerable state (financial health warning)
    if ((isRegrouping || isVulnerable) && !bannerDismissed) {
      return 'regrouping';
    }
    
    // Priority 3: Privacy notice (first-time user education)
    // PrivacyNotice handles its own visibility logic internally
    return 'privacy';
  };

  const activeBanner = getActiveBanner();

  switch (activeBanner) {
    case 'trial':
      return (
        <TrialCountdownBanner 
          trialEnd={trialEnd!} 
          interval={interval} 
        />
      );
    
    case 'regrouping':
      return <RegroupingBanner />;
    
    case 'privacy':
      return <PrivacyNotice />;
    
    default:
      return null;
  }
}
