import { supabase } from "@/integrations/supabase/client";
import type { Expense } from "@/hooks/useLocalExpenses";
import type { Transaction } from "@/hooks/useLocalTransactions";

export interface BudgetAllocation {
  expenseId: string;
  name: string;
  category: string;
  suggestedAmount: number;
  reasoning: string;
}

export interface BudgetDraft {
  allocations: BudgetAllocation[];
  summary: string;
}

interface DraftBudgetInput {
  income: number;
  expenses: Expense[];
  debts: Array<{ name: string; balance: number; interest_rate: number; minimum_payment: number }>;
  transactions: Transaction[];
  subscriptions: Array<{ name: string; amount: number; billing_cycle: string; next_billing_date?: string; is_active: boolean }>;
}

/**
 * Local rule-based budget draft engine (used when user is not authenticated / demo mode).
 * Follows the same rules as the AI edge function but without an API call.
 */
function generateLocalDraft(input: DraftBudgetInput): BudgetDraft {
  const { income, expenses, debts, transactions, subscriptions } = input;
  const allocations: BudgetAllocation[] = [];
  let remaining = income;

  // Calculate 3-month category averages from transactions
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const recentOutflows = transactions.filter((t) => {
    if (t.flow !== "out") return false;
    const d = new Date(t.date);
    return d >= threeMonthsAgo && d <= now;
  });

  const categoryTotals: Record<string, number> = {};
  recentOutflows.forEach((t) => {
    const cat = t.category || "Other";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
  });
  const monthsElapsed = Math.max(1, Math.min(3, (now.getTime() - threeMonthsAgo.getTime()) / (30 * 24 * 60 * 60 * 1000)));
  const categoryAverages: Record<string, number> = {};
  Object.entries(categoryTotals).forEach(([cat, total]) => {
    categoryAverages[cat] = Math.round(total / monthsElapsed);
  });

  // Upcoming bills within 14 days
  const fourteenDays = 14 * 24 * 60 * 60 * 1000;
  const upcomingBills = subscriptions
    .filter((s) => {
      if (!s.is_active || !s.next_billing_date) return false;
      const d = new Date(s.next_billing_date);
      return d >= now && d.getTime() <= now.getTime() + fourteenDays;
    })
    .map((s) => ({
      name: s.name,
      amount: s.amount,
      daysUntilDue: Math.ceil((new Date(s.next_billing_date!).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
    }));

  // Fixed categories that get priority
  const fixedCategories = ["Housing", "Utilities", "Insurance", "Insurance & Healthcare", "Transportation", "Debt Payments"];

  // Spending history per budget line: transactions linked to a line count for
  // that line only, so lines in the same category never repeat one total.
  const lineTotals: Record<string, number> = {};
  const linkedCategoryTotals: Record<string, number> = {};
  recentOutflows.forEach((t) => {
    if (!t.expense_id) return;
    lineTotals[t.expense_id] = (lineTotals[t.expense_id] || 0) + t.amount;
    const cat = t.category || "Other";
    linkedCategoryTotals[cat] = (linkedCategoryTotals[cat] || 0) + t.amount;
  });

  const expenseItems = expenses.filter((e) => !e.is_income);
  const plannedByCategory: Record<string, number> = {};
  const countByCategory: Record<string, number> = {};
  expenseItems.forEach((e) => {
    plannedByCategory[e.category] = (plannedByCategory[e.category] || 0) + (e.amount || 0);
    countByCategory[e.category] = (countByCategory[e.category] || 0) + 1;
  });

  const lineAverage = (e: Expense): number => {
    const linked = lineTotals[e.id];
    if (linked && linked > 0) return Math.round(linked / monthsElapsed);
    // Unlinked category history is shared across that category's lines by planned share
    const unlinked = (categoryTotals[e.category] || 0) - (linkedCategoryTotals[e.category] || 0);
    if (unlinked <= 0) return 0;
    const planned = plannedByCategory[e.category] || 0;
    const share = planned > 0 ? (e.amount || 0) / planned : 1 / (countByCategory[e.category] || 1);
    return Math.round((unlinked / monthsElapsed) * share);
  };

  // 1. Allocate existing expenses
  const drafts = expenseItems.map((e) => {
    const isFixed = fixedCategories.includes(e.category);
    const avg = lineAverage(e);
    const upcomingBill = upcomingBills.find((b) => b.name.toLowerCase().includes(e.name.toLowerCase()));

    let suggested = e.amount;
    let reasoning = "";

    if (upcomingBill) {
      suggested = Math.max(e.amount, upcomingBill.amount);
      reasoning = `${e.name} is due in ${upcomingBill.daysUntilDue} day${upcomingBill.daysUntilDue !== 1 ? "s" : ""}, so it is prioritized to avoid late fees.`;
    } else if (isFixed) {
      suggested = e.amount > 0 ? e.amount : avg;
      reasoning = `Fixed bill kept at your planned amount.`;
    } else if (avg > 0) {
      suggested = avg;
      reasoning = `Based on your 3-month average of $${avg}/mo for ${e.name}.`;
    } else if (e.amount > 0) {
      suggested = e.amount;
      reasoning = `Kept at your current planned amount.`;
    } else {
      suggested = 0;
      reasoning = `No spending history yet, so this starts at $0.`;
    }

    return { e, isFlexible: !isFixed && !upcomingBill, suggested: Math.round(suggested), reasoning };
  });

  // Never plan more than the income: trim flexible lines proportionally first,
  // then every line if fixed bills alone exceed income.
  const fitToIncome = (pool: typeof drafts, budget: number) => {
    const total = pool.reduce((sum, d) => sum + d.suggested, 0);
    if (total <= budget || total <= 0) return;
    const factor = Math.max(0, budget) / total;
    pool.forEach((d) => {
      d.suggested = Math.floor(d.suggested * factor);
      d.reasoning = `${d.reasoning} Trimmed so your plan fits your income.`;
    });
  };
  const fixedTotal = drafts.filter((d) => !d.isFlexible).reduce((sum, d) => sum + d.suggested, 0);
  fitToIncome(drafts.filter((d) => d.isFlexible), income - fixedTotal);
  fitToIncome(drafts, income);

  drafts.forEach((d) => {
    remaining -= d.suggested;
    allocations.push({
      expenseId: d.e.id,
      name: d.e.name,
      category: d.e.category,
      suggestedAmount: d.suggested,
      reasoning: d.reasoning,
    });
  });

  // 2. High-interest debt surplus allocation (10% of remaining if > 0)
  const highInterestDebts = debts
    .filter((d) => d.interest_rate > 20 && d.balance > 0)
    .sort((a, b) => b.interest_rate - a.interest_rate);

  if (highInterestDebts.length > 0 && remaining > 0) {
    const extraDebtPayment = Math.floor(remaining * 0.1);
    const topDebt = highInterestDebts[0];
    remaining -= extraDebtPayment;
    allocations.push({
      expenseId: "new",
      name: `Extra ${topDebt.name} Payment`,
      category: "Debt Payments",
      suggestedAmount: extraDebtPayment,
      reasoning: `${topDebt.name} has ${topDebt.interest_rate}% APR. Putting 10% of your surplus here saves you money long-term.`,
    });
  }

  // 3. Distribute remaining to savings or emergency fund
  if (remaining > 0) {
    allocations.push({
      expenseId: "new",
      name: "Emergency Fund / Savings",
      category: "Savings",
      suggestedAmount: Math.floor(remaining),
      reasoning: `$${Math.floor(remaining)} left unassigned. Building your safety net is a strong use of surplus dollars.`,
    });
    remaining = 0;
  }

  // Build summary
  const totalAllocated = allocations.reduce((s, a) => s + a.suggestedAmount, 0);
  const debtNote = highInterestDebts.length > 0
    ? ` I've directed 10% of your surplus to your highest-interest debt (${highInterestDebts[0].name} at ${highInterestDebts[0].interest_rate}% APR).`
    : "";
  const billNote = upcomingBills.length > 0
    ? ` ${upcomingBills.length} bill${upcomingBills.length !== 1 ? "s" : ""} due soon, and those are prioritized.`
    : "";

  return {
    allocations,
    summary: `I've allocated $${totalAllocated.toLocaleString("en-US")} of your $${income.toLocaleString("en-US")} income across ${allocations.length} categories using your spending history and upcoming bills.${debtNote}${billNote}`,
  };
}

export async function generateBudgetDraft(input: DraftBudgetInput, isAuthenticated = true): Promise<BudgetDraft> {
  // Use local fallback for unauthenticated/demo users
  if (!isAuthenticated) {
    // Small delay to simulate processing
    await new Promise((r) => setTimeout(r, 800));
    return generateLocalDraft(input);
  }

  const { data, error } = await supabase.functions.invoke("draft-budget", {
    body: {
      income: input.income,
      expenses: input.expenses.map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        currentAmount: e.amount,
        isIncome: e.is_income,
      })),
      debts: input.debts.map((d) => ({
        name: d.name,
        balance: d.balance,
        interestRate: d.interest_rate,
        minimumPayment: d.minimum_payment,
      })),
      transactions: input.transactions.slice(-300).map((t) => ({
        date: t.date,
        amount: t.amount,
        category: t.category,
        flow: t.flow,
      })),
      subscriptions: input.subscriptions.map((s) => ({
        name: s.name,
        amount: s.amount,
        billing_cycle: s.billing_cycle,
        next_billing_date: s.next_billing_date,
        is_active: s.is_active,
      })),
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to generate budget draft");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as BudgetDraft;
}
