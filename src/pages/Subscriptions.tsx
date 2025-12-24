import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocalSubscriptions, Subscription } from '@/hooks/useLocalSubscriptions';
import { useLocalAccounts } from '@/hooks/useLocalAccounts';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';
import { SubscriptionSuggestionList } from '@/components/subscriptions/SubscriptionSuggestionList';
import { formatCurrency } from '@/lib/constants';
import { format } from 'date-fns';
import { Plus, CreditCard, Calendar, ExternalLink, Pause, Play, X, Edit, AlertCircle } from 'lucide-react';
import { SubscriptionSuggestion } from '@/types/subscriptions';
import { toast } from '@/hooks/use-toast';

// Adapt local subscription format to form format
interface FormSubscription {
  id: string;
  name: string;
  merchantKeywords: string[];
  expectedAmount: number;
  cycle: 'monthly' | 'yearly';
  tolerance: number;
  nextCharge: string;
  accountId: string;
  category: string;
  manageUrl?: string;
  status: 'active' | 'paused' | 'canceled';
  createdAt: string;
}

function toFormSubscription(sub: Subscription): FormSubscription {
  return {
    id: sub.id,
    name: sub.name,
    merchantKeywords: [],
    expectedAmount: sub.amount,
    cycle: sub.billing_cycle === 'yearly' ? 'yearly' : 'monthly',
    tolerance: 1.0,
    nextCharge: sub.next_billing_date || '',
    accountId: sub.household_id || '',
    category: sub.category || 'Subscriptions',
    status: sub.is_active ? 'active' : 'canceled',
    createdAt: sub.created_at,
  };
}

function fromFormData(data: Omit<FormSubscription, 'id' | 'createdAt'>): Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  return {
    name: data.name,
    amount: data.expectedAmount,
    billing_cycle: data.cycle,
    category: data.category,
    next_billing_date: data.nextCharge,
    is_active: data.status === 'active',
    household_id: data.accountId || undefined,
  };
}

export function Subscriptions() {
  const {
    subscriptions,
    addSubscription,
    updateSubscription,
    removeSubscription,
    getTotalMonthlySpend,
  } = useLocalSubscriptions();
  
  const { getActiveAccounts } = useLocalAccounts();
  const accounts = getActiveAccounts();

  // Convert to form format for display
  const formattedSubscriptions = useMemo(() => 
    subscriptions.map(toFormSubscription), 
    [subscriptions]
  );

  const pauseSubscription = (id: string) => {
    updateSubscription(id, { is_active: false });
  };

  const resumeSubscription = (id: string) => {
    updateSubscription(id, { is_active: true });
  };

  const cancelSubscription = (id: string) => {
    updateSubscription(id, { is_active: false });
  };

  const getUpcomingRenewals = (daysAhead: number) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    return formattedSubscriptions.filter(sub => 
      sub.status === 'active' && 
      sub.nextCharge && 
      new Date(sub.nextCharge) <= futureDate
    );
  };

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<FormSubscription | undefined>();
  const [ignoredSuggestions, setIgnoredSuggestions] = useState<Set<string>>(new Set());

  // Get filtered subscriptions
  const filteredSubscriptions = useMemo(() => {
    return formattedSubscriptions.filter(sub => {
      if (selectedAccountId !== 'all' && sub.accountId !== selectedAccountId) {
        return false;
      }
      return true;
    });
  }, [formattedSubscriptions, selectedAccountId]);

  // Get active subscriptions
  const activeSubscriptions = filteredSubscriptions.filter(s => s.status === 'active');

  // Get upcoming renewals
  const upcomingRenewals = getUpcomingRenewals(14).filter(sub => 
    selectedAccountId === 'all' || sub.accountId === selectedAccountId
  );

  // Get monthly spend
  const monthlySpend = getTotalMonthlySpend();

  // No suggestions in local-only mode
  const suggestions: SubscriptionSuggestion[] = [];

  const handleAddSubscription = (subscriptionData: Omit<FormSubscription, 'id' | 'createdAt'>) => {
    addSubscription(fromFormData(subscriptionData));
    toast({
      title: "Subscription Added",
      description: `${subscriptionData.name} has been added to your subscriptions.`
    });
  };

  const handleEditSubscription = (subscriptionData: Omit<FormSubscription, 'id' | 'createdAt'>) => {
    if (editingSubscription) {
      updateSubscription(editingSubscription.id, fromFormData(subscriptionData));
      setEditingSubscription(undefined);
      toast({
        title: "Subscription Updated",
        description: `${subscriptionData.name} has been updated.`
      });
    }
  };

  const handleAcceptSuggestion = (suggestion: SubscriptionSuggestion) => {
    // No-op in local-only mode
  };

  const handleIgnoreSuggestion = (suggestionId: string) => {
    setIgnoredSuggestions(prev => new Set([...prev, suggestionId]));
  };

  const handleManageSubscription = (manageUrl?: string) => {
    if (manageUrl) {
      window.open(manageUrl, '_blank');
    } else {
      toast({
        title: "No Manage URL",
        description: "This subscription doesn't have a management URL configured.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success">Active</Badge>;
      case 'paused':
        return <Badge className="bg-warning/10 text-warning">Paused</Badge>;
      case 'canceled':
        return <Badge className="bg-destructive/10 text-destructive">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="pt-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <Button onClick={() => setShowForm(true)} variant="royal">
          <Plus className="h-4 w-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border bg-muted/50">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              const label = format(date, 'MMMM yyyy');
              return (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map(account => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-5">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <CreditCard className="h-5 w-5 text-accent" aria-hidden="true" />
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <div className="text-2xl font-bold">{formatCurrency(monthlySpend)}</div>
            <p className="text-xs text-muted-foreground">
              From {activeSubscriptions.length} active subscription{activeSubscriptions.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-5">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Play className="h-5 w-5 text-accent" aria-hidden="true" />
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              {formattedSubscriptions.filter(s => s.status === 'paused').length} paused, {formattedSubscriptions.filter(s => s.status === 'canceled').length} canceled
            </p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-5">
            <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            <Calendar className="h-5 w-5 text-accent" aria-hidden="true" />
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <div className="text-2xl font-bold">{upcomingRenewals.length}</div>
            <p className="text-xs text-muted-foreground">
              In the next 14 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <SubscriptionSuggestionList 
          suggestions={suggestions} 
          onAccept={handleAcceptSuggestion} 
          onIgnore={handleIgnoreSuggestion} 
        />
      )}

      {/* Upcoming Renewals */}
      {upcomingRenewals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" aria-hidden="true" />
              Upcoming Renewals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingRenewals.map(subscription => (
                <div key={subscription.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{subscription.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(subscription.expectedAmount)} on {format(new Date(subscription.nextCharge), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {subscription.manageUrl && (
                      <Button size="sm" variant="outline" onClick={() => handleManageSubscription(subscription.manageUrl)}>
                        Manage
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => cancelSubscription(subscription.id)}>
                      Mark Canceled
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subscriptions found. Add one to start tracking.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Next Charge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map(subscription => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.name}</div>
                        {subscription.category !== 'Subscriptions' && (
                          <div className="text-xs text-muted-foreground">{subscription.category}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(subscription.expectedAmount)}</TableCell>
                    <TableCell className="capitalize">{subscription.cycle}</TableCell>
                    <TableCell>
                      {subscription.nextCharge && format(new Date(subscription.nextCharge), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setEditingSubscription(subscription);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        {subscription.manageUrl && (
                          <Button size="sm" variant="ghost" onClick={() => handleManageSubscription(subscription.manageUrl)}>
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                        {subscription.status === 'active' && (
                          <Button size="sm" variant="ghost" onClick={() => pauseSubscription(subscription.id)}>
                            <Pause className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                        {subscription.status === 'paused' && (
                          <Button size="sm" variant="ghost" onClick={() => resumeSubscription(subscription.id)}>
                            <Play className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => removeSubscription(subscription.id)}>
                          <X className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <SubscriptionForm 
        open={showForm} 
        onOpenChange={open => {
          setShowForm(open);
          if (!open) setEditingSubscription(undefined);
        }} 
        subscription={editingSubscription as any} 
        onSave={(editingSubscription ? handleEditSubscription : handleAddSubscription) as any} 
      />
    </div>
  );
}
