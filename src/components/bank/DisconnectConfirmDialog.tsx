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

interface DisconnectConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  institutionName: string;
  accountCount: number;
}

export const DisconnectConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  institutionName,
  accountCount,
}: DisconnectConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect {institutionName}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              This will disconnect {accountCount} account{accountCount !== 1 ? 's' : ''} from {institutionName}.
            </p>
            <div className="text-sm space-y-2">
              <p className="font-medium text-foreground">What will happen:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Your existing transaction history will be preserved</li>
                <li>New transactions will no longer sync automatically</li>
                <li>You can reconnect this bank at any time</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Disconnect
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
