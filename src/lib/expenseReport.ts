import { jsPDF } from 'jspdf';
import type { Expense } from '../types';
import type { ExpenseSummary } from '../data/mock';

/** CSV export of the (filtered) expense list — opens in Excel/Sheets. */
export function downloadExpensesCsv(expenses: Expense[], filename: string): void {
  const head = [
    'Date',
    'Category',
    'Amount (INR)',
    'Payment Mode',
    'Paid To',
    'Vendor Phone',
    'Invoice No',
    'Note',
    'Created By',
    'Created At',
  ];
  const esc = (v: string | number | undefined) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = expenses.map((e) =>
    [
      e.date,
      e.categoryName + (e.customNote ? ` (${e.customNote})` : ''),
      e.amount,
      e.paymentMode,
      e.paidTo,
      e.vendorPhone ?? '',
      e.invoiceNo ?? '',
      e.note ?? '',
      e.createdBy ?? '',
      e.createdAt,
    ]
      .map(esc)
      .join(','),
  );
  const blob = new Blob([[head.map(esc).join(','), ...rows].join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export interface ExpenseReportMeta {
  templeName: string;
  templeAddress: string;
  templePhone: string;
  periodLabel: string; // e.g. "Monthly"
  dateRange: string;
}

/** Formatted expense report PDF (trust-committee / audit friendly). */
export function downloadExpenseReportPdf(
  summary: ExpenseSummary,
  expenses: Expense[],
  meta: ExpenseReportMeta,
): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const M = 15;
  const contentW = W - M * 2;
  const bottom = 285;
  let y = 18;

  const need = (h: number) => {
    if (y + h > bottom) {
      doc.addPage();
      y = 18;
    }
  };
  const centered = (text: string, size: number, bold = false, gap = 6) => {
    need(gap + 2);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.text(text, W / 2, y, { align: 'center' });
    y += gap;
  };
  const line = (gap = 4) => {
    doc.setDrawColor(120);
    doc.setLineWidth(0.4);
    doc.line(M, y, W - M, y);
    y += gap;
  };
  const inr = (n: number) => `Rs. ${n.toLocaleString('en-IN')}/-`;

  centered(meta.templeName, 16, true, 7);
  centered(meta.templeAddress, 9, false, 5);
  centered(`Ph: ${meta.templePhone}`, 9, false, 4);
  line(5);

  centered('EXPENSE REPORT', 13, true, 6);
  centered(`${meta.periodLabel}  ·  ${meta.dateRange}`, 10, false, 4);
  line(5);

  // Summary box
  need(30);
  const boxY = y;
  doc.setDrawColor(60);
  doc.setLineWidth(0.5);
  doc.rect(M, boxY, contentW, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Total spent: ${inr(summary.total)}`, M + 5, boxY + 8);
  doc.text(`Expenses: ${summary.count}`, M + 5, boxY + 15);
  doc.text(`Avg / day: ${inr(summary.avgPerDay)}`, M + 5, boxY + 22);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Excludes deleted entries.', M + contentW / 2 + 5, boxY + 15);
  y = boxY + 32;

  // Category breakdown
  if (summary.byCategory.length > 0) {
    need(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Spend by category', M, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (const c of summary.byCategory) {
      need(7);
      const barW = ((c.total / Math.max(1, summary.total)) * (contentW - 70)).toFixed(1);
      doc.text(doc.splitTextToSize(c.name, 62)[0], M, y);
      doc.setFillColor(180, 60, 40);
      doc.rect(M + 65, y - 3.5, Number(barW), 4, 'F');
      doc.text(inr(c.total), M + 68 + Number(barW), y);
      y += 6.5;
    }
    y += 3;
  }

  // Expense table
  need(10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Expenses', M, y);
  y += 6;

  const cols = [
    { w: 24, label: 'Date' },
    { w: 52, label: 'Category' },
    { w: 28, label: 'Amount' },
    { w: 20, label: 'Mode' },
    { w: 56, label: 'Paid to / Note' },
  ];
  need(8);
  doc.setFillColor(245, 240, 230);
  doc.rect(M, y - 4, contentW, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  let x = M + 2;
  for (const c of cols) {
    doc.text(c.label, x, y + 1);
    x += c.w;
  }
  y += 8;

  doc.setFont('helvetica', 'normal');
  for (const e of expenses) {
    const catLines = doc.splitTextToSize(e.categoryName, cols[1].w - 4);
    const toLines = doc.splitTextToSize(
      e.paidTo + (e.note ? ` — ${e.note}` : ''),
      cols[4].w - 4,
    );
    const rowH = Math.max(7, Math.max(catLines.length, toLines.length) * 4.5 + 2.5);
    need(rowH);
    x = M + 2;
    doc.text(e.date.split('-').reverse().join('-'), x, y);
    x += cols[0].w;
    doc.text(catLines, x, y);
    x += cols[1].w;
    doc.text(inr(e.amount), x, y);
    x += cols[2].w;
    doc.text(e.paymentMode, x, y);
    x += cols[3].w;
    doc.text(toLines, x, y);
    y += rowH;
    doc.setDrawColor(220);
    doc.setLineWidth(0.2);
    doc.line(M, y - 2, W - M, y - 2);
  }

  if (expenses.length === 0) {
    need(10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('No expenses in this period.', M, y);
    y += 8;
  }

  y += 8;
  need(10);
  line(5);
  centered(
    `Generated on ${new Date().toLocaleDateString('en-IN')} · For trust committee / audit use.`,
    8,
    false,
    5,
  );

  const stamp = summary.from.replace(/-/g, '') + '-' + summary.to.replace(/-/g, '');
  doc.save(`expense-report-${stamp}.pdf`);
}
