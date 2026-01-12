import { useState, useEffect } from 'react';
import { Profile, SubscriptionStatus } from '@/types/households';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Helper to cast database response to Profile type with correct subscription_status
const castToProfile = (data: Record<string, unknown>): Profile => {
  return {
    ...data,
    subscription_status: (data.subscription_status as SubscriptionStatus) || 'free',
  } as Profile;
};

export function useRealProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create one from user metadata
        if (error.code === 'PGRST116') {
          const newProfile: Profile = {
            id: user.id,
            email: user.email || '',
            display_name: user.user_metadata?.first_name 
              ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
              : user.email || '',
            first_name: user.user_metadata?.first_name || null,
            last_name: user.user_metadata?.last_name || null,
            avatar_url: null,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            subscription_status: 'free',
          };
          setProfile(newProfile);
        }
      } else if (data) {
        setProfile(castToProfile(data));
      }
      
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile || !user) return { error: 'No profile to update' };

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (!error) {
      setProfile({ ...profile, ...updates });
    }

    return { error: error?.message || null };
  };

  const refetch = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setProfile(castToProfile(data));
    }
    setLoading(false);
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch,
  };
}
