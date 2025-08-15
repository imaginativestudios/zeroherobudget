export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  apr: number;
  min: number;
  type: string;
  _orig?: number;
  _interestAccrued?: number;
  _monthsToZero?: number | null;
}

export interface PayoffResult {
  timeline: Array<{
    label: string;
    totalBalance: number;
  }>;
  totalInterest: number;
  perDebt: Array<{
    id: string;
    name: string;
    months: number | null;
    payoffLabel: string;
    totalInterest: number;
    type: string;
    orig: number;
    balance: number;
  }>;
}

export function simulatePayoff(
  rawDebts: DebtItem[],
  extraBudget: number,
  strategy: "Snowball" | "Avalanche" = "Snowball",
  monthsLimit: number = 600
): PayoffResult {
  const leftover = Math.max(0, extraBudget || 0);
  
  const debts = rawDebts.map(d => ({
    ...d,
    balance: Math.max(0, d.balance || 0),
    apr: Math.max(0, d.apr || 0),
    min: Math.max(0, d.min || 0),
    _interestAccrued: 0,
    _monthsToZero: null as number | null,
    _orig: d._orig ?? Math.max(0, d.balance || 0)
  })).filter(d => d.balance > 0);

  if (!debts.length) {
    return { timeline: [], totalInterest: 0, perDebt: [] };
  }

  let month = 0;
  let totalInterest = 0;
  const timeline: Array<{ label: string; totalBalance: number }> = [];
  const today = new Date();

  const sortFunction = strategy === "Avalanche" 
    ? (a: typeof debts[0], b: typeof debts[0]) => b.apr - a.apr || a.balance - b.balance
    : (a: typeof debts[0], b: typeof debts[0]) => a.balance - b.balance || b.apr - a.apr;

  const getActiveDebts = () => debts.filter(d => d.balance > 0).sort(sortFunction);

  while (month < monthsLimit) {
    const activeDebts = getActiveDebts();
    if (!activeDebts.length) break;

    // Calculate interest for all active debts
    const interestMap = new Map<string, number>();
    for (const debt of activeDebts) {
      const monthlyInterest = debt.balance * (debt.apr / 100 / 12);
      interestMap.set(debt.id, monthlyInterest);
      totalInterest += monthlyInterest;
      debt._interestAccrued += monthlyInterest;
    }

    // Calculate minimum payments
    const minimumMap = new Map<string, number>();
    for (const debt of activeDebts) {
      const totalDue = debt.balance + (interestMap.get(debt.id) || 0);
      minimumMap.set(debt.id, Math.min(debt.min, totalDue));
    }

    // Distribute extra payment using debt strategy
    let extraRemaining = leftover;
    const extraPayments = new Map<string, number>();
    
    // Initialize all extra payments to 0
    for (const debt of activeDebts) {
      extraPayments.set(debt.id, 0);
    }

    // Apply extra payments according to strategy
    for (const debt of activeDebts) {
      if (extraRemaining <= 0) break;
      
      const afterMinimum = debt.balance + (interestMap.get(debt.id) || 0) - (minimumMap.get(debt.id) || 0);
      if (afterMinimum <= 0) continue;
      
      const payment = Math.min(extraRemaining, afterMinimum);
      extraPayments.set(debt.id, payment);
      extraRemaining -= payment;
    }

    // Apply all payments
    for (const debt of activeDebts) {
      const interest = interestMap.get(debt.id) || 0;
      const minimum = minimumMap.get(debt.id) || 0;
      const extra = extraPayments.get(debt.id) || 0;
      
      const newBalance = debt.balance + interest - minimum - extra;
      debt.balance = Math.max(0, newBalance);
    }

    // Mark debts as paid off
    for (const debt of debts) {
      if (debt._monthsToZero === null && debt.balance <= 0.01) {
        debt._monthsToZero = month + 1;
      }
    }

    // Record timeline point
    const labelDate = new Date(today.getFullYear(), today.getMonth() + month, 1);
    const label = labelDate.toLocaleString(undefined, { month: "short", year: "numeric" });
    const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    
    timeline.push({ label, totalBalance });

    if (totalBalance <= 0.01) break;
    month++;
  }

  const perDebt = debts.map(debt => {
    const payoffDate = debt._monthsToZero 
      ? new Date(today.getFullYear(), today.getMonth() + (debt._monthsToZero - 1), 1)
      : null;
    const payoffLabel = payoffDate 
      ? payoffDate.toLocaleString(undefined, { month: "short", year: "numeric" })
      : "—";

    return {
      id: debt.id,
      name: debt.name,
      months: debt._monthsToZero,
      payoffLabel,
      totalInterest: debt._interestAccrued,
      type: debt.type || "debt",
      orig: debt._orig,
      balance: debt.balance
    };
  });

  return { timeline, totalInterest, perDebt };
}