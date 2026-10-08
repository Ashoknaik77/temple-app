import { jsPDF } from 'jspdf';
import type { CollectionReport } from '../data/mock';

export interface ReportPdfMeta {
  templeName: string;
  templeAddress: string;
  templePhone: string;
  periodLabel: string; // e.g. "Weekly"
  dateRange: string; // e.g. "06-10-2026 – 12-10-2026"
}

/**
 * Builds a temple collection report PDF (English, print-ready).
 * Seva-wise bookings with collected/pending amounts + donations summary.
 */
export function buildReportPdf(
  report: CollectionReport,
  meta: ReportPdfMeta,
): jsPDF {
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

  // Letterhead
  centered(meta.templeName, 16, true, 7);
  centered(meta.templeAddress, 9, false, 5);
  centered(`Ph: ${meta.templePhone}`, 9, false, 4);
  line(5);

  centered('COLLECTION REPORT', 13, true, 6);
  centered(`${meta.periodLabel}  ·  ${meta.dateRange}`, 10, false, 4);
  line(5);

  // Summary box
  need(34);
  doc.setDrawColor(60);
  doc.setLineWidth(0.5);
  const boxY = y;
  doc.rect(M, boxY, contentW, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const col1 = M + 5;
  const col2 = M + contentW / 2 + 5;
  doc.text(`Seva collected: ${inr(report.totalCollected)}`, col1, boxY + 8);
  doc.text(`Seva pending: ${inr(report.totalPending)}`, col1, boxY + 15);
  doc.text(`Donations: ${inr(report.donationsTotal)}`, col1, boxY + 22);
  doc.setFontSize(12);
  doc.text(`Total collected: ${inr(report.grandCollected)}`, col2, boxY + 15);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.totalBookings} bookings`, col2, boxY + 22);
  y = boxY + 36;

  // Seva-wise table
  need(12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Seva-wise collections', M, y);
  y += 6;

  const cols = [
    { w: 62, label: 'Seva' },
    { w: 20, label: 'Bkgs' },
    { w: 34, label: 'Paid (n)' },
    { w: 34, label: 'Collected' },
    { w: 34, label: 'Pending (n)' },
    { w: 34, label: 'Pending' },
  ];
  // header
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
  for (const r of report.rows) {
    need(8);
    x = M + 2;
    const cells = [
      r.sevaName.en,
      String(r.bookings),
      String(r.paidCount),
      inr(r.collected),
      String(r.unpaidCount),
      inr(r.pending),
    ];
    const nameLines = doc.splitTextToSize(cells[0], cols[0].w - 4);
    const rowH = Math.max(7, nameLines.length * 4.5 + 2.5);
    need(rowH);
    doc.text(nameLines, x, y);
    x += cols[0].w;
    for (let i = 1; i < cells.length; i++) {
      doc.text(cells[i], x, y);
      x += cols[i].w;
    }
    y += rowH;
    doc.setDrawColor(220);
    doc.setLineWidth(0.2);
    doc.line(M, y - 2, W - M, y - 2);
  }

  if (report.rows.length === 0) {
    need(10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('No bookings in this period.', M, y);
    y += 8;
  }

  y += 8;
  need(10);
  doc.setDrawColor(120);
  doc.setLineWidth(0.4);
  doc.line(M, y, W - M, y);
  y += 5;
  centered(
    `Generated on ${new Date().toLocaleDateString('en-IN')} · Excludes cancelled bookings.`,
    8,
    false,
    5,
  );

  return doc;
}

/** Generates and downloads the report PDF (filename suitable for WhatsApp sharing). */
export function downloadReportPdf(
  report: CollectionReport,
  meta: ReportPdfMeta,
): void {
  const doc = buildReportPdf(report, meta);
  const stamp = meta.dateRange.replace(/[^0-9]/g, '').slice(0, 8) || 'report';
  doc.save(`collection-report-${stamp}.pdf`);
}
