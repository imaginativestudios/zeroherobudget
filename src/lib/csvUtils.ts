export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  accountId: string;
  flow: 'in' | 'out';
  expenseId?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  name: string;
  planned: number;
  notes: string;
  category: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash' | 'investment';
  balance: number;
  isActive: boolean;
}

export interface Debt {
  id: string;
  name: string;
  balance: number;
  apr: number;
  min: number;
  type: string;
  _orig?: number;
}

export function mapTransactionCsv(rows: string[][], accounts: Account[], expenses?: any[]): Transaction[] {
  if (!rows.length) return [];
  
  const header = rows[0].map(h => h.trim().toLowerCase());
  const getIndex = (key: string) => header.indexOf(key);
  
  // Try to find account mapping - common bank CSV headers
  const accountMapping = new Map<string, string>();
  const defaultAccount = accounts.find(a => a.isActive) || accounts[0];
  
  const result: Transaction[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.every(x => !String(x || "").trim())) continue;
    
    // Parse amount - handle different formats
    let amount = 0;
    let flow: 'in' | 'out' = 'out';
    
    const amountStr = row[getIndex("amount")] || row[getIndex("transaction amount")] || 
                     row[getIndex("debit")] || row[getIndex("credit")] || "";
    
    // Check for separate debit/credit columns
    const debitAmount = parseFloat(row[getIndex("debit")] || "0");
    const creditAmount = parseFloat(row[getIndex("credit")] || "0");
    
    if (debitAmount > 0) {
      amount = debitAmount;
      flow = 'out';
    } else if (creditAmount > 0) {
      amount = creditAmount;
      flow = 'in';
    } else {
      const parsedAmount = parseFloat(amountStr.replace(/[,$]/g, ''));
      if (!isNaN(parsedAmount)) {
        amount = Math.abs(parsedAmount);
        flow = parsedAmount < 0 ? 'out' : 'in';
      }
    }
    
    if (amount <= 0) continue;
    
    // Parse description
    const description = sanitizeTextInput(
      row[getIndex("description")] || 
      row[getIndex("transaction description")] || 
      row[getIndex("memo")] || 
      row[getIndex("reference")] || 
      "Imported Transaction"
    );
    
    // Parse date
    let date = row[getIndex("date")] || row[getIndex("transaction date")] || row[getIndex("post date")];
    if (date) {
      // Try to parse different date formats
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0];
      } else {
        date = new Date().toISOString().split('T')[0];
      }
    } else {
      date = new Date().toISOString().split('T')[0];
    }
    
    // Parse category
    const category = sanitizeTextInput(
      row[getIndex("category")] || 
      row[getIndex("transaction category")] || 
      "Imported"
    );
    
    // Determine account (for now, use default - could be enhanced to map account names)
    const accountName = row[getIndex("account")] || row[getIndex("account name")] || "";
    let accountId = defaultAccount?.id || 'default-checking';
    
    if (accountName) {
      const matchedAccount = accounts.find(a => 
        a.name.toLowerCase().includes(accountName.toLowerCase()) ||
        accountName.toLowerCase().includes(a.name.toLowerCase())
      );
      if (matchedAccount) {
        accountId = matchedAccount.id;
      }
    }
    
    // Try to link to budget expense by matching category
    let expenseId: string | undefined;
    if (expenses && flow === 'out') {
      const matchedExpense = expenses.find(expense => 
        expense.category?.toLowerCase() === category?.toLowerCase()
      );
      if (matchedExpense) {
        expenseId = matchedExpense.id;
      }
    }

    result.push({
      id: crypto.randomUUID(),
      date,
      description,
      amount,
      category,
      accountId,
      flow,
      expenseId,
      notes: sanitizeTextInput(row[getIndex("notes")] || "")
    });
  }
  
  return result;
}

export interface Asset {
  id: string;
  name: string;
  value: number;
}

export function toCsv(rows: string[][]): string {
  const escapeValue = (value: any): string => {
    if (value == null) return "";
    const str = String(value);
    
    // Prevent CSV formula injection by escaping dangerous characters
    const sanitized = /^[=+\-@]/.test(str) ? "'" + str : str;
    
    return /[",\n]/.test(sanitized) ? '"' + sanitized.replace(/"/g, '""') + '"' : sanitized;
  };
  
  return rows.map(row => row.map(escapeValue).join(",")).join("\n");
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let i = 0;
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  while (i < text.length) {
    const char = text[i];
    
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\r") {
        // Skip carriage return
      } else if (char === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }
    i++;
  }
  
  row.push(field);
  rows.push(row);
  return rows;
}

export function mapExpenseCsv(rows: string[][]): Expense[] {
  if (!rows.length) return [];
  
  const header = rows[0].map(h => h.trim().toLowerCase());
  const getIndex = (key: string) => header.indexOf(key);
  
  const result: Expense[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.every(x => !String(x || "").trim())) continue;
    
    // Sanitize input values
    const name = sanitizeTextInput(row[getIndex("name")] || "");
    const notes = sanitizeTextInput(row[getIndex("notes")] || "");
    const category = sanitizeTextInput(row[getIndex("category")] || "Uncategorized");
    const planned = Math.max(0, Math.min(1000000, parseFloat(row[getIndex("planned")]) || 0));
    
    result.push({
      id: crypto.randomUUID(),
      name,
      planned,
      notes,
      category
    });
  }
  
  return result;
}

export function mapDebtCsv(rows: string[][]): Debt[] {
  if (!rows.length) return [];
  
  const header = rows[0].map(h => h.trim().toLowerCase());
  const getIndex = (key: string) => header.indexOf(key);
  
  const result: Debt[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.every(x => !String(x || "").trim())) continue;
    
    // Sanitize and validate input values
    const name = sanitizeTextInput(row[getIndex("name")] || "");
    const type = sanitizeTextInput(row[getIndex("type")] || "debt");
    const balance = Math.max(0, Math.min(10000000, parseFloat(row[getIndex("balance")]) || 0));
    const apr = Math.max(0, Math.min(100, parseFloat(row[getIndex("apr")]) || 0));
    const min = Math.max(0, Math.min(balance, parseFloat(row[getIndex("min")]) || 0));
    
    result.push({
      id: crypto.randomUUID(),
      name,
      balance,
      apr,
      min,
      type,
      _orig: balance
    });
  }
  
  return result;
}

// Sanitize text input to prevent XSS and limit length
export function sanitizeTextInput(input: string): string {
  if (!input) return "";
  return input
    .toString()
    .trim()
    .slice(0, 255) // Limit length
    .replace(/[<>]/g, ""); // Remove potential HTML tags
}

// Validate CSV file before processing
export function validateCsvFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB limit
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
  
  if (file.size > maxSize) {
    return { isValid: false, error: "File size must be less than 5MB" };
  }
  
  if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.csv')) {
    return { isValid: false, error: "Please select a valid CSV file" };
  }
  
  return { isValid: true };
}

export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}