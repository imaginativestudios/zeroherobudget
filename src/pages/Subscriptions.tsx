import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useLocalAccounts } from '@/hooks/useLocalAccounts';
import { SubscriptionForm } from '@/components/subscriptions/SubscriptionForm';
import { SubscriptionSuggestionList } from '@/components/subscriptions/SubscriptionSuggestionList';
import { formatCurrency } from '@/lib/constants';
import { format } from 'date-fns';
import { 
  Plus, 
  CreditCard, 
  Calendar, 
  ExternalLink, 
  Pause, 
  Play, 
  X,
  Edit,
  AlertCircle
} from 'lucide-react';
import { Subscription, SubscriptionSuggestion } from '@/types/subscriptions';
import { toast } from '@/hooks/use-toast';

export function Subscriptions() {
  // Use simple localStorage for subscriptions in prototype mode
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('subscriptions', []);
  const { getActiveAccounts } = useLocalAccounts();
  const accounts = getActiveAccounts();

  // Simplified subscription management for prototype
  const addSubscription = (subscription: Omit<Subscription, 'id' | 'createdAt'>) => {
    const newSub = { ...subscription, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setSubscriptions([...subscriptions, newSub]);
    return newSub;
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id));
  };

  const cancelSubscription = (id: string) => {
    updateSubscription(id, { status: 'canceled' });
  };

  const pauseSubscription = (id: string) => {
    updateSubscription(id, { status: 'paused' });
  };

  const resumeSubscription = (id: string) => {
    updateSubscription(id, { status: 'active' });
  };

  const getUpcomingRenewals = (daysAhead: number) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    return subscriptions.filter(sub => 
      sub.status === 'active' && 
      sub.nextCharge && 
      new Date(sub.nextCharge) <= futureDate
    );
  };

  const getTotalMonthlySpend = (accountId?: string) => {
    return subscriptions
      .filter(sub => sub.status === 'active' && (!accountId || sub.accountId === accountId))
      .reduce((total, sub) => {
        const cycleFactor = sub.cycle === 'yearly' ? 1/12 : 1;
        return total + (sub.expectedAmount * cycleFactor);
      }, 0);
  };

  const autoDetectSubscriptionSuggestions = (): SubscriptionSuggestion[] => {
    return []; // No suggestions in prototype mode
  };

  const linkTransaction = (subscriptionId: string, transactionId: string, matchType: string) => {
    // No-op in prototype mode
  };

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>();
  const [ignoredSuggestions, setIgnoredSuggestions] = useState<Set<string>>(new Set());

  // Get filtered subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      if (selectedAccountId !== 'all' && sub.accountId !== selectedAccountId) {
        return false;
      }
      return true;
    });
  }, [subscriptions, selectedAccountId]);

  // Get active subscriptions
  const activeSubscriptions = filteredSubscriptions.filter(s => s.status === 'active');

  // Get upcoming renewals
  const upcomingRenewals = getUpcomingRenewals(14).filter(sub => 
    selectedAccountId === 'all' || sub.accountId === selectedAccountId
  );

  // Get monthly spend
  const monthlySpend = getTotalMonthlySpend(selectedAccountId === 'all' ? undefined : selectedAccountId);

  // Get suggestions (filtered by ignored)
  const suggestions = autoDetectSubscriptionSuggestions()
    .filter(s => !ignoredSuggestions.has(s.id))
    .filter(s => selectedAccountId === 'all' || s.accountId === selectedAccountId);

  const handleAddSubscription = (subscriptionData: Omit<Subscription, 'id' | 'createdAt'>) => {
    addSubscription(subscriptionData);
    toast({
      title: "Subscription Added",
      description: `${subscriptionData.name} has been added to your subscriptions.`,
    });
  };

  const handleEditSubscription = (subscriptionData: Omit<Subscription, 'id' | 'createdAt'>) => {
    if (editingSubscription) {
      updateSubscription(editingSubscription.id, subscriptionData);
      setEditingSubscription(undefined);
      toast({
        title: "Subscription Updated",
        description: `${subscriptionData.name} has been updated.`,
      });
    }
  };

  const handleAcceptSuggestion = (suggestion: SubscriptionSuggestion) => {
    const subscriptionData: Omit<Subscription, 'id' | 'createdAt'> = {
      name: suggestion.merchantName,
      merchantKeywords: suggestion.merchantKeywords,
      expectedAmount: suggestion.expectedAmount,
      cycle: suggestion.cycle,
      tolerance: 1.0,
      nextCharge: new Date().toISOString().split('T')[0], // Will be updated when linking transactions
      accountId: suggestion.accountId,
      category: 'Subscriptions',
      status: 'active',
    };

    const newSubscription = addSubscription(subscriptionData);

    // Link matching transactions
    suggestion.matchingTransactions.forEach(transactionId => {
      linkTransaction(newSubscription.id, transactionId, 'keyword');
    });

    // Hide this suggestion
    setIgnoredSuggestions(prev => new Set([...prev, suggestion.id]));

    toast({
      title: "Subscription Added",
      description: `${suggestion.merchantName} has been added and linked to ${suggestion.matchingTransactions.length} transactions.`,
    });
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
        variant: "destructive",
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlySpend)}</div>
            <p className="text-xs text-muted-foreground">
              From {activeSubscriptions.length} active subscription{activeSubscriptions.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              {subscriptions.filter(s => s.status === 'paused').length} paused, {subscriptions.filter(s => s.status === 'canceled').length} canceled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
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
              <AlertCircle className="h-5 w-5 text-warning" />
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManageSubscription(subscription.manageUrl)}
                      >
                        Manage
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelSubscription(subscription.id)}
                    >
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
              No subscriptions found. Add one or check our suggestions above.
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
                          <Edit className="h-3 w-3" />
                        </Button>
                        {subscription.manageUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleManageSubscription(subscription.manageUrl)}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                        {subscription.status === 'active' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => pauseSubscription(subscription.id)}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                        {subscription.status === 'paused' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => resumeSubscription(subscription.id)}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeSubscription(subscription.id)}
                        >
                          <X className="h-3 w-3" />
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
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingSubscription(undefined);
        }}
        subscription={editingSubscription}
        onSave={editingSubscription ? handleEditSubscription : handleAddSubscription}
      />
    </div>
  );
}