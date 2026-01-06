import { useAuth } from './useAuth';
import { useRealHouseholds } from './useRealHouseholds';

// Unified households hook - uses real Supabase implementation for authenticated users
export function useHouseholds() {
  const { user, loading: authLoading } = useAuth();
  const realHouseholds = useRealHouseholds();
  
  // If user is authenticated, return the real Supabase implementation
  if (user) {
    return realHouseholds;
  }

  // For unauthenticated users, return a minimal stub
  return {
    households: [],
    currentHousehold: '',
    setCurrentHousehold: () => {},
    members: [],
    invitations: [],
    loading: authLoading,
    createInvitation: async () => ({ success: false, error: 'Authentication required', token: null, invitationId: null }),
    cancelInvitation: async () => ({ success: false, error: 'Authentication required' }),
    acceptInvitation: async () => ({ success: false, error: 'Authentication required' }),
    updateMemberRole: async () => ({ success: false, error: 'Authentication required' }),
    removeMember: async () => ({ success: false, error: 'Authentication required' }),
    getCurrentUserRole: () => null,
    canManageHousehold: () => false,
  };
}
