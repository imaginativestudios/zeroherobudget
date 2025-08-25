import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Household, HouseholdMember, HouseholdInvitation } from '@/types/households';
import { useAuth } from './useAuth';
import { useLocalStorage } from './useLocalStorage';
import { toast } from './use-toast';

export function useHouseholds() {
  const { user } = useAuth();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [currentHousehold, setCurrentHousehold] = useLocalStorage<string | null>('selectedHousehold', null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [invitations, setInvitations] = useState<HouseholdInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHouseholds([]);
      setHouseholdMembers([]);
      setInvitations([]);
      setLoading(false);
      return;
    }

    fetchHouseholds();
  }, [user]);

  useEffect(() => {
    if (households.length > 0 && !currentHousehold) {
      // Auto-select the first household if none is selected
      setCurrentHousehold(households[0].id);
    }
  }, [households, currentHousehold, setCurrentHousehold]);

  useEffect(() => {
    if (currentHousehold) {
      fetchHouseholdMembers();
      fetchInvitations();
    }
  }, [currentHousehold]);

  const fetchHouseholds = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          household_id,
          role,
          is_primary,
          households:household_id (
            id,
            name,
            description,
            created_at,
            updated_at
          )
        `)
        .eq('profile_id', user.id);

      if (error) {
        console.error('Error fetching households:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load households",
        });
        return;
      }

      const householdsData = data
        .map(member => member.households)
        .filter(Boolean) as Household[];
      
      setHouseholds(householdsData);

      // If no households exist, create a default one
      if (householdsData.length === 0) {
        await createDefaultHousehold();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultHousehold = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('create_default_household', {
        user_id: user.id
      });

      if (error) {
        console.error('Error creating default household:', error);
        return;
      }

      // Refresh households
      await fetchHouseholds();
    } catch (error) {
      console.error('Error creating default household:', error);
    }
  };

  const fetchHouseholdMembers = async () => {
    if (!currentHousehold) return;

    try {
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          *,
          profile:profiles (
            id,
            email,
            display_name,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .eq('household_id', currentHousehold);

      if (error) {
        console.error('Error fetching household members:', error);
        return;
      }

      setHouseholdMembers(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchInvitations = async () => {
    if (!currentHousehold) return;

    try {
      const { data, error } = await supabase
        .from('household_invitations')
        .select('*')
        .eq('household_id', currentHousehold)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching invitations:', error);
        return;
      }

      setInvitations(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createInvitation = async (email: string, role: 'admin' | 'member' | 'viewer') => {
    if (!currentHousehold || !user) return { error: 'No household selected' };

    try {
      const token = crypto.randomUUID();
      
      const { error } = await supabase
        .from('household_invitations')
        .insert({
          household_id: currentHousehold,
          invited_by: user.id,
          email,
          role,
          token,
        });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create invitation",
        });
        return { error };
      }

      await fetchInvitations();
      
      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${email}`,
      });

      return { error: null, token };
    } catch (error) {
      console.error('Error creating invitation:', error);
      return { error };
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('household_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to cancel invitation",
        });
        return { error };
      }

      await fetchInvitations();
      
      toast({
        title: "Invitation canceled",
        description: "The invitation has been canceled",
      });

      return { error: null };
    } catch (error) {
      console.error('Error canceling invitation:', error);
      return { error };
    }
  };

  const acceptInvitation = async (token: string) => {
    try {
      const { data, error } = await supabase.rpc('accept_invitation', {
        invitation_token: token
      });

      interface InvitationResult {
        success?: boolean;
        error?: string;
        household_id?: string;
      }

      const result = data as InvitationResult | null;

      if (error || !result?.success) {
        const message = result?.error || 'Failed to accept invitation';
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });
        return { error: message };
      }

      toast({
        title: "Invitation accepted",
        description: "You have joined the household",
      });

      // Refresh households
      await fetchHouseholds();
      
      return { error: null, household_id: result.household_id };
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return { error };
    }
  };

  const updateMemberRole = async (memberId: string, role: 'admin' | 'member' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('household_members')
        .update({ role })
        .eq('id', memberId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update member role",
        });
        return { error };
      }

      await fetchHouseholdMembers();
      
      toast({
        title: "Role updated",
        description: "Member role has been updated",
      });

      return { error: null };
    } catch (error) {
      console.error('Error updating member role:', error);
      return { error };
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove member",
        });
        return { error };
      }

      await fetchHouseholdMembers();
      
      toast({
        title: "Member removed",
        description: "Member has been removed from the household",
      });

      return { error: null };
    } catch (error) {
      console.error('Error removing member:', error);
      return { error };
    }
  };

  const getCurrentUserRole = () => {
    if (!user || !currentHousehold) return null;
    
    const member = householdMembers.find(m => m.profile_id === user.id);
    return member?.role || null;
  };

  const canManageHousehold = () => {
    const role = getCurrentUserRole();
    return role === 'owner' || role === 'admin';
  };

  return {
    households,
    currentHousehold,
    householdMembers,
    invitations,
    loading,
    setCurrentHousehold,
    createInvitation,
    cancelInvitation,
    acceptInvitation,
    updateMemberRole,
    removeMember,
    getCurrentUserRole,
    canManageHousehold,
    refetch: fetchHouseholds,
  };
}
