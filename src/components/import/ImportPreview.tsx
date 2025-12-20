import { useMemo } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImportType, ParsedRow, ValidationResult, IMPORT_FIELD_CONFIGS, getImportTypeLabel } from '@/lib/importUtils';
import { formatCurrency } from '@/lib/constants';

interface ImportPreviewProps {
  importType: ImportType;
  parsedRows: ParsedRow[];
  validation: ValidationResult;
  skipDuplicates: boolean;
  onSkipDuplicatesChange: (skip: boolean) => void;
}

export function ImportPreview({
  importType,
  parsedRows,
  validation,
  skipDuplicates,
  onSkipDuplicatesChange,
}: ImportPreviewProps) {
  const fieldConfigs = IMPORT_FIELD_CONFIGS[importType];
  
  const stats = useMemo(() => {
    const validRows = parsedRows.filter(r => r.errors.length === 0);
    const duplicateRows = parsedRows.filter(r => r.isDuplicate);
    const errorRows = parsedRows.filter(r => r.errors.length > 0);
    const rowsToImport = skipDuplicates 
      ? validRows.filter(r => !r.isDuplicate)
      : validRows;

    return {
      total: parsedRows.length,
      valid: validRows.length,
      duplicates: duplicateRows.length,
      errors: errorRows.length,
      toImport: rowsToImport.length,
    };
  }, [parsedRows, skipDuplicates]);

  const displayRows = useMemo(() => {
    return parsedRows.slice(0, 50); // Show first 50 rows
  }, [parsedRows]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Review Import</h2>
        <p className="text-muted-foreground">
          Review the data before importing {getImportTypeLabel(importType).toLowerCase()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Rows" value={stats.total} />
        <StatCard label="Valid" value={stats.valid} variant="success" />
        <StatCard label="Duplicates" value={stats.duplicates} variant="warning" />
        <StatCard label="Errors" value={stats.errors} variant="error" />
      </div>

      {/* Validation Alerts */}
      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2">
              {validation.errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warnings</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2">
              {validation.warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Duplicate Handling */}
      {stats.duplicates > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="skip-duplicates"
                checked={skipDuplicates}
                onCheckedChange={(checked) => onSkipDuplicatesChange(!!checked)}
              />
              <label htmlFor="skip-duplicates" className="text-sm cursor-pointer">
                Skip {stats.duplicates} duplicate row(s) during import
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="font-medium">
              Ready to import {stats.toImport} {getImportTypeLabel(importType).toLowerCase()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Data Preview Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Data Preview
            {parsedRows.length > 50 && (
              <Badge variant="secondary">Showing first 50 of {parsedRows.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-muted-foreground w-12">Row</th>
                  <th className="text-left p-2 font-medium text-muted-foreground w-20">Status</th>
                  {fieldConfigs.slice(0, 4).map(field => (
                    <th key={field.name} className="text-left p-2 font-medium text-muted-foreground">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, i) => (
                  <tr 
                    key={i} 
                    className={`border-b border-muted ${
                      row.errors.length > 0 
                        ? 'bg-destructive/10' 
                        : row.isDuplicate 
                        ? 'bg-amber-500/10' 
                        : ''
                    }`}
                  >
                    <td className="p-2 text-muted-foreground">{row.rowNumber}</td>
                    <td className="p-2">
                      {row.errors.length > 0 ? (
                        <Badge variant="destructive" className="text-xs">Error</Badge>
                      ) : row.isDuplicate ? (
                        <Badge variant="secondary" className="text-xs">
                          <Copy className="h-3 w-3 mr-1" />
                          Duplicate
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs bg-green-500">OK</Badge>
                      )}
                    </td>
                    {fieldConfigs.slice(0, 4).map(field => (
                      <td key={field.name} className="p-2 truncate max-w-[150px]">
                        {field.type === 'number' && field.name !== 'apr'
                          ? formatCurrency(row.data[field.name] || 0)
                          : row.data[field.name] ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

function StatCard({ label, value, variant = 'default' }: StatCardProps) {
  const colorClasses = {
    default: 'text-foreground',
    success: 'text-green-500',
    warning: 'text-amber-500',
    error: 'text-destructive',
  };

  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className={`text-2xl font-bold ${colorClasses[variant]}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
