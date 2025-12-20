import { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImportStepIndicator } from './ImportStepIndicator';
import { ImportFileUpload } from './ImportFileUpload';
import { ImportColumnMapping } from './ImportColumnMapping';
import { ImportPreview } from './ImportPreview';
import {
  ImportType,
  parseCSVFile,
  autoMapColumns,
  applyMapping,
  detectDuplicates,
  validateImport,
  getImportTypeLabel,
  ParsedRow,
  ValidationResult,
  IMPORT_FIELD_CONFIGS,
} from '@/lib/importUtils';
import { useLocalTransactions } from '@/hooks/useLocalTransactions';
import { useLocalExpenses } from '@/hooks/useLocalExpenses';
import { useLocalDebts } from '@/hooks/useLocalDebts';
import { useToast } from '@/hooks/use-toast';

interface DataImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importType: ImportType;
}

const STEPS = [
  { id: 1, name: 'Upload' },
  { id: 2, name: 'Map Columns' },
  { id: 3, name: 'Preview' },
  { id: 4, name: 'Complete' },
];

export function DataImportWizard({ open, onOpenChange, importType }: DataImportWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importedCount, setImportedCount] = useState(0);
  
  const { toast } = useToast();
  const { transactions, addTransaction } = useLocalTransactions();
  const { expenses, addExpense } = useLocalExpenses();
  const { debts, setDebts } = useLocalDebts();

  const existingData = useMemo(() => {
    switch (importType) {
      case 'transactions': return transactions;
      case 'expenses': return expenses;
      case 'debts': return debts;
    }
  }, [importType, transactions, expenses, debts]);

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setHeaders([]);
    setRows([]);
    setMapping({});
    setParsedRows([]);
    setValidation(null);
    setSkipDuplicates(true);
    setImportedCount(0);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(resetWizard, 300);
  }, [onOpenChange, resetWizard]);

  const handleFileSelect = useCallback((file: File, content: string) => {
    const { headers: parsedHeaders, rows: parsedRows } = parseCSVFile(content);
    setHeaders(parsedHeaders);
    setRows(parsedRows);
    
    // Auto-map columns
    const autoMapping = autoMapColumns(parsedHeaders, importType);
    setMapping(autoMapping);
    
    setCurrentStep(2);
  }, [importType]);

  const handleMappingChange = useCallback((field: string, column: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: column || undefined,
    }));
  }, []);

  const handlePreview = useCallback(() => {
    const mapped = applyMapping(rows, headers, mapping, importType);
    const withDuplicates = detectDuplicates(mapped, existingData, importType);
    const validationResult = validateImport(withDuplicates);
    
    setParsedRows(withDuplicates);
    setValidation(validationResult);
    setCurrentStep(3);
  }, [rows, headers, mapping, importType, existingData]);

  const handleImport = useCallback(() => {
    const rowsToImport = parsedRows.filter(row => {
      if (row.errors.length > 0) return false;
      if (skipDuplicates && row.isDuplicate) return false;
      return true;
    });

    try {
      if (importType === 'transactions') {
        rowsToImport.forEach(row => {
          addTransaction({
            date: row.data.date,
            description: row.data.description || 'Imported',
            amount: row.data.amount || 0,
            category: row.data.category || 'Imported',
            account_id: null,
            flow: row.data.flow || 'out',
            notes: row.data.notes || '',
          });
        });
      } else if (importType === 'expenses') {
        rowsToImport.forEach(row => {
          addExpense({
            name: row.data.name || 'Imported',
            amount: row.data.amount || 0,
            category: row.data.category || 'Uncategorized',
            is_income: false,
          });
        });
      } else if (importType === 'debts') {
        const newDebts = rowsToImport.map(row => ({
          id: crypto.randomUUID(),
          name: row.data.name || 'Imported Debt',
          balance: row.data.balance || 0,
          interest_rate: row.data.apr || 0,
          minimum_payment: row.data.min || 0,
          type: row.data.type || 'loan',
          user_id: 'demo-user',
          household_id: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        setDebts([...debts, ...newDebts]);
      }

      setImportedCount(rowsToImport.length);
      setCurrentStep(4);
      
      toast({
        title: 'Import Successful',
        description: `Imported ${rowsToImport.length} ${getImportTypeLabel(importType).toLowerCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Import Failed',
        description: 'An error occurred during import. Please try again.',
        variant: 'destructive',
      });
    }
  }, [parsedRows, skipDuplicates, importType, addTransaction, addExpense, debts, setDebts, toast]);

  const canProceed = useMemo(() => {
    if (currentStep === 1) return false; // Handled by file upload
    if (currentStep === 2) {
      const requiredFields = IMPORT_FIELD_CONFIGS[importType].filter(f => f.required);
      return requiredFields.every(f => mapping[f.name]);
    }
    if (currentStep === 3) {
      return validation?.isValid && parsedRows.some(r => r.errors.length === 0);
    }
    return false;
  }, [currentStep, importType, mapping, validation, parsedRows]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import {getImportTypeLabel(importType)}</DialogTitle>
        </DialogHeader>

        <ImportStepIndicator steps={STEPS} currentStep={currentStep} />

        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <ImportFileUpload
              importType={importType}
              onFileSelect={handleFileSelect}
            />
          )}

          {currentStep === 2 && (
            <ImportColumnMapping
              importType={importType}
              headers={headers}
              mapping={mapping}
              onMappingChange={handleMappingChange}
              sampleData={rows.slice(0, 5)}
            />
          )}

          {currentStep === 3 && validation && (
            <ImportPreview
              importType={importType}
              parsedRows={parsedRows}
              validation={validation}
              skipDuplicates={skipDuplicates}
              onSkipDuplicatesChange={setSkipDuplicates}
            />
          )}

          {currentStep === 4 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Import Complete!</h2>
              <p className="text-muted-foreground mb-6">
                Successfully imported {importedCount} {getImportTypeLabel(importType).toLowerCase()}
              </p>
              <Button onClick={handleClose}>
                Close
              </Button>
            </div>
          )}
        </div>

        {currentStep < 4 && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : handleClose()}
            >
              {currentStep === 1 ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </>
              )}
            </Button>

            {currentStep > 1 && (
              <Button
                onClick={currentStep === 3 ? handleImport : handlePreview}
                disabled={!canProceed}
              >
                {currentStep === 3 ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Import Data
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
