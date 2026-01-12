/**
 * Zero Hero Connector - Import Handler
 * 
 * Handles clipboard-based transaction imports from the browser extension.
 * Provides validation, normalization, and deduplication of transaction data.
 */

export interface ConnectorTransaction {
  date: string;       // Format: MM/DD/YYYY or similar
  amount: number;     // Negative = expense, Positive = income
  raw_text: string;   // Original bank description
}

export interface ProcessedTransaction {
  date: string;           // ISO format YYYY-MM-DD
  description: string;    // Cleaned description
  amount: number;         // Absolute value
  category: string;       // Default category
  flow: 'in' | 'out';     // Direction of money
  rawText: string;        // Original text for reference
  duplicateKey: string;   // Composite key for dedup
}

export interface ImportResult {
  newTransactions: ProcessedTransaction[];
  duplicates: ProcessedTransaction[];
  errors: string[];
}

/**
 * Normalize a payee/description for deduplication
 */
function normalizePayee(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')  // Remove special chars
    .slice(0, 30);               // Truncate for comparison
}

/**
 * Parse date from various formats to ISO format
 */
function parseDate(dateStr: string): string {
  // Handle MM/DD/YYYY, MM/DD/YY, MM-DD-YYYY formats
  const parts = dateStr.split(/[\/\-]/);
  
  if (parts.length >= 2) {
    let month = parts[0].padStart(2, '0');
    let day = parts[1].padStart(2, '0');
    let year = parts[2] || new Date().getFullYear().toString();
    
    // Handle 2-digit year
    if (year.length === 2) {
      year = (parseInt(year) > 50 ? '19' : '20') + year;
    }
    
    // Validate month and day
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    
    if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
      return `${year}-${month}-${day}`;
    }
  }
  
  // Fallback to today's date
  return new Date().toISOString().split('T')[0];
}

/**
 * Create a composite key for deduplication
 */
function createDuplicateKey(date: string, amount: number, payee: string): string {
  return `${date}-${amount.toFixed(2)}-${normalizePayee(payee)}`;
}

/**
 * Extract clean description from raw bank text
 */
function extractDescription(rawText: string): string {
  // Remove common bank noise patterns
  return rawText
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .replace(/\d{4,}/g, '')         // Remove long numbers (card numbers, etc)
    .replace(/#\d+/g, '')           // Remove # codes
    .replace(/\*+/g, '')            // Remove asterisks
    .trim()
    .slice(0, 100);                 // Limit length
}

/**
 * Validate that data matches expected connector format
 */
function validateConnectorData(data: unknown): data is ConnectorTransaction[] {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return false;
  
  return data.every(item => 
    typeof item === 'object' &&
    item !== null &&
    'date' in item &&
    'amount' in item &&
    typeof item.amount === 'number' &&
    !isNaN(item.amount)
  );
}

/**
 * Read and parse transaction data from clipboard
 */
export async function importFromClipboard(): Promise<ImportResult> {
  const errors: string[] = [];
  
  try {
    // Check clipboard permissions
    const clipboardText = await navigator.clipboard.readText();
    
    if (!clipboardText || clipboardText.trim() === '') {
      return { 
        newTransactions: [], 
        duplicates: [], 
        errors: ['Clipboard is empty. Copy transactions from the Connector first.'] 
      };
    }
    
    // Attempt to parse as JSON
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(clipboardText);
    } catch {
      return { 
        newTransactions: [], 
        duplicates: [], 
        errors: ['Clipboard does not contain valid transaction data. Make sure to use the Zero Hero Connector.'] 
      };
    }
    
    // Validate structure
    if (!validateConnectorData(parsedData)) {
      return { 
        newTransactions: [], 
        duplicates: [], 
        errors: ['Data format not recognized. Expected transactions with date and amount fields.'] 
      };
    }
    
    // Process transactions
    const processed: ProcessedTransaction[] = parsedData.map(item => {
      const isoDate = parseDate(item.date);
      const rawText = item.raw_text || item.date; // Fallback if raw_text missing
      const description = extractDescription(rawText);
      const flow: 'in' | 'out' = item.amount < 0 ? 'out' : 'in';
      const absAmount = Math.abs(item.amount);
      
      return {
        date: isoDate,
        description: description || 'Unknown Transaction',
        amount: absAmount,
        category: flow === 'in' ? 'Income' : 'Uncategorized',
        flow,
        rawText,
        duplicateKey: createDuplicateKey(isoDate, absAmount, description),
      };
    });
    
    return {
      newTransactions: processed,
      duplicates: [],
      errors,
    };
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        errors.push('Clipboard access denied. Please allow clipboard permissions and try again.');
      } else {
        errors.push(`Import failed: ${error.message}`);
      }
    } else {
      errors.push('An unexpected error occurred while reading clipboard.');
    }
    
    return { newTransactions: [], duplicates: [], errors };
  }
}

/**
 * Check for duplicates against existing transactions
 */
export function findDuplicates(
  incoming: ProcessedTransaction[],
  existing: Array<{ date: string; amount: number; description: string }>
): ImportResult {
  // Build set of existing keys
  const existingKeys = new Set(
    existing.map(t => createDuplicateKey(t.date, t.amount, t.description))
  );
  
  const newTransactions: ProcessedTransaction[] = [];
  const duplicates: ProcessedTransaction[] = [];
  
  incoming.forEach(transaction => {
    if (existingKeys.has(transaction.duplicateKey)) {
      duplicates.push(transaction);
    } else {
      newTransactions.push(transaction);
      // Add to set to catch duplicates within the incoming batch
      existingKeys.add(transaction.duplicateKey);
    }
  });
  
  return { newTransactions, duplicates, errors: [] };
}
