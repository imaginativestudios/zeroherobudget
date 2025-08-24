import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Subscription } from '@/types/subscriptions';
import { useAccounts } from '@/hooks/useAccounts';
import { KNOWN_PROVIDERS, getProviderByName } from '@/lib/providerDirectory';
import { toast } from '@/hooks/use-toast';
import { calculateNextChargeDate } from '@/lib/subscriptionDetection';

interface SubscriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription;
  onSave: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
}

export function SubscriptionForm({ open, onOpenChange, subscription, onSave }: SubscriptionFormProps) {
  const { getActiveAccounts } = useAccounts();
  const accounts = getActiveAccounts();

  const [formData, setFormData] = useState<Partial<Subscription>>(() => ({
    name: subscription?.name || '',
    merchantKeywords: subscription?.merchantKeywords || [],
    expectedAmount: subscription?.expectedAmount || 0,
    cycle: subscription?.cycle || 'monthly',
    everyN: subscription?.everyN || 1,
    tolerance: subscription?.tolerance || 1.0,
    nextCharge: subscription?.nextCharge || new Date().toISOString().split('T')[0],
    accountId: subscription?.accountId || accounts[0]?.id || '',
    category: subscription?.category || 'Subscriptions',
    manageUrl: subscription?.manageUrl || '',
    status: subscription?.status || 'active',
    notes: subscription?.notes || '',
  }));

  const handleProviderSelect = (providerName: string) => {
    const provider = getProviderByName(providerName);
    if (provider) {
      setFormData(prev => ({
        ...prev,
        name: provider.name,
        merchantKeywords: provider.keywords,
        expectedAmount: provider.typicalAmount || prev.expectedAmount,
        manageUrl: provider.manageUrl,
        category: provider.category,
      }));
    } else {
      setFormData(prev => ({ ...prev, name: providerName }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.expectedAmount || !formData.accountId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Calculate next charge if last charge is provided
    let nextCharge = formData.nextCharge;
    if (formData.lastCharge && formData.cycle) {
      nextCharge = calculateNextChargeDate(formData.lastCharge, formData.cycle, formData.everyN);
    }

    const subscriptionData: Omit<Subscription, 'id' | 'createdAt'> = {
      name: formData.name!,
      merchantKeywords: formData.merchantKeywords || [formData.name!.toLowerCase()],
      expectedAmount: formData.expectedAmount!,
      cycle: formData.cycle!,
      everyN: formData.everyN || 1,
      tolerance: formData.tolerance || 1.0,
      nextCharge: nextCharge!,
      lastCharge: formData.lastCharge,
      accountId: formData.accountId!,
      category: formData.category || 'Subscriptions',
      manageUrl: formData.manageUrl,
      status: formData.status || 'active',
      notes: formData.notes,
    };

    onSave(subscriptionData);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      name: '',
      merchantKeywords: [],
      expectedAmount: 0,
      cycle: 'monthly',
      everyN: 1,
      tolerance: 1.0,
      nextCharge: new Date().toISOString().split('T')[0],
      accountId: accounts[0]?.id || '',
      category: 'Subscriptions',
      manageUrl: '',
      status: 'active',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {subscription ? 'Edit Subscription' : 'Add Subscription'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                list="providers"
                value={formData.name}
                onChange={(e) => handleProviderSelect(e.target.value)}
                placeholder="e.g., Netflix, Spotify"
                required
              />
              <datalist id="providers">
                {KNOWN_PROVIDERS.map(provider => (
                  <option key={provider.name} value={provider.name} />
                ))}
              </datalist>
            </div>

            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.expectedAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedAmount: parseFloat(e.target.value) || 0 }))}
                placeholder="9.99"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cycle">Billing Cycle *</Label>
              <Select
                value={formData.cycle}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, cycle: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.cycle === 'custom' && (
              <div>
                <Label htmlFor="everyN">Every N Days</Label>
                <Input
                  id="everyN"
                  type="number"
                  value={formData.everyN}
                  onChange={(e) => setFormData(prev => ({ ...prev, everyN: parseInt(e.target.value) || 1 }))}
                  placeholder="30"
                />
              </div>
            )}

            <div>
              <Label htmlFor="account">Account *</Label>
              <Select
                value={formData.accountId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, accountId: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nextCharge">Next Charge Date</Label>
              <Input
                id="nextCharge"
                type="date"
                value={formData.nextCharge}
                onChange={(e) => setFormData(prev => ({ ...prev, nextCharge: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="manageUrl">Manage URL</Label>
            <Input
              id="manageUrl"
              type="url"
              value={formData.manageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, manageUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              value={formData.merchantKeywords?.join(', ')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                merchantKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
              }))}
              placeholder="netflix, streaming"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {subscription ? 'Update' : 'Add'} Subscription
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}