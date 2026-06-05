export type HouseholdRole = 'owner' | 'admin' | 'member' | 'viewer';
export type InvitationStatus = 'pending' | 'accepted' | 'expired';
export type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'canceled' | 'past_due';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  // Subscription fields
  subscription_status?: SubscriptionStatus;
  stripe_customer_id?: string | null;
  subscription_tier?: string | null;
  subscription_amount?: number | null;
  subscription_end?: string | null;
  beta_access?: boolean;
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
