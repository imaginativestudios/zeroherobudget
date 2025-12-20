import { parseCsv, sanitizeTextInput } from './csvUtils';

export type ImportType = 'transactions' | 'expenses' | 'debts';

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  required: boolean;
}

export interface ImportFieldConfig {
  name: string;
  label: string;
  required: boolean;
  type: 'string' | 'number' | 'date';
  examples?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  duplicateCount: number;
}

export interface ParsedRow {
  data: Record<string, any>;
  rowNumber: number;
  errors: string[];
  isDuplicate: boolean;
}

// Field configurations for each import type
export const IMPORT_FIELD_CONFIGS: Record<ImportType, ImportFieldConfig[]> = {
  transactions: [
    { name: 'date', label: 'Date', required: true, type: 'date', examples: ['2024-01-15', '01/15/2024', 'Jan 15, 2024'] },
    { name: 'description', label: 'Description', required: true, type: 'string', examples: ['Amazon Purchase', 'Grocery Store'] },
    { name: 'amount', label: 'Amount', required: true, type: 'number', examples: ['50.00', '-25.50', '$100'] },
    { name: 'category', label: 'Category', required: false, type: 'string', examples: ['Shopping', 'Groceries', 'Bills'] },
    { name: 'account', label: 'Account', required: false, type: 'string', examples: ['Checking', 'Credit Card'] },
    { name: 'notes', label: 'Notes', required: false, type: 'string', examples: ['Birthday gift', 'Monthly subscription'] },
  ],
  expenses: [
    { name: 'name', label: 'Name', required: true, type: 'string', examples: ['Rent', 'Utilities', 'Groceries'] },
    { name: 'amount', label: 'Planned Amount', required: true, type: 'number', examples: ['1500', '200.00', '$50'] },
    { name: 'category', label: 'Category', required: false, type: 'string', examples: ['Housing', 'Food', 'Transportation'] },
  ],
  debts: [
    { name: 'name', label: 'Name', required: true, type: 'string', examples: ['Credit Card', 'Student Loan', 'Car Loan'] },
    { name: 'balance', label: 'Balance', required: true, type: 'number', examples: ['5000', '25000.50', '$1500'] },
    { name: 'apr', label: 'APR (%)', required: true, type: 'number', examples: ['18.99', '5.5', '0'] },
    { name: 'min', label: 'Minimum Payment', required: true, type: 'number', examples: ['100', '250.00', '$50'] },
    { name: 'type', label: 'Type', required: false, type: 'string', examples: ['card', 'loan', 'mortgage'] },
  ],
};

// Common column name variations for auto-mapping
const COLUMN_ALIASES: Record<string, string[]> = {
  date: ['date', 'transaction date', 'post date', 'posted date', 'trans date', 'payment date'],
  description: ['description', 'memo', 'reference', 'transaction description', 'details', 'payee', 'merchant'],
  amount: ['amount', 'transaction amount', 'value', 'sum', 'total', 'debit', 'credit', 'payment'],
  category: ['category', 'type', 'transaction category', 'classification', 'group'],
  account: ['account', 'account name', 'bank', 'source'],
  notes: ['notes', 'note', 'comments', 'comment', 'remarks'],
  name: ['name', 'title', 'label', 'expense name', 'debt name', 'item'],
  balance: ['balance', 'amount owed', 'principal', 'remaining', 'current balance'],
  apr: ['apr', 'interest rate', 'rate', 'interest', 'annual rate'],
  min: ['min', 'minimum', 'minimum payment', 'min payment', 'monthly payment'],
  type: ['type', 'category', 'kind', 'debt type'],
};

export function parseCSVFile(text: string): { headers: string[]; rows: string[][] } {
  const parsed = parseCsv(text);
  if (parsed.length === 0) return { headers: [], rows: [] };
  
  const headers = parsed[0].map(h => h.trim());
  const rows = parsed.slice(1).filter(row => row.some(cell => cell.trim() !== ''));
  
  return { headers, rows };
}

export function autoMapColumns(headers: string[], importType: ImportType): Record<string, string> {
  const fieldConfigs = IMPORT_FIELD_CONFIGS[importType];
  const mapping: Record<string, string> = {};
  
  for (const field of fieldConfigs) {
    const aliases = COLUMN_ALIASES[field.name] || [field.name];
    
    for (const header of headers) {
      const normalizedHeader = header.toLowerCase().trim();
      if (aliases.some(alias => normalizedHeader === alias || normalizedHeader.includes(alias))) {
        mapping[field.name] = header;
        break;
      }
    }
  }
  
  return mapping;
}

export function parseValue(value: string, type: 'string' | 'number' | 'date'): any {
  const trimmed = value.trim();
  
  if (type === 'number') {
    // Remove currency symbols and commas
    const cleaned = trimmed.replace(/[$,]/g, '').replace(/\((.+)\)/, '-$1');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.abs(parsed);
  }
  
  if (type === 'date') {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    // Try common formats
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{1,2})-(\d{1,2})-(\d{4})/, // MM-DD-YYYY
    ];
    for (const fmt of formats) {
      const match = trimmed.match(fmt);
      if (match) {
        const [, m, d, y] = match;
        const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    return new Date().toISOString().split('T')[0];
  }
  
  return sanitizeTextInput(trimmed);
}

export function applyMapping(
  rows: string[][],
  headers: string[],
  mapping: Record<string, string>,
  importType: ImportType
): ParsedRow[] {
  const fieldConfigs = IMPORT_FIELD_CONFIGS[importType];
  
  return rows.map((row, index) => {
    const data: Record<string, any> = {};
    const errors: string[] = [];
    
    for (const field of fieldConfigs) {
      const sourceColumn = mapping[field.name];
      if (sourceColumn) {
        const columnIndex = headers.indexOf(sourceColumn);
        if (columnIndex >= 0 && columnIndex < row.length) {
          data[field.name] = parseValue(row[columnIndex], field.type);
        }
      }
      
      // Check required fields
      if (field.required && (!data[field.name] || data[field.name] === '' || data[field.name] === 0)) {
        errors.push(`Missing required field: ${field.label}`);
      }
    }
    
    // Handle transaction flow detection
    if (importType === 'transactions') {
      const amountCol = mapping['amount'];
      if (amountCol) {
        const colIndex = headers.indexOf(amountCol);
        const rawAmount = row[colIndex] || '';
        const isNegative = rawAmount.includes('-') || rawAmount.includes('(');
        data.flow = isNegative ? 'out' : 'in';
      } else {
        data.flow = 'out';
      }
    }
    
    return {
      data,
      rowNumber: index + 2, // +2 for 1-based indexing and header row
      errors,
      isDuplicate: false,
    };
  });
}

export function detectDuplicates(
  parsedRows: ParsedRow[],
  existingData: any[],
  importType: ImportType
): ParsedRow[] {
  return parsedRows.map(row => {
    let isDuplicate = false;
    
    if (importType === 'transactions') {
      isDuplicate = existingData.some(existing => 
        existing.date === row.data.date &&
        existing.description === row.data.description &&
        Math.abs(existing.amount - row.data.amount) < 0.01
      );
    } else if (importType === 'expenses') {
      isDuplicate = existingData.some(existing =>
        existing.name?.toLowerCase() === row.data.name?.toLowerCase()
      );
    } else if (importType === 'debts') {
      isDuplicate = existingData.some(existing =>
        existing.name?.toLowerCase() === row.data.name?.toLowerCase()
      );
    }
    
    return { ...row, isDuplicate };
  });
}

export function validateImport(parsedRows: ParsedRow[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let duplicateCount = 0;
  
  const rowsWithErrors = parsedRows.filter(r => r.errors.length > 0);
  if (rowsWithErrors.length > 0) {
    errors.push(`${rowsWithErrors.length} row(s) have validation errors`);
  }
  
  for (const row of parsedRows) {
    if (row.isDuplicate) {
      duplicateCount++;
    }
  }
  
  if (duplicateCount > 0) {
    warnings.push(`${duplicateCount} potential duplicate(s) detected`);
  }
  
  const validRows = parsedRows.filter(r => r.errors.length === 0);
  if (validRows.length === 0) {
    errors.push('No valid rows to import');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    duplicateCount,
  };
}

export function getImportTypeLabel(type: ImportType): string {
  switch (type) {
    case 'transactions': return 'Transactions';
    case 'expenses': return 'Budget Items';
    case 'debts': return 'Debts';
  }
}
