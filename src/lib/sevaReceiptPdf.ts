import { jsPDF } from 'jspdf';

export interface SevaReceiptData {
  templeName: string;
  templeAddress: string;
  templePhone: string;
  receiptNo: string;
  date: string; // display date
  devoteeName: string;
  place: string;
  phone: string;
  sevaName: string;
  sevaDate: string;
  sevaTime: string;
  amount: number;
  collectedBy: string;
  bookingCode: string;
}

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return TENS[t] + (o ? ` ${ONES[o]}` : '');
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return (h ? `${ONES[h]} Hundred${rest ? ' ' : ''}` : '') + (rest ? twoDigits(rest) : '');
}

/** Amount in words, Indian numbering (crore/lakh/thousand). */
export function amountInWords(n: number): string {
  const amount = Math.round(Math.abs(n));
  if (amount === 0) return 'Zero';
  const crore = Math.floor(amount / 10000000);
  const lakh = Math.floor((amount % 10000000) / 100000);
  const thousand = Math.floor((amount % 100000) / 1000);
  const rest = amount % 1000;
  const parts: string[] = [];
  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (rest) parts.push(threeDigits(rest));
  return parts.join(' ');
}

/**
 * Builds a standard temple payment receipt PDF (English, print-ready).
 * Returns the jsPDF document; callers save/share it.
 */
export function buildSevaReceiptPdf(d: SevaReceiptData): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const M = 18; // margin
  const contentW = W - M * 2;
  let y = 20;

  const centered = (text: string, size: number, bold = false, gap = 6) => {
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
  const field = (label: string, value: string, size = 11) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(size);
    const lw = doc.getTextWidth(`${label}: `);
    doc.text(`${label}:`, M, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(value, contentW - lw);
    doc.text(lines, M + lw, y);
    y += lines.length * 5.5 + 2.5;
  };

  // Letterhead
  centered(d.templeName, 18, true, 8);
  centered(d.templeAddress, 10, false, 5);
  centered(`Ph: ${d.templePhone}`, 10, false, 4);
  line(6);

  centered('SEVA PAYMENT RECEIPT', 14, true, 8);

  // Receipt no + date row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Receipt No: ${d.receiptNo}`, M, y);
  const dateStr = `Date: ${d.date}`;
  doc.text(dateStr, W - M - doc.getTextWidth(dateStr), y);
  y += 8;
  line(6);

  field('Received from', d.devoteeName);
  field('Place', d.place);
  field('Phone', d.phone);
  field('Towards', `${d.sevaName} (on ${d.sevaDate} at ${d.sevaTime})`);
  y += 2;

  // Amount box
  doc.setDrawColor(60);
  doc.setLineWidth(0.6);
  const boxH = 20;
  doc.rect(M, y - 5, contentW, boxH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Rs. ${d.amount.toLocaleString('en-IN')}/-`, M + 4, y + 3);
  doc.setFontSize(10);
  const words = `Rupees ${amountInWords(d.amount)} Only`;
  const wLines = doc.splitTextToSize(words, contentW - 8);
  doc.setFont('helvetica', 'normal');
  doc.text(wLines, M + 4, y + 9);
  y += boxH + 4;

  field('Booking Ref', d.bookingCode);
  field('Collected by', d.collectedBy);
  y += 10;

  // Signature area
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Authorised Signatory', W - M - doc.getTextWidth('Authorised Signatory'), y + 12);
  y += 20;
  line(4);
  centered('Thank you for your devotion. May Goddess Durga bless you.', 9, false, 5);
  centered('This is a computer-generated receipt.', 8, false, 5);

  return doc;
}

/** Generates and downloads the receipt PDF (filename suitable for WhatsApp sharing). */
export function downloadSevaReceiptPdf(d: SevaReceiptData): void {
  const doc = buildSevaReceiptPdf(d);
  doc.save(`${d.receiptNo}.pdf`);
}
