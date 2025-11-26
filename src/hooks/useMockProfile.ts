import { useState, useEffect } from 'react';
import { Profile } from '@/types/households';
import { useAuth } from './useAuth';

export function useMockProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    // Create mock profile from mock auth user
    const mockProfile: Profile = {
      id: user.id,
      email: user.email || 'demo@example.com',
      display_name: `${user.user_metadata?.first_name || 'Demo'} ${user.user_metadata?.last_name || 'User'}`,
      first_name: user.user_metadata?.first_name || 'Demo',
      last_name: user.user_metadata?.last_name || 'User',
      avatar_url: null,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    setProfile(mockProfile);
    setLoading(false);
  }, [user]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return { error: 'No profile to update' };

    // In prototype mode, just update local state
    setProfile({ ...profile, ...updates });
    return { error: null };
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: () => {}, // No-op in prototype mode
  };
}
