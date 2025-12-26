import { useState } from 'react';
import { Trash2, Download, AlertTriangle, FileText, DollarSign, Target, CreditCard, Wallet, Settings } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { clearAllUserData, clearSelectiveData, ClearDataOptions } from '@/lib/dataClear';
import { createBackup, downloadBackup } from '@/lib/dataBackup';

interface DataStats {
  transactions: number;
  expenses: number;
  debts: number;
  subscriptions: number;
}

interface ClearDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearComplete: () => void;
  totalItems: number;
  dataStats?: DataStats;
}

type ClearMode = 'all' | 'selective';

export function ClearDataDialog({ 
  open, 
  onOpenChange, 
  onClearComplete,
  totalItems,
  dataStats = { transactions: 0, expenses: 0, debts: 0, subscriptions: 0 }
}: ClearDataDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearMode, setClearMode] = useState<ClearMode>('all');
  const [selectedTypes, setSelectedTypes] = useState<ClearDataOptions>({
    transactions: true,
    expenses: true,
    debts: true,
    subscriptions: true,
    accounts: false,
    settings: false,
  });

  const dataTypes = [
    { key: 'transactions' as const, label: 'Transactions', icon: FileText, count: dataStats.transactions },
    { key: 'expenses' as const, label: 'Budget Items', icon: DollarSign, count: dataStats.expenses },
    { key: 'debts' as const, label: 'Debts', icon: Target, count: dataStats.debts },
    { key: 'subscriptions' as const, label: 'Subscriptions', icon: CreditCard, count: dataStats.subscriptions },
    { key: 'accounts' as const, label: 'Accounts', icon: Wallet, count: null },
    { key: 'settings' as const, label: 'Settings & Achievements', icon: Settings, count: null },
  ];

  const selectedCount = clearMode === 'all' 
    ? totalItems 
    : Object.entries(selectedTypes)
        .filter(([key, selected]) => selected && dataStats[key as keyof DataStats])
        .reduce((sum, [key]) => sum + (dataStats[key as keyof DataStats] || 0), 0);

  const hasAnySelected = clearMode === 'all' || Object.values(selectedTypes).some(v => v);

  const handleCreateBackup = () => {
    if (!user) return;
    
    try {
      const backup = createBackup(user.id);
      downloadBackup(backup, user.id);
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
    if (!user || !confirmChecked || !hasAnySelected) return;
    
    setIsClearing(true);
    
    try {
      if (clearMode === 'all') {
        clearAllUserData(user.id);
        toast({
          title: 'Data Cleared',
          description: 'All your data has been permanently deleted.',
        });
      } else {
        clearSelectiveData(user.id, selectedTypes);
        const clearedTypes = Object.entries(selectedTypes)
          .filter(([_, selected]) => selected)
          .map(([key]) => dataTypes.find(t => t.key === key)?.label)
          .filter(Boolean)
          .join(', ');
        toast({
          title: 'Data Cleared',
          description: `Cleared: ${clearedTypes}`,
        });
      }
      
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
      setClearMode('all');
      setSelectedTypes({
        transactions: true,
        expenses: true,
        debts: true,
        subscriptions: true,
        accounts: false,
        settings: false,
      });
    }
    onOpenChange(newOpen);
  };

  const toggleType = (key: keyof ClearDataOptions) => {
    setSelectedTypes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Clear Data
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {/* Clear Mode Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium text-foreground">Clear Mode</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setClearMode('all')}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                      clearMode === 'all' 
                        ? 'bg-destructive text-destructive-foreground' 
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    All Data
                  </button>
                  <button
                    onClick={() => setClearMode('selective')}
                    className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                      clearMode === 'selective' 
                        ? 'bg-destructive text-destructive-foreground' 
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    Selective
                  </button>
                </div>
              </div>

              {clearMode === 'all' ? (
                <p>
                  This will permanently delete <strong>{totalItems} items</strong> including 
                  all transactions, budget items, debts, subscriptions, and settings.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm">Select which data types to clear:</p>
                  <div className="space-y-2">
                    {dataTypes.map(({ key, label, icon: Icon, count }) => (
                      <div 
                        key={key}
                        className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                          selectedTypes[key] 
                            ? 'border-destructive/50 bg-destructive/5' 
                            : 'border-border bg-background'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{label}</span>
                          {count !== null && (
                            <span className="text-xs text-muted-foreground">({count})</span>
                          )}
                        </div>
                        <Switch
                          checked={selectedTypes[key] || false}
                          onCheckedChange={() => toggleType(key)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Separator />
              
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
                  I understand this action is irreversible and the selected data will be permanently deleted
                </Label>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClearData}
            disabled={!confirmChecked || isClearing || !hasAnySelected}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isClearing ? 'Clearing...' : clearMode === 'all' ? 'Clear All Data' : `Clear Selected`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
