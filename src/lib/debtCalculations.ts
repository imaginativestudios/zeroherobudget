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

export interface MonthlyDebtPayment {
  debtId: string;
  debtName: string;
  debtType: string;
  startingBalance: number;
  interest: number;
  minimumPayment: number;
  extraPayment: number;
  totalPayment: number;
  principal: number;
  endingBalance: number;
  isPaidOff: boolean;
}

export interface MonthlyScheduleEntry {
  month: number;
  label: string;
  payments: MonthlyDebtPayment[];
  totals: {
    totalPayment: number;
    totalInterest: number;
    totalPrincipal: number;
    remainingBalance: number;
  };
  debtsPaidOffThisMonth: string[];
}

export interface DetailedPaymentSchedule {
  months: MonthlyScheduleEntry[];
  summary: {
    totalMonths: number;
    totalInterest: number;
    totalPaid: number;
    debtFreeDate: string;
  };
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

export interface PayoffPlan {
  priorityOrder: Array<{
    id: string;
    name: string;
    balance: number;
    apr: number;
    min: number;
    type: string;
    priority: number;
    payoffMonth: number | null;
    payoffLabel: string;
    totalInterest: number;
  }>;
  totalDebt: number;
  totalInterest: number;
  totalPaid: number;
  debtFreeDate: string;
  months: number;
  timeline: Array<{ label: string; totalBalance: number }>;
}

export interface PayoffComparison {
  current: PayoffPlan;
  optimized: PayoffPlan;
  interestSaved: number;
  monthsSaved: number;
  coachMessage: string;
}

export function calculatePayoffPlan(
  rawDebts: DebtItem[],
  extraMonthly: number,
  strategy: "Snowball" | "Avalanche" = "Avalanche"
): PayoffPlan {
  const activeDebts = rawDebts.filter(d => d.balance > 0);
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.balance, 0);

  if (!activeDebts.length) {
    return {
      priorityOrder: [],
      totalDebt: 0,
      totalInterest: 0,
      totalPaid: 0,
      debtFreeDate: '—',
      months: 0,
      timeline: [],
    };
  }

  // Sort by strategy for priority order display
  const sortedDebts = [...activeDebts].sort(
    strategy === "Avalanche"
      ? (a, b) => b.apr - a.apr || a.balance - b.balance
      : (a, b) => a.balance - b.balance || b.apr - a.apr
  );

  const result = simulatePayoff(activeDebts, extraMonthly, strategy);

  const priorityOrder = sortedDebts.map((debt, index) => {
    const perDebtInfo = result.perDebt.find(d => d.id === debt.id);
    return {
      id: debt.id,
      name: debt.name,
      balance: debt.balance,
      apr: debt.apr,
      min: debt.min,
      type: debt.type,
      priority: index + 1,
      payoffMonth: perDebtInfo?.months ?? null,
      payoffLabel: perDebtInfo?.payoffLabel ?? '—',
      totalInterest: perDebtInfo?.totalInterest ?? 0,
    };
  });

  const months = result.timeline.length;
  const debtFreeDate = result.timeline[months - 1]?.label || '—';

  return {
    priorityOrder,
    totalDebt,
    totalInterest: result.totalInterest,
    totalPaid: totalDebt + result.totalInterest,
    debtFreeDate,
    months,
    timeline: result.timeline,
  };
}

export function compareStrategies(
  rawDebts: DebtItem[],
  extraMonthly: number,
  currentStrategy: "Snowball" | "Avalanche"
): PayoffComparison {
  const current = calculatePayoffPlan(rawDebts, extraMonthly, currentStrategy);
  const optimizedStrategy: "Snowball" | "Avalanche" = "Avalanche";
  const optimized = calculatePayoffPlan(rawDebts, extraMonthly, optimizedStrategy);

  const interestSaved = current.totalInterest - optimized.totalInterest;
  const monthsSaved = current.months - optimized.months;

  const formatMoney = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  let coachMessage: string;
  if (interestSaved > 0) {
    coachMessage = `Hey! If we stick to the Avalanche method, I can save you ${formatMoney(interestSaved)} in interest.`;
  } else if (monthsSaved > 0) {
    coachMessage = `Great news! The Avalanche method gets you debt-free ${monthsSaved} month${monthsSaved !== 1 ? 's' : ''} sooner.`;
  } else {
    coachMessage = `You're already on the optimal path — keep going, you've got this!`;
  }

  return { current, optimized, interestSaved, monthsSaved, coachMessage };
}

export function getDetailedPaymentSchedule(
  rawDebts: DebtItem[],
  extraBudget: number,
  strategy: "Snowball" | "Avalanche" = "Snowball",
  monthsLimit: number = 600
): DetailedPaymentSchedule {
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
    return { 
      months: [], 
      summary: { 
        totalMonths: 0, 
        totalInterest: 0, 
        totalPaid: 0, 
        debtFreeDate: '—' 
      } 
    };
  }

  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  const months: MonthlyScheduleEntry[] = [];
  const today = new Date();

  const sortFunction = strategy === "Avalanche" 
    ? (a: typeof debts[0], b: typeof debts[0]) => b.apr - a.apr || a.balance - b.balance
    : (a: typeof debts[0], b: typeof debts[0]) => a.balance - b.balance || b.apr - a.apr;

  const getActiveDebts = () => debts.filter(d => d.balance > 0).sort(sortFunction);

  while (month < monthsLimit) {
    const activeDebts = getActiveDebts();
    if (!activeDebts.length) break;

    const monthlyPayments: MonthlyDebtPayment[] = [];
    const debtsPaidOffThisMonth: string[] = [];

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
    
    for (const debt of activeDebts) {
      extraPayments.set(debt.id, 0);
    }

    for (const debt of activeDebts) {
      if (extraRemaining <= 0) break;
      
      const afterMinimum = debt.balance + (interestMap.get(debt.id) || 0) - (minimumMap.get(debt.id) || 0);
      if (afterMinimum <= 0) continue;
      
      const payment = Math.min(extraRemaining, afterMinimum);
      extraPayments.set(debt.id, payment);
      extraRemaining -= payment;
    }

    // Apply all payments and record details
    let monthTotalPayment = 0;
    let monthTotalInterest = 0;
    let monthTotalPrincipal = 0;

    for (const debt of activeDebts) {
      const startingBalance = debt.balance;
      const interest = interestMap.get(debt.id) || 0;
      const minimum = minimumMap.get(debt.id) || 0;
      const extra = extraPayments.get(debt.id) || 0;
      const totalPayment = minimum + extra;
      const principal = totalPayment - interest;
      
      const newBalance = debt.balance + interest - totalPayment;
      debt.balance = Math.max(0, newBalance);

      const isPaidOff = debt.balance <= 0.01;
      if (isPaidOff && debt._monthsToZero === null) {
        debt._monthsToZero = month + 1;
        debtsPaidOffThisMonth.push(debt.name);
      }

      monthlyPayments.push({
        debtId: debt.id,
        debtName: debt.name,
        debtType: debt.type || 'debt',
        startingBalance,
        interest,
        minimumPayment: minimum,
        extraPayment: extra,
        totalPayment,
        principal,
        endingBalance: debt.balance,
        isPaidOff
      });

      monthTotalPayment += totalPayment;
      monthTotalInterest += interest;
      monthTotalPrincipal += principal;
      totalPaid += totalPayment;
    }

    const labelDate = new Date(today.getFullYear(), today.getMonth() + month, 1);
    const label = labelDate.toLocaleString(undefined, { month: "short", year: "numeric" });
    const remainingBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);

    months.push({
      month: month + 1,
      label,
      payments: monthlyPayments,
      totals: {
        totalPayment: monthTotalPayment,
        totalInterest: monthTotalInterest,
        totalPrincipal: monthTotalPrincipal,
        remainingBalance
      },
      debtsPaidOffThisMonth
    });

    if (remainingBalance <= 0.01) break;
    month++;
  }

  const lastMonth = months[months.length - 1];
  const debtFreeDate = lastMonth ? lastMonth.label : '—';

  return {
    months,
    summary: {
      totalMonths: months.length,
      totalInterest,
      totalPaid,
      debtFreeDate
    }
  };
}