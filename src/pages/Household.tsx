
import { Users, UserPlus, Mail, Crown, Shield, Eye, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHouseholds } from '@/hooks/useHouseholds';
import { HouseholdSelector } from '@/components/HouseholdSelector';
import { InvitationForm } from '@/components/InvitationForm';

export function Household() {
  const { 
    households, 
    currentHousehold, 
    members, 
    invitations, 
    loading,
    getCurrentUserRole,
    canManageHousehold,
    removeMember,
    updateMemberRole,
    cancelInvitation
  } = useHouseholds();

  const selectedHousehold = households.find(h => h.id === currentHousehold);
  const userRole = getCurrentUserRole();
  const householdMembers = members;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-accent" aria-hidden="true" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-primary" aria-hidden="true" />;
      case 'member':
        return <Users className="h-4 w-4 text-success" aria-hidden="true" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />;
      default:
        return <Users className="h-4 w-4" aria-hidden="true" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default' as const;
      case 'admin':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      await removeMember(memberId);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (confirm('Are you sure you want to cancel this invitation?')) {
      await cancelInvitation(invitationId);
    }
  };

  return (
    <div className="pt-8 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Household Management</h1>
          <p className="text-muted-foreground">
            Manage your shared financial household and invite family members
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <HouseholdSelector />
          <InvitationForm />
        </div>
      </div>

      {selectedHousehold && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Household Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" aria-hidden="true" />
                Members ({householdMembers.length})
              </CardTitle>
              <CardDescription>
                People who have access to this household
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {householdMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      {member.profile?.display_name?.[0] || member.profile?.email?.[0] || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {member.profile?.display_name || member.profile?.email}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.profile?.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {canManageHousehold() && member.role !== 'owner' ? (
                        <select
                          value={member.role}
                          onChange={(e) => updateMemberRole(member.id, e.target.value as 'admin' | 'member' | 'viewer')}
                          className="text-sm border rounded px-2 py-1 bg-background"
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1 whitespace-nowrap">
                          {getRoleIcon(member.role)}
                          {member.role}
                        </Badge>
                      )}
                      {canManageHousehold() && member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" aria-hidden="true" />
                Pending Invitations ({invitations.length})
              </CardTitle>
              <CardDescription>
                Invitations waiting to be accepted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invitations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No pending invitations
                </p>
              ) : (
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <UserPlus className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Invited {new Date(invitation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
                          {getRoleIcon(invitation.role)}
                          {invitation.role}
                        </Badge>
                        {canManageHousehold() && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelInvitation(invitation.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {households.length === 0 && (
        <Card className="shadow-royal">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold mb-2">No households found</h3>
            <p className="text-muted-foreground mb-4">
              It looks like you don't belong to any households yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
