import { test, expect } from '@playwright/test';
import { simulatePayoff, getDetailedPaymentSchedule, calculatePayoffPlan, type DebtItem } from '../src/lib/debtCalculations';

const debts: DebtItem[] = [
  { id: 'small', name: 'Small card', balance: 500, apr: 10, min: 25, type: 'debt' },
  { id: 'large', name: 'Large card', balance: 2000, apr: 24, min: 60, type: 'debt' },
];

for (const strategy of ['Snowball', 'Avalanche'] as const) {
  test(`${strategy}: rollover pays two debts sooner with less interest`, () => {
    const before = simulatePayoff(debts, 25, strategy, 600, false);
    const after = simulatePayoff(debts, 25, strategy);
    expect(before.timeline.length).toBe(strategy === 'Snowball' ? 38 : 33);
    expect(before.totalInterest).toBeCloseTo(strategy === 'Snowball' ? 955.7133092918784 : 779.2229303963893, 8);
    expect(after.timeline.length).toBeLessThan(before.timeline.length);
    expect(after.totalInterest).toBeLessThan(before.totalInterest);
    expect(after.perDebt.every(debt => debt.months !== null)).toBe(true);
    const schedule = getDetailedPaymentSchedule(debts, 25, strategy);
    expect(schedule.summary.totalMonths).toBe(after.timeline.length);
    expect(schedule.summary.totalInterest).toBeCloseTo(after.totalInterest, 8);
    const oldSchedule = getDetailedPaymentSchedule(debts, 25, strategy, 600, false);
    expect(oldSchedule.summary.totalMonths).toBe(before.timeline.length);
    expect(oldSchedule.summary.totalInterest).toBeCloseTo(before.totalInterest, 8);
  });

  test(`${strategy}: payments never exceed the fixed $185 monthly budget`, () => {
    const schedule = getDetailedPaymentSchedule(debts, 100, strategy);
    expect(schedule.months.length).toBeGreaterThan(1);
    for (const month of schedule.months) {
      expect(month.totals.totalPayment).toBeLessThanOrEqual(185 + 1e-9);
      expect(month.totals.totalPayment).toBeCloseTo(Math.min(185, month.payments.reduce((sum, debt) => sum + debt.startingBalance + debt.interest, 0)), 8);
      for (const debt of month.payments) {
        expect(debt.totalPayment).toBeLessThanOrEqual(debt.startingBalance + debt.interest + 1e-9);
        expect(debt.endingBalance).toBeGreaterThanOrEqual(0);
      }
    }
    expect(schedule.summary.totalPaid).toBeCloseTo(2500 + schedule.summary.totalInterest, 8);
  });
}

test('unused minimums roll over within the same month and in later months', () => {
  const input: DebtItem[] = [
    { id: 'a', name: 'A', balance: 10, apr: 0, min: 25, type: 'debt' },
    { id: 'b', name: 'B', balance: 100, apr: 0, min: 25, type: 'debt' },
  ];
  const schedule = getDetailedPaymentSchedule(input, 0);
  expect(schedule.months.map(month => month.totals.totalPayment)).toEqual([50, 50, 10]);
  expect(schedule.months[0]?.payments.find(debt => debt.debtId === 'b')?.totalPayment).toBe(40);
  expect(getDetailedPaymentSchedule(input, 0, 'Snowball', 600, false).months.map(month => month.totals.totalPayment)).toEqual([35, 25, 25, 25]);
});

test('minimum-only baseline explicitly disables rollover and extra payment', () => {
  const baseline = calculatePayoffPlan(debts, 0, 'Snowball', false);
  const minimums = simulatePayoff(debts, 0, 'Snowball', 600, false);
  expect(baseline.months).toBe(minimums.timeline.length);
  expect(baseline.totalInterest).toBeCloseTo(minimums.totalInterest, 8);
  expect(baseline.totalInterest).toBeGreaterThan(calculatePayoffPlan(debts, 0, 'Snowball').totalInterest);
});