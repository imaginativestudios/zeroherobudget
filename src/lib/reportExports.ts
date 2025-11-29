import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toCsv, downloadCsv } from './csvUtils';
import { formatCurrency } from './constants';
import { format } from 'date-fns';

export interface IncomeReportData {
  incomeItems: Array<{ name: string; planned: number; actual: number }>;
  totalPlanned: number;
  totalActual: number;
  variance: number;
}

export interface DebtReportData {
  currentMonth: string;
  totalIncome: number;
  totalExpenses: number;
  availableForDebt: number;
}

export interface NetWorthData {
  assets: Array<{ name: string; amount: number }>;
  debts: Array<{ name: string; amount: number }>;
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
}

export interface SubscriptionReportData {
  subscriptions: Array<{
    name: string;
    amount: number;
    billingCycle: string;
    monthlyEquivalent: number;
    nextBillingDate?: string;
    status: string;
  }>;
  totalMonthlyCommitment: number;
  activeCount: number;
}

// Income Report Export Functions
export function exportIncomeReportCSV(data: IncomeReportData) {
  const rows = [
    ['Income Source', 'Planned', 'Actual', 'Variance'],
    ...data.incomeItems.map(item => [
      item.name,
      formatCurrency(item.planned),
      formatCurrency(item.actual),
      formatCurrency(item.actual - item.planned)
    ]),
    ['', '', '', ''],
    ['TOTAL', formatCurrency(data.totalPlanned), formatCurrency(data.totalActual), formatCurrency(data.variance)]
  ];
  
  const csv = toCsv(rows);
  downloadCsv(`income-report-${format(new Date(), 'yyyy-MM-dd')}.csv`, csv);
}

export function exportIncomeReportPDF(data: IncomeReportData) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Income Report', 14, 20);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 14, 28);
  
  // Summary
  doc.setFontSize(12);
  doc.text('Summary', 14, 40);
  doc.setFontSize(10);
  doc.text(`Total Planned: ${formatCurrency(data.totalPlanned)}`, 14, 48);
  doc.text(`Total Actual: ${formatCurrency(data.totalActual)}`, 14, 55);
  doc.text(`Variance: ${formatCurrency(data.variance)}`, 14, 62);
  
  // Table
  autoTable(doc, {
    startY: 72,
    head: [['Income Source', 'Planned', 'Actual', 'Variance']],
    body: data.incomeItems.map(item => [
      item.name,
      formatCurrency(item.planned),
      formatCurrency(item.actual),
      formatCurrency(item.actual - item.planned)
    ]),
    foot: [['TOTAL', formatCurrency(data.totalPlanned), formatCurrency(data.totalActual), formatCurrency(data.variance)]],
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
    footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: 'bold' }
  });
  
  doc.save(`income-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// Available for Debt Report Export Functions
export function exportDebtReportCSV(data: DebtReportData) {
  const rows = [
    ['Available for Debt Payment Report'],
    ['Month', data.currentMonth],
    [''],
    ['Total Income', formatCurrency(data.totalIncome)],
    ['Total Expenses', formatCurrency(data.totalExpenses)],
    ['Available for Debt', formatCurrency(data.availableForDebt)]
  ];
  
  const csv = toCsv(rows);
  downloadCsv(`available-for-debt-${format(new Date(), 'yyyy-MM-dd')}.csv`, csv);
}

export function exportDebtReportPDF(data: DebtReportData) {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Available for Debt Payment Report', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Month: ${data.currentMonth}`, 14, 28);
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 14, 35);
  
  doc.setFontSize(12);
  doc.text('Summary', 14, 50);
  
  autoTable(doc, {
    startY: 58,
    body: [
      ['Total Income', formatCurrency(data.totalIncome)],
      ['Total Expenses', formatCurrency(data.totalExpenses)],
      ['Available for Debt', formatCurrency(data.availableForDebt)]
    ],
    theme: 'plain',
    styles: { fontSize: 11 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'right' }
    }
  });
  
  doc.save(`available-for-debt-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// Net Worth Report Export Functions
export function exportNetWorthCSV(data: NetWorthData) {
  const rows = [
    ['Net Worth Report'],
    [''],
    ['ASSETS'],
    ...data.assets.map(asset => [asset.name, formatCurrency(asset.amount)]),
    ['Total Assets', formatCurrency(data.totalAssets)],
    [''],
    ['DEBTS'],
    ...data.debts.map(debt => [debt.name, formatCurrency(debt.amount)]),
    ['Total Debts', formatCurrency(data.totalDebts)],
    [''],
    ['NET WORTH', formatCurrency(data.netWorth)]
  ];
  
  const csv = toCsv(rows);
  downloadCsv(`net-worth-report-${format(new Date(), 'yyyy-MM-dd')}.csv`, csv);
}

export function exportNetWorthPDF(data: NetWorthData) {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Net Worth Report', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 14, 28);
  
  // Assets
  doc.setFontSize(14);
  doc.text('Assets', 14, 42);
  
  autoTable(doc, {
    startY: 48,
    head: [['Account', 'Amount']],
    body: data.assets.map(asset => [asset.name, formatCurrency(asset.amount)]),
    foot: [['Total Assets', formatCurrency(data.totalAssets)]],
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
    footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: 'bold' }
  });
  
  // Debts
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Debts', 14, finalY);
  
  autoTable(doc, {
    startY: finalY + 6,
    head: [['Debt', 'Amount']],
    body: data.debts.map(debt => [debt.name, formatCurrency(debt.amount)]),
    foot: [['Total Debts', formatCurrency(data.totalDebts)]],
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68] },
    footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: 'bold' }
  });
  
  // Net Worth
  const netWorthY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(`Net Worth: ${formatCurrency(data.netWorth)}`, 14, netWorthY);
  
  doc.save(`net-worth-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// Subscription Report Export Functions
export function exportSubscriptionsCSV(data: SubscriptionReportData) {
  const rows = [
    ['Service', 'Amount', 'Billing Cycle', 'Monthly Equivalent', 'Next Billing Date', 'Status'],
    ...data.subscriptions.map(sub => [
      sub.name,
      formatCurrency(sub.amount),
      sub.billingCycle,
      formatCurrency(sub.monthlyEquivalent),
      sub.nextBillingDate || 'N/A',
      sub.status
    ]),
    ['', '', '', '', '', ''],
    ['Total Monthly Commitment', formatCurrency(data.totalMonthlyCommitment), '', '', '', ''],
    ['Active Subscriptions', data.activeCount.toString(), '', '', '', '']
  ];
  
  const csv = toCsv(rows);
  downloadCsv(`subscriptions-report-${format(new Date(), 'yyyy-MM-dd')}.csv`, csv);
}

export function exportSubscriptionsPDF(data: SubscriptionReportData) {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Subscription Report', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 14, 28);
  
  // Summary
  doc.setFontSize(12);
  doc.text('Summary', 14, 40);
  doc.setFontSize(10);
  doc.text(`Total Monthly Commitment: ${formatCurrency(data.totalMonthlyCommitment)}`, 14, 48);
  doc.text(`Active Subscriptions: ${data.activeCount}`, 14, 55);
  
  // Table
  autoTable(doc, {
    startY: 65,
    head: [['Service', 'Amount', 'Cycle', 'Monthly', 'Next Billing', 'Status']],
    body: data.subscriptions.map(sub => [
      sub.name,
      formatCurrency(sub.amount),
      sub.billingCycle,
      formatCurrency(sub.monthlyEquivalent),
      sub.nextBillingDate ? format(new Date(sub.nextBillingDate), 'MMM d, yyyy') : 'N/A',
      sub.status
    ]),
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30 },
      5: { cellWidth: 20 }
    }
  });
  
  doc.save(`subscriptions-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
