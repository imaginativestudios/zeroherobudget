import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface SubscriptionStatus {
  subscribed: boolean;
  isTrialing: boolean;
  tierName: string | null;
  tierEmoji: string | null;
  amount: number | null;
  subscriptionEnd: string | null;
  trialEnd: string | null;
}

export const useSubscriptionStatus = () => {
  const { user, session } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    isTrialing: false,
    tierName: null,
    tierEmoji: null,
    amount: null,
    subscriptionEnd: null,
    trialEnd: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (!user || !session) {
      setStatus({
        subscribed: false,
        isTrialing: false,
        tierName: null,
        tierEmoji: null,
        amount: null,
        subscriptionEnd: null,
        trialEnd: null,
      });
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fnError } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setStatus({
        subscribed: data.subscribed,
        isTrialing: data.is_trialing || false,
        tierName: data.tier_name,
        tierEmoji: data.tier_emoji,
        amount: data.amount,
        subscriptionEnd: data.subscription_end,
        trialEnd: data.trial_end || null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check subscription';
      setError(errorMessage);
      console.error('Subscription check error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  // Realtime subscription channel ref
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    checkSubscription();

    // Auto-refresh every 60 seconds as fallback
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  // Realtime listener for profile subscription status changes
  useEffect(() => {
    if (!user) {
      // Cleanup if user logs out
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Subscribe to profile changes for this user
    const channel = supabase
      .channel(`profile-subscription-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        () => {
          // Immediately refresh subscription status when profile changes
          checkSubscription();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, checkSubscription]);

  const createCheckout = async (amount: number) => {
    if (!session) {
      throw new Error('You must be logged in to subscribe');
    }

    const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
      body: { amount },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (fnError) {
      throw new Error(fnError.message);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data.url;
  };

  const openCustomerPortal = async () => {
    if (!session) {
      throw new Error('You must be logged in to manage your subscription');
    }

    const { data, error: fnError } = await supabase.functions.invoke('customer-portal', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (fnError) {
      throw new Error(fnError.message);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data.url;
  };

  return {
    ...status,
    loading,
    error,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
