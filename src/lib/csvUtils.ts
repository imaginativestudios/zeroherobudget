export interface Expense {
  id: string;
  name: string;
  planned: number;
  notes: string;
  category: string;
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

export interface Asset {
  id: string;
  name: string;
  value: number;
}

export function toCsv(rows: string[][]): string {
  const escapeValue = (value: any): string => {
    if (value == null) return "";
    const str = String(value);
    return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
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
    
    result.push({
      id: crypto.randomUUID(),
      name: row[getIndex("name")] || "",
      planned: parseFloat(row[getIndex("planned")]) || 0,
      notes: row[getIndex("notes")] || "",
      category: row[getIndex("category")] || "Uncategorized"
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
    
    const balance = parseFloat(row[getIndex("balance")]) || 0;
    result.push({
      id: crypto.randomUUID(),
      name: row[getIndex("name")] || "",
      balance,
      apr: parseFloat(row[getIndex("apr")]) || 0,
      min: parseFloat(row[getIndex("min")]) || 0,
      type: row[getIndex("type")] || "debt",
      _orig: balance
    });
  }
  
  return result;
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