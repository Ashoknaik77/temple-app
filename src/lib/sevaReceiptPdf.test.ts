import { describe, expect, it } from 'vitest';
import { amountInWords, buildSevaReceiptPdf } from './sevaReceiptPdf';

describe('amountInWords', () => {
  it('converts small amounts', () => {
    expect(amountInWords(50)).toBe('Fifty');
    expect(amountInWords(100)).toBe('One Hundred');
    expect(amountInWords(250)).toBe('Two Hundred Fifty');
    expect(amountInWords(1000)).toBe('One Thousand');
  });

  it('uses Indian numbering for large amounts', () => {
    expect(amountInWords(100000)).toBe('One Lakh');
    expect(amountInWords(250000)).toBe('Two Lakh Fifty Thousand');
    expect(amountInWords(10000000)).toBe('One Crore');
  });

  it('handles zero', () => {
    expect(amountInWords(0)).toBe('Zero');
  });
});

describe('buildSevaReceiptPdf', () => {
  it('builds a PDF document without throwing', () => {
    const doc = buildSevaReceiptPdf({
      templeName: 'Sri Durga Parameshwari Temple',
      templeAddress: 'Koruvail, Kudlu, Kasaragod',
      templePhone: '+91 98765 43210',
      receiptNo: 'SDP-R-2026-0001',
      date: '08-10-2026',
      devoteeName: 'Test Devotee',
      place: 'Kasaragod',
      phone: '9876543210',
      sevaName: 'Archana',
      sevaDate: '09-10-2026',
      sevaTime: '06:00',
      amount: 50,
      collectedBy: 'Ashok',
      bookingCode: 'SDP-20261009-001',
    });
    expect(doc.getNumberOfPages()).toBe(1);
    const out = doc.output('datauristring');
    expect(out.startsWith('data:application/pdf')).toBe(true);
  });
});
