import { useState } from 'react';

const MOCK_HOUSEHOLD = {
  id: 'default-household-123',
  name: 'My Household',
  description: 'Default household',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_MEMBER = {
  id: 'member-123',
  household_id: MOCK_HOUSEHOLD.id,
  profile_id: 'demo-user-123',
  role: 'owner' as const,
  is_primary: true,
  joined_at: new Date().toISOString(),
  profile: {
    id: 'demo-user-123',
    email: 'demo@example.com',
    display_name: 'Demo User',
    first_name: 'Demo',
    last_name: 'User',
  },
};

export function useMockHouseholds() {
  const [households] = useState([MOCK_HOUSEHOLD]);
  const [currentHousehold, setCurrentHousehold] = useState(MOCK_HOUSEHOLD.id);
  const [members] = useState([MOCK_MEMBER]);
  const [invitations] = useState([]);
  const [loading] = useState(false);

  const createInvitation = async (email: string, role: 'admin' | 'member' | 'viewer') => {
    return { success: false, error: 'Invitations not available in prototype mode', token: null };
  };

  const cancelInvitation = async (invitationId: string) => {
    return { success: false };
  };

  const acceptInvitation = async (token: string) => {
    return { success: false, error: 'Invitations not available in prototype mode' };
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
