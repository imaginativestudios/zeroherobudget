import { useState } from 'react';
import { Upload, Download, FileText, CreditCard, DollarSign, Target, Database, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DataImportWizard } from '@/components/import/DataImportWizard';
import { ImportType } from '@/lib/importUtils';

export default function DataManagement() {
  const [importWizardOpen, setImportWizardOpen] = useState(false);
  const [selectedImportType, setSelectedImportType] = useState<ImportType>('transactions');

  const openImportWizard = (type: ImportType) => {
    setSelectedImportType(type);
    setImportWizardOpen(true);
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

      {/* Privacy Notice */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-sm">Your Data Stays Local</p>
            <p className="text-sm text-muted-foreground">
              All your financial data is stored securely on your device. Nothing is sent to external servers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Upload className="h-5 w-5 text-primary" />
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
          <Download className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Export & Backup</h2>
          <Badge variant="secondary">Coming Soon</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Export your data as CSV files or create a complete JSON backup of all your financial information.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Export to CSV
              </CardTitle>
              <CardDescription>
                Export individual data types as CSV files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" disabled className="w-full">
                Export CSV
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4" />
                Full Backup
              </CardTitle>
              <CardDescription>
                Download all your data as a single JSON file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" disabled className="w-full">
                Create Backup
              </Button>
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
