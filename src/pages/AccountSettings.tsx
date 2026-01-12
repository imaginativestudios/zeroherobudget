import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  CreditCard, 
  Database, 
  Users, 
  Shield, 
  HelpCircle,
  ExternalLink,
  Edit2,
  Check,
  X,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useRealProfile } from '@/hooks/useRealProfile';
import { format } from 'date-fns';
import { toast } from 'sonner';

const AccountSettings = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useRealProfile();
  const { 
    subscribed, 
    isTrialing, 
    tierName, 
    tierEmoji, 
    amount, 
    subscriptionEnd,
    trialEnd,
    loading: subscriptionLoading,
    openCustomerPortal 
  } = useSubscriptionStatus();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleEditProfile = () => {
    setEditedFirstName(profile?.first_name || '');
    setEditedLastName(profile?.last_name || '');
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditedFirstName('');
    setEditedLastName('');
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const displayName = `${editedFirstName} ${editedLastName}`.trim() || profile?.email || '';
    const result = await updateProfile({
      first_name: editedFirstName || null,
      last_name: editedLastName || null,
      display_name: displayName,
    });
    
    if (result.error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
      setIsEditingProfile(false);
    }
    setIsSaving(false);
  };

  const handleManageSubscription = async () => {
    try {
      const url = await openCustomerPortal();
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      toast.error('Failed to open subscription portal');
    }
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (profile?.display_name) {
      return profile.display_name.slice(0, 2).toUpperCase();
    }
    if (profile?.email) {
      return profile.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getSubscriptionStatus = () => {
    if (isTrialing) {
      const daysRemaining = trialEnd 
        ? Math.ceil((new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;
      return { label: `Trial (${daysRemaining} days left)`, variant: 'secondary' as const };
    }
    if (subscribed) {
      return { label: 'Active', variant: 'default' as const };
    }
    return { label: 'Not Subscribed', variant: 'outline' as const };
  };

  const status = getSubscriptionStatus();
  const memberSince = profile?.created_at 
    ? format(new Date(profile.created_at), 'MMMM yyyy')
    : 'Recently';

  const quickLinks = [
    {
      title: 'Data Management',
      description: 'Import, export, and backup your data',
      icon: Database,
      href: '/data',
    },
    {
      title: 'Household',
      description: 'Manage household members and sharing',
      icon: Users,
      href: '/household',
    },
    {
      title: 'Privacy FAQ',
      description: 'Learn how your data is protected',
      icon: Shield,
      href: '/privacy-faq',
    },
    {
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: HelpCircle,
      href: '/help',
    },
  ];

  return (
    <div className="container mx-auto px-4 pt-8 pb-16 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, subscription, and account preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" aria-hidden="true" />
                Profile
              </CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </div>
            {!isEditingProfile && (
              <Button variant="outline" size="sm" onClick={handleEditProfile}>
                <Edit2 className="h-4 w-4 mr-2" aria-hidden="true" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editedFirstName}
                        onChange={(e) => setEditedFirstName(e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editedLastName}
                        onChange={(e) => setEditedLastName(e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} disabled={isSaving} size="sm">
                      <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="outline" onClick={handleCancelEdit} size="sm">
                      <X className="h-4 w-4 mr-2" aria-hidden="true" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-medium">
                      {profile?.display_name || profile?.email || 'User'}
                    </p>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    <span>Member since {memberSince}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" aria-hidden="true" />
            Subscription
          </CardTitle>
          <CardDescription>Your Zero Hero subscription status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscriptionLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-4">
                {subscribed || isTrialing ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tierEmoji || '🌱'}</span>
                      <span className="text-xl font-semibold">{tierName || 'Starter'}</span>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </>
                ) : (
                  <Badge variant="outline">Not Subscribed</Badge>
                )}
              </div>

              {(subscribed || isTrialing) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {amount && (
                    <div>
                      <p className="text-muted-foreground">Monthly Amount</p>
                      <p className="font-medium">${(amount / 100).toFixed(2)}/month</p>
                    </div>
                  )}
                  {subscriptionEnd && (
                    <div>
                      <p className="text-muted-foreground">
                        {isTrialing ? 'Trial Ends' : 'Next Billing Date'}
                      </p>
                      <p className="font-medium">
                        {format(new Date(isTrialing ? trialEnd! : subscriptionEnd), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              <div className="flex flex-wrap gap-3">
                {subscribed || isTrialing ? (
                  <Button onClick={handleManageSubscription}>
                    <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
                    Manage Subscription
                  </Button>
                ) : (
                  <Button asChild>
                    <Link to="/pricing">
                      View Pricing Plans
                    </Link>
                  </Button>
                )}
              </div>

              {/* Cancellation info for subscribed users */}
              {(subscribed || isTrialing) && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <p className="font-medium text-foreground">Your Rights</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Cancel anytime — no penalties or hidden fees</li>
                    <li>• After cancellation, retain access until your billing period ends</li>
                    <li>• Your data is always yours — export it anytime from Data Management</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Billing Portal Card (Subscribed users only) */}
      {(subscribed || isTrialing) && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View invoices and payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your complete billing history, invoices, and payment methods are available in the Stripe Customer Portal.
            </p>
            <Button variant="outline" onClick={handleManageSubscription}>
              <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
              Open Billing Portal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Links Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Card key={link.href} className="hover:bg-accent/50 transition-colors">
              <Link to={link.href}>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <link.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium">{link.title}</p>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Point of No Return (formerly Danger Zone) */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            Point of No Return
          </CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            To delete your account and all associated data, go to Data Management.
          </p>
          <Button variant="outline" asChild>
            <Link to="/data">
              Go to Data Management
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
