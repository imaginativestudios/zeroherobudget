import { useState } from 'react';
import { Trash2, AlertTriangle, Download, Mail, Loader2 } from 'lucide-react';
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createBackup, downloadBackup } from '@/lib/dataBackup';
import { clearAllUserData } from '@/lib/dataClear';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'confirm' | 'email-sent' | 'verify';

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('confirm');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const confirmPhrase = 'DELETE';
  const canProceedToEmail = confirmChecked && confirmText === confirmPhrase;

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

  const handleSendCode = async () => {
    if (!user?.email) return;
    
    setIsSendingCode(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-deletion-code', {
        body: { email: user.email },
      });

      if (error) throw error;

      setStep('email-sent');
      toast({
        title: 'Code Sent',
        description: `A confirmation code has been sent to ${user.email}`,
      });
      
      // Auto-advance to verify step after brief delay
      setTimeout(() => setStep('verify'), 1500);
    } catch (error) {
      console.error('Error sending deletion code:', error);
      toast({
        title: 'Failed to Send Code',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyAndDelete = async () => {
    if (!user || verificationCode.length !== 6) return;
    
    setIsVerifying(true);
    try {
      // Verify the code first
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-deletion-code', {
        body: { code: verificationCode },
      });

      if (verifyError) throw verifyError;
      
      if (!verifyData?.verified) {
        toast({
          title: 'Invalid Code',
          description: 'The code you entered is incorrect.',
          variant: 'destructive',
        });
        return;
      }

      // Proceed with deletion
      setIsDeleting(true);

      // Clear all local data
      clearAllUserData(user.id);

      // Server-side hard delete: purges rows across all user-owned tables,
      // revokes linked bank items, and deletes the auth user.
      const { error: deleteError } = await supabase.functions.invoke('delete-account', {
        body: {},
      });

      if (deleteError) {
        throw new Error(deleteError.message || 'Failed to delete account.');
      }

      // Sign out the user
      await supabase.auth.signOut();

      toast({
        title: 'Account Deleted',
        description: 'Your account and all associated data have been permanently deleted.',
      });

      onOpenChange(false);
      
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error: any) {
      console.error('Error during deletion:', error);
      toast({
        title: 'Deletion Failed',
        description: error?.message || 'Failed to delete your account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setStep('confirm');
      setConfirmChecked(false);
      setConfirmText('');
      setVerificationCode('');
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
          
          {step === 'confirm' && (
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
          )}

          {step === 'email-sent' && (
            <AlertDialogDescription className="text-center py-4">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p>Sending confirmation code to</p>
              <p className="font-medium text-foreground">{user?.email}</p>
            </AlertDialogDescription>
          )}

          {step === 'verify' && (
            <AlertDialogDescription className="space-y-2">
              <p>Enter the 6-digit code sent to <strong>{user?.email}</strong> to confirm account deletion.</p>
              <p className="text-xs text-muted-foreground">The code expires in 10 minutes.</p>
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        {step === 'confirm' && (
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
        )}

        {step === 'verify' && (
          <div className="py-6 flex flex-col items-center gap-4">
            <InputOTP
              maxLength={6}
              value={verificationCode}
              onChange={setVerificationCode}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button
              variant="link"
              size="sm"
              onClick={handleSendCode}
              disabled={isSendingCode}
              className="text-muted-foreground"
            >
              {isSendingCode ? 'Sending...' : 'Resend code'}
            </Button>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting || isVerifying}>Cancel</AlertDialogCancel>
          
          {step === 'confirm' && (
            <Button
              variant="destructive"
              onClick={handleSendCode}
              disabled={!canProceedToEmail || isSendingCode}
            >
              {isSendingCode ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Confirmation Code
                </>
              )}
            </Button>
          )}

          {step === 'verify' && (
            <Button
              variant="destructive"
              onClick={handleVerifyAndDelete}
              disabled={verificationCode.length !== 6 || isVerifying || isDeleting}
            >
              {isVerifying || isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isDeleting ? 'Deleting...' : 'Verifying...'}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete My Account
                </>
              )}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
