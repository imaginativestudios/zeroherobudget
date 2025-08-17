import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date | string): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

export function getMonthRange(monthStr: string): { start: Date; end: Date } {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return {
    start: startOfMonth(date),
    end: endOfMonth(date)
  };
}

export function isDateInMonth(date: string, monthStr: string): boolean {
  const transactionDate = new Date(date);
  const { start, end } = getMonthRange(monthStr);
  return isWithinInterval(transactionDate, { start, end });
}

export function formatMonthDisplay(monthStr: string): string {
  const [year, month] = monthStr.split('-').map(Number);
  return format(new Date(year, month - 1, 1), 'MMMM yyyy');
}