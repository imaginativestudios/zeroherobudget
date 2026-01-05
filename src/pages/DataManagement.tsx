import { useState, useMemo, useEffect } from 'react';
import { Upload, Download, FileText, CreditCard, DollarSign, Target, Database, Shield, FileJson, Trash2, Clock, AlertTriangle, UserX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { InlineAlert } from '@/components/ui/inline-alert';
import { DataImportWizard } from '@/components/import/DataImportWizard';
import { RestoreBackupDialog } from '@/components/backup/RestoreBackupDialog';
import { ClearDataDialog } from '@/components/backup/ClearDataDialog';
import { DeleteAccountDialog } from '@/components/backup/DeleteAccountDialog';
import { ImportType } from '@/lib/importUtils';
import { createBackup, downloadBackup, getLastBackupTimestamp } from '@/lib/dataBackup';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { toCsv, downloadCsv } from '@/lib/csvUtils';
import { useLocalTransactions } from '@/hooks/useLocalTransactions';
import { useLocalExpenses } from '@/hooks/useLocalExpenses';
import { useLocalDebts } from '@/hooks/useLocalDebts';
import { useLocalSubscriptions } from '@/hooks/useLocalSubscriptions';
import { formatDistanceToNow, differenceInDays } from 'date-fns';

export default function DataManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [importWizardOpen, setImportWizardOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [selectedImportType, setSelectedImportType] = useState<ImportType>('transactions');
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  // Load last backup timestamp
  useEffect(() => {
    if (user) {
      setLastBackup(getLastBackupTimestamp(user.id));
    }
  }, [user]);

  // Load data for stats and CSV export
  const { transactions } = useLocalTransactions();
  const { expenses } = useLocalExpenses();
  const { debts } = useLocalDebts();
  const { subscriptions } = useLocalSubscriptions();

  const dataStats = useMemo(() => ({
    transactions: transactions.length,
    expenses: expenses.length,
    debts: debts.length,
    subscriptions: subscriptions.length,
  }), [transactions, expenses, debts, subscriptions]);

  const totalItems = dataStats.transactions + dataStats.expenses + dataStats.debts + dataStats.subscriptions;

  const openImportWizard = (type: ImportType) => {
    setSelectedImportType(type);
    setImportWizardOpen(true);
  };

  const handleCreateBackup = () => {
    if (!user) {
      toast({
        title: 'Not Logged In',
        description: 'Please log in to create a backup.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const backup = createBackup(user.id);
      downloadBackup(backup, user.id);
      setLastBackup(new Date().toISOString());
      toast({
        title: 'Backup Created',
        description: `Downloaded backup with ${totalItems} items.`,
      });
    } catch (error) {
      toast({
        title: 'Backup Failed',
        description: 'Failed to create backup. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = (type: 'transactions' | 'expenses' | 'debts' | 'subscriptions') => {
    try {
      let rows: string[][] = [];
      let filename = '';

      switch (type) {
        case 'transactions':
          rows = [
            ['date', 'description', 'amount', 'category', 'flow', 'notes'],
            ...transactions.map(t => [
              t.date,
              t.description,
              t.amount.toString(),
              t.category,
              t.flow,
              t.notes || '',
            ]),
          ];
          filename = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'expenses':
          rows = [
            ['name', 'amount', 'category', 'is_income'],
            ...expenses.map(e => [
              e.name,
              e.amount.toString(),
              e.category || '',
              e.is_income ? 'true' : 'false',
            ]),
          ];
          filename = `budget-items-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'debts':
          rows = [
            ['name', 'balance', 'apr', 'minimum_payment', 'type'],
            ...debts.map(d => [
              d.name,
              d.balance.toString(),
              d.interest_rate.toString(),
              d.minimum_payment.toString(),
              d.type,
            ]),
          ];
          filename = `debts-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'subscriptions':
          rows = [
            ['name', 'amount', 'billing_cycle', 'category', 'next_billing_date', 'is_active'],
            ...subscriptions.map(s => [
              s.name,
              s.amount.toString(),
              s.billing_cycle,
              s.category || '',
              s.next_billing_date || '',
              s.is_active ? 'true' : 'false',
            ]),
          ];
          filename = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
          break;
      }

      downloadCsv(filename, toCsv(rows));
      toast({
        title: 'Export Complete',
        description: `Downloaded ${filename}`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pt-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Data Management</h1>
        <p className="text-muted-foreground mt-2">
          Import, export, and manage your financial data
        </p>
      </div>

      {/* Privacy Promise Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold">Privacy-First by Design</h3>
              <p className="text-muted-foreground">
                Your financial data never leaves your device. We don't have servers storing your information, 
                and we can't see your transactions, debts, or budget. This means you're in complete control.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" /> No cloud storage
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" /> No tracking
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" /> Works offline
                </Badge>
              </div>
              <a 
                href="/data-privacy" 
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
              >
                Learn more about how your data is protected →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-5 w-5" aria-hidden="true" />
            Your Data Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">{dataStats.transactions}</p>
              <p className="text-xs text-muted-foreground">Transactions</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">{dataStats.expenses}</p>
              <p className="text-xs text-muted-foreground">Budget Items</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">{dataStats.debts}</p>
              <p className="text-xs text-muted-foreground">Debts</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-2xl font-bold">{dataStats.subscriptions}</p>
              <p className="text-xs text-muted-foreground">Subscriptions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Upload className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Import Data</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Import your financial data from CSV files. Our wizard will help you map columns and validate data.
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <ImportCard
            icon={FileText}
            title="Transactions"
            description="Import bank statements and transaction history"
            onClick={() => openImportWizard('transactions')}
          />
          <ImportCard
            icon={DollarSign}
            title="Budget Items"
            description="Import your planned expenses and budget categories"
            onClick={() => openImportWizard('expenses')}
          />
          <ImportCard
            icon={Target}
            title="Debts"
            description="Import loans, credit cards, and other debts"
            onClick={() => openImportWizard('debts')}
          />
        </div>
      </div>

      <Separator />

      {/* Export Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Export Data</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Export your data as CSV files for use in spreadsheets or other applications.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ExportCard
            title="Transactions"
            count={dataStats.transactions}
            onClick={() => handleExportCSV('transactions')}
            disabled={dataStats.transactions === 0}
          />
          <ExportCard
            title="Budget Items"
            count={dataStats.expenses}
            onClick={() => handleExportCSV('expenses')}
            disabled={dataStats.expenses === 0}
          />
          <ExportCard
            title="Debts"
            count={dataStats.debts}
            onClick={() => handleExportCSV('debts')}
            disabled={dataStats.debts === 0}
          />
          <ExportCard
            title="Subscriptions"
            count={dataStats.subscriptions}
            onClick={() => handleExportCSV('subscriptions')}
            disabled={dataStats.subscriptions === 0}
          />
        </div>
      </div>

      <Separator />

      {/* Backup Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FileJson className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Backup & Restore</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Create a complete backup of all your data or restore from a previous backup.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-5 w-5" aria-hidden="true" />
                Create Backup
              </CardTitle>
              <CardDescription>
                Download all your data as a single JSON file
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const isStale = lastBackup && differenceInDays(new Date(), new Date(lastBackup)) >= 7;
                const needsBackup = !lastBackup && totalItems > 0;
                
                return (
                  <>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {totalItems} total items
                      </Badge>
                      {lastBackup ? (
                        <Badge 
                          variant={isStale ? "destructive" : "outline"} 
                          className={`text-xs flex items-center gap-1 ${isStale ? '' : ''}`}
                        >
                          {isStale && <AlertTriangle className="h-3 w-3" />}
                          <Clock className="h-3 w-3" />
                          {isStale ? 'Backup overdue: ' : 'Last backup: '}
                          {formatDistanceToNow(new Date(lastBackup), { addSuffix: true })}
                        </Badge>
                      ) : (
                        <Badge variant={needsBackup ? "destructive" : "outline"} className="text-xs flex items-center gap-1">
                          {needsBackup && <AlertTriangle className="h-3 w-3" />}
                          No backups yet
                        </Badge>
                      )}
                    </div>
                    {(isStale || needsBackup) && (
                      <InlineAlert variant="destructive" className="mb-3">
                        {needsBackup 
                          ? "You have data but no backup. Create one to protect your data."
                          : "Your backup is over 7 days old. Consider creating a fresh backup."}
                      </InlineAlert>
                    )}
                    <Button onClick={handleCreateBackup} className="w-full" disabled={totalItems === 0}>
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Download Backup
                    </Button>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-5 w-5" aria-hidden="true" />
                Restore Backup
              </CardTitle>
              <CardDescription>
                Restore your data from a backup file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InlineAlert className="mb-3">
                Restoring may overwrite existing data
              </InlineAlert>
              <Button variant="outline" onClick={() => setRestoreDialogOpen(true)} className="w-full">
                <Upload className="h-4 w-4" aria-hidden="true" />
                Restore from Backup
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Danger Zone */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Trash2 className="h-5 w-5 text-destructive" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Permanently delete your data or account. These actions cannot be undone.
        </p>

        <div className="space-y-3">
          <Card className="border-destructive/30">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">Clear All Data</p>
                  <p className="text-xs text-muted-foreground">
                    Delete all transactions, budget items, debts, and subscriptions
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setClearDialogOpen(true)}
                  disabled={totalItems === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">Delete Account</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setDeleteAccountDialogOpen(true)}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Import Wizard Modal */}
      <DataImportWizard
        open={importWizardOpen}
        onOpenChange={setImportWizardOpen}
        importType={selectedImportType}
      />

      {/* Restore Dialog */}
      <RestoreBackupDialog
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}
        onRestoreComplete={() => {}}
      />

      {/* Clear Data Dialog */}
      <ClearDataDialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        onClearComplete={() => {}}
        totalItems={totalItems}
        dataStats={dataStats}
      />

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={deleteAccountDialogOpen}
        onOpenChange={setDeleteAccountDialogOpen}
      />
    </div>
  );
}

interface ImportCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}

function ImportCard({ icon: Icon, title, description, onClick }: ImportCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={onClick}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <CardDescription className="text-xs">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </CardContent>
    </Card>
  );
}

interface ExportCardProps {
  title: string;
  count: number;
  onClick: () => void;
  disabled: boolean;
}

function ExportCard({ title, count, onClick, disabled }: ExportCardProps) {
  return (
    <Card className={disabled ? 'opacity-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{title}</span>
          <Badge variant="outline" className="text-xs">{count}</Badge>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={onClick} disabled={disabled}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </CardContent>
    </Card>
  );
}
