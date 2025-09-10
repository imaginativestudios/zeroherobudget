// Financial insights generator
export interface InsightData {
  income: number;
  expenses: number;
  netWorth: number;
  subscriptions: number;
  availableForDebt: number;
  previousIncome?: number;
  previousExpenses?: number;
  previousNetWorth?: number;
  previousSubscriptions?: number;
  previousAvailableForDebt?: number;
  totalDebt: number;
  totalTransactions: number;
  largestExpenseCategory?: { name: string; amount: number; percentage: number };
}

export function generateFinancialInsights(data: InsightData) {
  const insights = {
    income: generateIncomeInsight(data),
    expenses: generateExpenseInsight(data),
    netWorth: generateNetWorthInsight(data),
    subscriptions: generateSubscriptionInsight(data),
    availableForDebt: generateDebtInsight(data),
  };
  
  return insights;
}

function generateIncomeInsight(data: InsightData): string | undefined {
  const { income, previousIncome, expenses } = data;
  
  if (previousIncome && previousIncome > 0) {
    const change = ((income - previousIncome) / previousIncome) * 100;
    if (change > 10) return `Strong income growth this month (+${change.toFixed(1)}%)`;
    if (change < -10) return `Income decreased significantly (-${Math.abs(change).toFixed(1)}%)`;
  }
  
  if (income > 0 && expenses > 0) {
    const savingsRate = ((income - expenses) / income) * 100;
    if (savingsRate > 20) return `Excellent savings rate: ${savingsRate.toFixed(1)}%`;
    if (savingsRate < 5) return `Low savings rate: ${savingsRate.toFixed(1)}%`;
  }
  
  return undefined;
}

function generateExpenseInsight(data: InsightData): string | undefined {
  const { expenses, income, previousExpenses, largestExpenseCategory } = data;
  
  if (previousExpenses && previousExpenses > 0) {
    const change = ((expenses - previousExpenses) / previousExpenses) * 100;
    if (change > 15) return `Spending increased by ${change.toFixed(1)}% this month`;
    if (change < -15) return `Great job cutting expenses (-${Math.abs(change).toFixed(1)}%)`;
  }
  
  if (largestExpenseCategory && largestExpenseCategory.percentage > 40) {
    return `${largestExpenseCategory.name} dominates spending (${largestExpenseCategory.percentage.toFixed(1)}%)`;
  }
  
  if (income > 0 && expenses > 0) {
    const ratio = expenses / income;
    if (ratio > 0.9) return `Spending ${(ratio * 100).toFixed(1)}% of income`;
  }
  
  return undefined;
}

function generateNetWorthInsight(data: InsightData): string | undefined {
  const { netWorth, previousNetWorth, totalDebt, availableForDebt } = data;
  
  if (previousNetWorth !== undefined) {
    const change = netWorth - previousNetWorth;
    if (change > 1000) return `Net worth increased by ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(change)}`;
    if (change < -1000) return `Net worth decreased by ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(change))}`;
  }
  
  if (netWorth < 0 && totalDebt > 0) {
    const monthsToPositive = Math.ceil(Math.abs(netWorth) / Math.max(availableForDebt, 1));
    if (monthsToPositive <= 12) return `Could reach positive net worth in ${monthsToPositive} months`;
  }
  
  return undefined;
}

function generateSubscriptionInsight(data: InsightData): string | undefined {
  const { subscriptions, income, previousSubscriptions } = data;
  
  if (previousSubscriptions && previousSubscriptions > 0) {
    const change = ((subscriptions - previousSubscriptions) / previousSubscriptions) * 100;
    if (change > 10) return `Subscriptions increased ${change.toFixed(1)}% this month`;
    if (change < -10) return `Reduced subscriptions by ${Math.abs(change).toFixed(1)}%`;
  }
  
  if (income > 0 && subscriptions > 0) {
    const percentage = (subscriptions / income) * 100;
    if (percentage > 15) return `Subscriptions are ${percentage.toFixed(1)}% of income`;
    if (percentage < 5) return `Low subscription spending (${percentage.toFixed(1)}% of income)`;
  }
  
  return undefined;
}

function generateDebtInsight(data: InsightData): string | undefined {
  const { availableForDebt, totalDebt, income, previousAvailableForDebt } = data;
  
  if (previousAvailableForDebt && previousAvailableForDebt > 0) {
    const change = ((availableForDebt - previousAvailableForDebt) / previousAvailableForDebt) * 100;
    if (change > 20) return `More funds available for debt (+${change.toFixed(1)}%)`;
  }
  
  if (totalDebt > 0 && availableForDebt > 0) {
    const monthsToPayoff = Math.ceil(totalDebt / availableForDebt);
    if (monthsToPayoff <= 24) return `Could be debt-free in ${monthsToPayoff} months`;
    if (monthsToPayoff > 60) return `Long payoff timeline: ${monthsToPayoff} months`;
  }
  
  if (income > 0 && availableForDebt > 0) {
    const percentage = (availableForDebt / income) * 100;
    if (percentage > 20) return `Excellent debt payment capacity (${percentage.toFixed(1)}%)`;
    if (percentage < 5) return `Limited funds for debt payments (${percentage.toFixed(1)}%)`;
  }
  
  return undefined;
}

// Helper function to get previous month data (placeholder - you'll need to implement this based on your data structure)
export function getPreviousMonthData(currentData: any): Partial<InsightData> {
  // This is a placeholder - you'd implement actual previous month data fetching
  // For now, return empty object or mock data for demonstration
  const mockPreviousData = {
    previousIncome: currentData.income * 0.95,
    previousExpenses: currentData.expenses * 1.05,
    previousNetWorth: currentData.netWorth - 500,
    previousSubscriptions: currentData.subscriptions * 1.1,
    previousAvailableForDebt: currentData.availableForDebt * 0.9,
  };
  
  return mockPreviousData;
}