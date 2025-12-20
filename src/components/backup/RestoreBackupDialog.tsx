import { useState, useCallback } from 'react';
import { Upload, FileJson, AlertTriangle, Check, X, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  BackupData,
  parseBackupFile,
  restoreFromBackup,
  formatFileSize,
} from '@/lib/dataBackup';

interface RestoreBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestoreComplete: () => void;
}

export function RestoreBackupDialog({ open, onOpenChange, onRestoreComplete }: RestoreBackupDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'upload' | 'configure' | 'complete'>('upload');
  const [backup, setBackup] = useState<BackupData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  
  const [replaceMode, setReplaceMode] = useState<'replace' | 'merge'>('replace');
  const [restoreOptions, setRestoreOptions] = useState({
    transactions: true,
    expenses: true,
    debts: true,
    subscriptions: true,
    accounts: true,
    settings: true,
  });
  
  const [restoredCounts, setRestoredCounts] = useState<Record<string, number>>({});

  const resetDialog = useCallback(() => {
    setStep('upload');
    setBackup(null);
    setError(null);
    setIsRestoring(false);
    setReplaceMode('replace');
    setRestoreOptions({
      transactions: true,
      expenses: true,
      debts: true,
      subscriptions: true,
      accounts: true,
      settings: true,
    });
    setRestoredCounts({});
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(resetDialog, 300);
  }, [onOpenChange, resetDialog]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError(null);
    const result = await parseBackupFile(file);
    
    if (result.error) {
      setError(result.error);
      return;
    }
    
    setBackup(result.backup);
    setStep('configure');
  }, []);

  const handleRestore = useCallback(async () => {
    if (!backup || !user) return;
    
    setIsRestoring(true);
    
    // Small delay for UX
    await new Promise(r => setTimeout(r, 500));
    
    const result = restoreFromBackup(user.id, backup, {
      replaceExisting: replaceMode === 'replace',
      restoreTransactions: restoreOptions.transactions,
      restoreExpenses: restoreOptions.expenses,
      restoreDebts: restoreOptions.debts,
      restoreSubscriptions: restoreOptions.subscriptions,
      restoreAccounts: restoreOptions.accounts,
      restoreSettings: restoreOptions.settings,
    });
    
    setIsRestoring(false);
    
    if (result.success) {
      setRestoredCounts(result.counts || {});
      setStep('complete');
      toast({
        title: 'Backup Restored',
        description: 'Your data has been restored successfully. Refresh the page to see changes.',
      });
    } else {
      setError(result.message);
    }
  }, [backup, user, replaceMode, restoreOptions, toast]);

  const toggleOption = (key: keyof typeof restoreOptions) => {
    setRestoreOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Restore from Backup</DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload a backup file to restore your data'}
            {step === 'configure' && 'Configure what to restore from the backup'}
            {step === 'complete' && 'Restoration complete'}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4 py-4">
            <Card
              className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer"
            >
              <CardContent className="flex flex-col items-center justify-center py-8">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="backup-upload"
                />
                <label htmlFor="backup-upload" className="cursor-pointer text-center">
                  <FileJson className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">Select Backup File</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a .json backup file
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                </label>
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 'configure' && backup && (
          <div className="space-y-4 py-4">
            {/* Backup Info */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Backup Date</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(backup.exportedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{backup.metadata.transactionCount} transactions</Badge>
                  <Badge variant="secondary">{backup.metadata.expenseCount} expenses</Badge>
                  <Badge variant="secondary">{backup.metadata.debtCount} debts</Badge>
                  <Badge variant="secondary">{backup.metadata.subscriptionCount} subscriptions</Badge>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Restore Mode */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Restore Mode</Label>
              <RadioGroup value={replaceMode} onValueChange={(v) => setReplaceMode(v as 'replace' | 'merge')}>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="replace" id="replace" className="mt-1" />
                  <Label htmlFor="replace" className="font-normal cursor-pointer">
                    <span className="font-medium">Replace existing data</span>
                    <p className="text-xs text-muted-foreground">Delete current data and restore from backup</p>
                  </Label>
                </div>
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="merge" id="merge" className="mt-1" />
                  <Label htmlFor="merge" className="font-normal cursor-pointer">
                    <span className="font-medium">Merge with existing</span>
                    <p className="text-xs text-muted-foreground">Add backup data to current data (may create duplicates)</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Data Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Data to Restore</Label>
              <div className="space-y-2">
                {[
                  { key: 'transactions', label: 'Transactions', count: backup.metadata.transactionCount },
                  { key: 'expenses', label: 'Budget Items', count: backup.metadata.expenseCount },
                  { key: 'debts', label: 'Debts', count: backup.metadata.debtCount },
                  { key: 'subscriptions', label: 'Subscriptions', count: backup.metadata.subscriptionCount },
                  { key: 'accounts', label: 'Accounts', count: backup.metadata.accountCount },
                  { key: 'settings', label: 'Settings (income, strategy, assets)', count: null },
                ].map(({ key, label, count }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={key}
                        checked={restoreOptions[key as keyof typeof restoreOptions]}
                        onCheckedChange={() => toggleOption(key as keyof typeof restoreOptions)}
                      />
                      <Label htmlFor={key} className="text-sm cursor-pointer">{label}</Label>
                    </div>
                    {count !== null && <Badge variant="outline" className="text-xs">{count}</Badge>}
                  </div>
                ))}
              </div>
            </div>

            {replaceMode === 'replace' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This will permanently replace your current data with the backup.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 'complete' && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Restore Complete!</h3>
            <p className="text-muted-foreground mb-4">
              Your data has been restored successfully.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {restoredCounts.transactions > 0 && (
                <Badge>{restoredCounts.transactions} transactions</Badge>
              )}
              {restoredCounts.expenses > 0 && (
                <Badge>{restoredCounts.expenses} expenses</Badge>
              )}
              {restoredCounts.debts > 0 && (
                <Badge>{restoredCounts.debts} debts</Badge>
              )}
              {restoredCounts.subscriptions > 0 && (
                <Badge>{restoredCounts.subscriptions} subscriptions</Badge>
              )}
            </div>
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh to See Changes
            </Button>
          </div>
        )}

        {step !== 'complete' && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {step === 'configure' && (
              <Button onClick={handleRestore} disabled={isRestoring}>
                {isRestoring ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Restore Data
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
