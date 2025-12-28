import { useState } from 'react';
import { useAuth } from './useAuth';

// Local households hook for production (data stored locally)
export function useHouseholds() {
  const { user } = useAuth();
  
  const defaultHousehold = user ? {
    id: `household-${user.id}`,
    name: 'My Household',
    description: 'Your personal household',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } : null;

  const defaultMember = user ? {
    id: `member-${user.id}`,
    household_id: defaultHousehold?.id || '',
    profile_id: user.id,
    role: 'owner' as const,
    is_primary: true,
    joined_at: new Date().toISOString(),
    profile: {
      id: user.id,
      email: user.email || '',
      display_name: user.user_metadata?.first_name 
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
        : user.email || 'User',
      first_name: user.user_metadata?.first_name || null,
      last_name: user.user_metadata?.last_name || null,
    },
  } : null;

  const [households] = useState(defaultHousehold ? [defaultHousehold] : []);
  const [currentHousehold, setCurrentHousehold] = useState(defaultHousehold?.id || '');
  const [members] = useState(defaultMember ? [defaultMember] : []);
  const [invitations] = useState<any[]>([]);
  const [loading] = useState(false);

  const createInvitation = async (email: string, role: 'admin' | 'member' | 'viewer') => {
    // Household invitations are not available in local-only mode
    return { success: false, error: 'Household sharing requires an account upgrade', token: null };
  };

  const cancelInvitation = async (invitationId: string) => {
    return { success: false };
  };

  const acceptInvitation = async (token: string) => {
    return { success: false, error: 'Household sharing requires an account upgrade' };
  };

  const updateMemberRole = async (memberId: string, role: 'admin' | 'member' | 'viewer') => {
    return { success: false };
  };

  const removeMember = async (memberId: string) => {
    return { success: false };
  };

  const getCurrentUserRole = () => {
    return 'owner' as const;
  };

  const canManageHousehold = () => {
    return true;
  };

  return {
    households,
    currentHousehold,
    setCurrentHousehold,
    members,
    invitations,
    loading,
    createInvitation,
    cancelInvitation,
    acceptInvitation,
    updateMemberRole,
    removeMember,
    getCurrentUserRole,
    canManageHousehold,
  };
}
