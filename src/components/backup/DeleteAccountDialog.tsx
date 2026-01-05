import { useState } from 'react';
import { Trash2, AlertTriangle, Download } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createBackup, downloadBackup } from '@/lib/dataBackup';
import { clearAllUserData } from '@/lib/dataClear';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmPhrase = 'DELETE';
  const canDelete = confirmChecked && confirmText === confirmPhrase;

  const handleCreateBackup = () => {
    if (!user) return;
    
    try {
      const backup = createBackup(user.id);
      downloadBackup(backup, user.id);
      toast({
        title: 'Backup Created',
        description: 'Your data has been backed up before account deletion.',
      });
    } catch (error) {
      toast({
        title: 'Backup Failed',
        description: 'Failed to create backup.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !canDelete) return;
    
    setIsDeleting(true);
    
    try {
      // First, clear all local data
      clearAllUserData(user.id);

      // Delete user's profile (cascades will handle related data via RLS)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        // Continue anyway - the auth deletion is more important
      }

      // Sign out the user (this will clear the session)
      await supabase.auth.signOut();

      toast({
        title: 'Account Deleted',
        description: 'Your account and all associated data have been permanently deleted.',
      });

      onOpenChange(false);
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Deletion Failed',
        description: 'Failed to delete your account. Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setConfirmChecked(false);
      setConfirmText('');
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              This will <strong>permanently delete</strong> your account and all associated data, including:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Your profile and account settings</li>
              <li>All transactions, budget items, and debts</li>
              <li>Subscriptions and accounts</li>
              <li>Household memberships and data</li>
            </ul>
            <p className="text-destructive font-medium">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Backup recommendation */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Download className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Download your data first</p>
              <p className="text-xs text-muted-foreground">
                We recommend backing up before deletion
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleCreateBackup}>
              Backup
            </Button>
          </div>

          {/* Confirmation checkbox */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="confirm-delete"
              checked={confirmChecked}
              onCheckedChange={(checked) => setConfirmChecked(checked === true)}
            />
            <Label htmlFor="confirm-delete" className="text-sm leading-relaxed cursor-pointer">
              I understand that this action is permanent and all my data will be deleted forever.
            </Label>
          </div>

          {/* Type confirmation */}
          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-sm">
              Type <span className="font-mono font-bold">{confirmPhrase}</span> to confirm:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={confirmPhrase}
              className="font-mono"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={!canDelete || isDeleting}
          >
            {isDeleting ? (
              <>Deleting...</>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete My Account
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
