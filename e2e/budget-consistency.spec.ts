import { test, expect } from '@playwright/test';
import { totalPlannedExpenses, plannedLeftover } from '../src/lib/budgetMath';
import { calculatePayoffPlan, compareStrategies } from '../src/lib/debtCalculations';

test('planned expenses count only expense lines, not income lines', () => {
  const lines = [
    { amount: 5000, is_income: true },
    { amount: 4000, is_income: false },
    { amount: 594, is_income: false },
  ];
  expect(totalPlannedExpenses(lines)).toBe(4594);
  expect(plannedLeftover(5000, lines)).toBe(406);
});

test('tied strategies get the tie coach message, not an optimal-path claim', () => {
  const debts = [{ id: 'a', name: 'A', balance: 1000, apr: 10, min: 100, type: 'card' }];
  const result = compareStrategies(debts, 0, 'Snowball');
  expect(result.monthsSaved).toBe(0);
  expect(result.coachMessage).toContain('finish at the same time');
});

test('a $0 debt does not change the month count of the payoff plan', () => {
  const debts = [
    { id: 'a', name: 'A', balance: 3000, apr: 18, min: 90, type: 'card' },
    { id: 'z', name: 'New Credit Card', balance: 0, apr: 0, min: 50, type: 'card' },
  ];
  const withBlank = calculatePayoffPlan(debts, 0, 'Snowball').months;
  const withoutBlank = calculatePayoffPlan([debts[0]], 0, 'Snowball').months;
  expect(withBlank).toBe(withoutBlank);
});
