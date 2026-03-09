import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { LinkedAccountMeta } from '@/lib/mockBankProvider';

interface DisconnectDialogProps {
  account: LinkedAccountMeta | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DisconnectDialog({ account, onClose, onConfirm }: DisconnectDialogProps) {
  return (
    <AlertDialog open={!!account} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect {account?.institutionName}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              This will remove <strong>{account?.maskedAccountName}</strong> from your device.
            </span>
            <span className="block">
              All locally stored data for this connection will be permanently deleted. No data was ever stored on our servers.
            </span>
            <span className="block">
              You can always re-link this account later.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-[44px]">Keep Connected</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="min-h-[44px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Disconnect
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
