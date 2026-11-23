/**
 * Shared planned-budget math. The Budget page and every screen that shows
 * planned expenses or the leftover for debt use these, so the numbers match.
 * Only expense lines count; income lines never add to planned expenses.
 */
export interface BudgetLineLike {
  amount?: number;
  planned?: number;
  is_income?: boolean;
}

export const totalPlannedExpenses = (lines: BudgetLineLike[]): number =>
  lines.reduce(
    (sum, line) => (line.is_income ? sum : sum + (Number(line.planned ?? line.amount) || 0)),
    0,
  );

export const plannedLeftover = (income: number, lines: BudgetLineLike[]): number =>
  Math.max(0, (income || 0) - totalPlannedExpenses(lines));
