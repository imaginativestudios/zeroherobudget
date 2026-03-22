import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { v4 as uuidv4 } from 'uuid';

interface Household {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface HouseholdMember {
  id: string;
  household_id: string;
  profile_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  is_primary: boolean;
  joined_at: string;
  profile: {
    id: string;
    email: string;
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
  };
}

interface Invitation {
  id: string;
  household_id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string;
  created_at: string;
}

export function useRealHouseholds() {
  const { user } = useAuth();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHousehold, setCurrentHousehold] = useState<string>('');
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch households the user belongs to
  const fetchHouseholds = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('profile_id', user.id);

      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        const householdIds = memberData.map(m => m.household_id);
        
        const { data: householdsData, error: householdsError } = await supabase
          .from('households')
          .select('*')
          .in('id', householdIds);

        if (householdsError) throw householdsError;
        
        setHouseholds(householdsData || []);
        
        // Set current household to primary or first
        if (householdsData && householdsData.length > 0 && !currentHousehold) {
          // Try to find primary household
          const { data: primaryMember } = await supabase
            .from('household_members')
            .select('household_id')
            .eq('profile_id', user.id)
            .eq('is_primary', true)
            .maybeSingle();
          
          setCurrentHousehold(primaryMember?.household_id || householdsData[0].id);
        }
      } else {
        // Create default household if none exists
        const { data: newHouseholdId, error: createError } = await supabase
          .rpc('create_default_household');
        
        if (createError) throw createError;
        
        if (newHouseholdId) {
          const { data: newHousehold } = await supabase
            .from('households')
            .select('*')
            .eq('id', newHouseholdId)
            .single();
          
          if (newHousehold) {
            setHouseholds([newHousehold]);
            setCurrentHousehold(newHousehold.id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching households:', error);
    }
  }, [user, currentHousehold]);

  // Fetch members of current household
  const fetchMembers = useCallback(async () => {
    if (!currentHousehold) return;
    
    try {
      // Fetch members (without profile join to avoid exposing sensitive fields)
      const { data: membersData, error: membersError } = await supabase
        .from('household_members')
        .select('id, household_id, profile_id, role, is_primary, joined_at')
        .eq('household_id', currentHousehold);

      if (membersError) throw membersError;

      // Fetch safe profile fields via SECURITY DEFINER function
      const { data: profilesData, error: profilesError } = await supabase
        .rpc('get_household_member_profiles', { _household_id: currentHousehold });

      if (profilesError) throw profilesError;

      // Build a lookup map of profiles by id
      const profileMap = new Map(
        (profilesData || []).map((p: { id: string; email: string; display_name: string | null; first_name: string | null; last_name: string | null; avatar_url: string | null }) => [p.id, p])
      );

      // Transform data to match expected interface
      const transformedMembers: HouseholdMember[] = (membersData || []).map(m => ({
        id: m.id,
        household_id: m.household_id,
        profile_id: m.profile_id,
        role: m.role as 'owner' | 'admin' | 'member' | 'viewer',
        is_primary: m.is_primary,
        joined_at: m.joined_at,
        profile: profileMap.get(m.profile_id) as unknown as HouseholdMember['profile'],
      }));
      
      setMembers(transformedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }, [currentHousehold]);

  // Fetch pending invitations for current household
  const fetchInvitations = useCallback(async () => {
    if (!currentHousehold) return;
    
    try {
      const { data, error } = await supabase
        .from('household_invitations')
        .select('id, household_id, email, role, status, expires_at, created_at')
        .eq('household_id', currentHousehold)
        .eq('status', 'pending');

      if (error) throw error;
      
      setInvitations((data || []) as Invitation[]);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  }, [currentHousehold]);

  // Create invitation with secure token
  const createInvitation = async (email: string, role: 'admin' | 'member' | 'viewer') => {
    if (!currentHousehold || !user) {
      return { success: false, error: 'Not authenticated', token: null, invitationId: null };
    }

    try {
      // Generate a secure random token
      const rawToken = uuidv4();
      
      // Insert invitation - the trigger will hash the token
      const { data, error } = await supabase
        .from('household_invitations')
        .insert({
          household_id: currentHousehold,
          invited_by: user.id,
          email: email.toLowerCase().trim(),
          role,
          token: rawToken, // Will be hashed by trigger
        })
        .select('id')
        .single();

      if (error) throw error;
      
      await fetchInvitations();
      
      // Return the raw token and invitation ID for the secure email endpoint
      return { success: true, error: null, token: rawToken, invitationId: data.id };
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      return { success: false, error: error.message || 'Failed to create invitation', token: null, invitationId: null };
    }
  };

  // Cancel an invitation
  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('household_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
      
      await fetchInvitations();
      return { success: true };
    } catch (error: any) {
      console.error('Error canceling invitation:', error);
      return { success: false, error: error.message };
    }
  };

  // Accept an invitation using secure token verification
  const acceptInvitation = async (rawToken: string) => {
    try {
      // Call the accept_invitation database function with the token
      const { data, error } = await supabase.rpc('accept_invitation', { invitation_token: rawToken });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; household_id?: string };
      
      if (result.success && result.household_id) {
        await fetchHouseholds();
        setCurrentHousehold(result.household_id);
      }
      
      return result;
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      return { success: false, error: error.message || 'Failed to accept invitation' };
    }
  };

  // Update member role
  const updateMemberRole = async (memberId: string, role: 'admin' | 'member' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('household_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
      
      await fetchMembers();
      return { success: true };
    } catch (error: any) {
      console.error('Error updating member role:', error);
      return { success: false, error: error.message };
    }
  };

  // Remove a member
  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      await fetchMembers();
      return { success: true };
    } catch (error: any) {
      console.error('Error removing member:', error);
      return { success: false, error: error.message };
    }
  };

  // Get current user's role in the household
  const getCurrentUserRole = useCallback(() => {
    if (!user) return null;
    const member = members.find(m => m.profile_id === user.id);
    return member?.role || null;
  }, [user, members]);

  // Check if current user can manage household
  const canManageHousehold = useCallback(() => {
    const role = getCurrentUserRole();
    return role === 'owner' || role === 'admin';
  }, [getCurrentUserRole]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchHouseholds().finally(() => setLoading(false));
    }
  }, [user, fetchHouseholds]);

  // Fetch members and invitations when household changes
  useEffect(() => {
    if (currentHousehold) {
      fetchMembers();
      fetchInvitations();
    }
  }, [currentHousehold, fetchMembers, fetchInvitations]);

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
