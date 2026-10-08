import { describe, expect, it } from 'vitest';
import { buildReportPdf } from './reportPdf';
import type { CollectionReport } from '../data/mock';

const sample: CollectionReport = {
  from: '2026-10-01',
  to: '2026-10-31',
  rows: [
    {
      sevaId: 'archana',
      sevaName: { en: 'Archana', kn: 'ಅರ್ಚನೆ' },
      price: 50,
      bookings: 3,
      paidCount: 2,
      unpaidCount: 1,
      collected: 100,
      pending: 50,
    },
  ],
  totalBookings: 3,
  totalCollected: 100,
  totalPending: 50,
  donationsTotal: 200,
  grandCollected: 300,
};

describe('buildReportPdf', () => {
  it('builds a PDF document without throwing', () => {
    const doc = buildReportPdf(sample, {
      templeName: 'Sri Durga Parameshwari Temple',
      templeAddress: 'Koruvail, Kudlu, Kasaragod',
      templePhone: '+91 98765 43210',
      periodLabel: 'Monthly',
      dateRange: '01-10-2026 – 31-10-2026',
    });
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    expect(doc.output('datauristring').startsWith('data:application/pdf')).toBe(true);
  });

  it('handles an empty report', () => {
    const doc = buildReportPdf(
      { ...sample, rows: [], totalBookings: 0, totalCollected: 0, totalPending: 0 },
      {
        templeName: 'T',
        templeAddress: 'A',
        templePhone: 'P',
        periodLabel: 'Daily',
        dateRange: '08-10-2026',
      },
    );
    expect(doc.getNumberOfPages()).toBe(1);
  });
});
