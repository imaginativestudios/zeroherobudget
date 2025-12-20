import { useState } from 'react';
import { Trash2, Download, AlertTriangle } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { clearDemoData } from '@/lib/demoData';
import { createBackup, downloadBackup } from '@/lib/dataBackup';

interface ClearDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearComplete: () => void;
  totalItems: number;
}

export function ClearDataDialog({ 
  open, 
  onOpenChange, 
  onClearComplete,
  totalItems 
}: ClearDataDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleCreateBackup = () => {
    if (!user) return;
    
    try {
      const backup = createBackup(user.id);
      downloadBackup(backup);
      toast({
        title: 'Backup Created',
        description: 'Your data has been backed up before clearing.',
      });
    } catch (error) {
      toast({
        title: 'Backup Failed',
        description: 'Failed to create backup.',
        variant: 'destructive',
      });
    }
  };

  const handleClearData = () => {
    if (!user || !confirmChecked) return;
    
    setIsClearing(true);
    
    try {
      clearDemoData(user.id);
      
      toast({
        title: 'Data Cleared',
        description: 'All your data has been permanently deleted.',
      });
      
      onClearComplete();
      onOpenChange(false);
      
      // Refresh the page to reset all state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast({
        title: 'Clear Failed',
        description: 'Failed to clear data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmChecked(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Clear All Data
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                This will permanently delete <strong>{totalItems} items</strong> including 
                all transactions, budget items, debts, subscriptions, and settings.
              </p>
              
              <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                <p className="text-sm font-medium text-foreground">Before you continue:</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={handleCreateBackup}
                  disabled={totalItems === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup First
                </Button>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox 
                  id="confirm-clear"
                  checked={confirmChecked}
                  onCheckedChange={(checked) => setConfirmChecked(checked === true)}
                />
                <Label 
                  htmlFor="confirm-clear" 
                  className="text-sm text-muted-foreground cursor-pointer leading-tight"
                >
                  I understand this action is irreversible and all my data will be permanently deleted
                </Label>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClearData}
            disabled={!confirmChecked || isClearing}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isClearing ? 'Clearing...' : 'Clear All Data'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
