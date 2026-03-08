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

export async function generateBudgetDraft(input: DraftBudgetInput): Promise<BudgetDraft> {
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
