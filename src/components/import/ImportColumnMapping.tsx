import { useMemo } from 'react';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ImportType, IMPORT_FIELD_CONFIGS, ImportFieldConfig } from '@/lib/importUtils';

interface ImportColumnMappingProps {
  importType: ImportType;
  headers: string[];
  mapping: Record<string, string>;
  onMappingChange: (field: string, column: string) => void;
  sampleData: string[][];
}

export function ImportColumnMapping({
  importType,
  headers,
  mapping,
  onMappingChange,
  sampleData,
}: ImportColumnMappingProps) {
  const fieldConfigs = IMPORT_FIELD_CONFIGS[importType];

  const mappingStatus = useMemo(() => {
    const requiredFields = fieldConfigs.filter(f => f.required);
    const mappedRequired = requiredFields.filter(f => mapping[f.name]);
    return {
      total: requiredFields.length,
      mapped: mappedRequired.length,
      complete: mappedRequired.length === requiredFields.length,
    };
  }, [fieldConfigs, mapping]);

  const getSampleValue = (header: string): string => {
    const colIndex = headers.indexOf(header);
    if (colIndex < 0 || sampleData.length === 0) return '';
    const values = sampleData.slice(0, 3).map(row => row[colIndex]).filter(Boolean);
    return values.join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Map Your Columns</h2>
        <p className="text-muted-foreground">
          Match your CSV columns to the required fields
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          {mappingStatus.complete ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              All required fields mapped
            </Badge>
          ) : (
            <Badge variant="secondary">
              {mappingStatus.mapped} of {mappingStatus.total} required fields mapped
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {fieldConfigs.map((field) => (
          <FieldMappingRow
            key={field.name}
            field={field}
            headers={headers}
            selectedColumn={mapping[field.name] || ''}
            onSelect={(column) => onMappingChange(field.name, column)}
            sampleValue={mapping[field.name] ? getSampleValue(mapping[field.name]) : ''}
          />
        ))}
      </div>

      {sampleData.length > 0 && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Preview: First 3 rows from your file</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    {headers.map((h, i) => (
                      <th key={i} className="text-left p-2 font-medium text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sampleData.slice(0, 3).map((row, i) => (
                    <tr key={i} className="border-b border-muted">
                      {row.map((cell, j) => (
                        <td key={j} className="p-2 truncate max-w-[150px]">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface FieldMappingRowProps {
  field: ImportFieldConfig;
  headers: string[];
  selectedColumn: string;
  onSelect: (column: string) => void;
  sampleValue: string;
}

function FieldMappingRow({ field, headers, selectedColumn, onSelect, sampleValue }: FieldMappingRowProps) {
  const isMapped = !!selectedColumn;

  return (
    <Card className={`transition-colors ${isMapped ? 'border-green-500/50' : field.required ? 'border-amber-500/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{field.label}</span>
              {field.required && (
                <Badge variant="outline" className="text-xs">Required</Badge>
              )}
              {isMapped ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : field.required ? (
                <XCircle className="h-4 w-4 text-amber-500" />
              ) : null}
            </div>
            {field.examples && (
              <p className="text-xs text-muted-foreground mt-1">
                e.g., {field.examples.slice(0, 2).join(', ')}
              </p>
            )}
          </div>

          <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />

          <div className="flex-1 min-w-0">
            <Select value={selectedColumn} onValueChange={onSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select column..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Not mapped --</SelectItem>
                {headers.map((header) => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sampleValue && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                Sample: {sampleValue}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
