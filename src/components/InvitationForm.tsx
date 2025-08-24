
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useHouseholds } from '@/hooks/useHouseholds';
import { UserPlus, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function InvitationForm() {
  const { createInvitation, canManageHousehold } = useHouseholds();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!canManageHousehold()) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    const { error, token } = await createInvitation(email, role);
    
    if (!error && token) {
      setInvitationToken(token);
    }
    
    setIsSubmitting(false);
  };

  const invitationUrl = invitationToken 
    ? `${window.location.origin}/accept-invite/${invitationToken}`
    : '';

  const copyToClipboard = async () => {
    if (invitationUrl) {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Invitation link has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setEmail('');
    setRole('member');
    setInvitationToken(null);
    setCopied(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        // Reset form when closing
        setTimeout(resetForm, 100);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {!invitationToken ? (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Invite New Member</DialogTitle>
              <DialogDescription>
                Create an invitation for someone to join your household. They'll receive a link to accept the invitation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="member@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value: 'admin' | 'member' | 'viewer') => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Can manage household and members</SelectItem>
                    <SelectItem value="member">Member - Can view and edit data</SelectItem>
                    <SelectItem value="viewer">Viewer - Can only view data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !email.trim()}>
                {isSubmitting ? 'Creating...' : 'Create Invitation'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Invitation Created!</DialogTitle>
              <DialogDescription>
                Share this link with {email} to invite them to your household.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>Invitation Link</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={invitationUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This link will expire in 7 days.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={resetForm}>
                Create Another Invitation
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
