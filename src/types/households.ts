export type HouseholdRole = 'owner' | 'admin' | 'member' | 'viewer';
export type InvitationStatus = 'pending' | 'accepted' | 'expired';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Household {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  profile_id: string;
  role: HouseholdRole;
  is_primary: boolean;
  joined_at: string;
  profile?: Profile;
}

export interface HouseholdInvitation {
  id: string;
  household_id: string;
  invited_by: string;
  email: string;
  role: HouseholdRole;
  token: string;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
  household?: Household;
  inviter?: Profile;
}