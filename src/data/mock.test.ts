/** Unit tests for data selectors and mock-data integrity. */
import { describe, it, expect } from 'vitest';
import {
  announcements,
  events,
  myBookings,
  myDonations,
  nextMajorEvent,
  sevas,
  templeProfile,
} from './mock';

describe('nextMajorEvent', () => {
  it('returns the nearest upcoming event', () => {
    const e = nextMajorEvent('2026-10-08');
    expect(e?.id).toBe('navaratri-2026');
  });

  it('skips past events', () => {
    const e = nextMajorEvent('2026-10-21');
    expect(e?.id).toBe('deepavali-2026');
  });

  it('returns null when nothing is upcoming', () => {
    expect(nextMajorEvent('2027-01-01')).toBeNull();
  });
});

describe('mock data integrity', () => {
  it('temple profile has bilingual name and tagline', () => {
    expect(templeProfile.name.en.length).toBeGreaterThan(0);
    expect(templeProfile.name.kn.length).toBeGreaterThan(0);
    expect(templeProfile.tagline.en.length).toBeGreaterThan(0);
  });

  it('every seva is valid: bilingual name, non-negative price, capacity, slots', () => {
    expect(sevas.length).toBeGreaterThan(0);
    for (const s of sevas) {
      expect(s.name.en.length).toBeGreaterThan(0);
      expect(s.name.kn.length).toBeGreaterThan(0);
      expect(s.price).toBeGreaterThanOrEqual(0);
      expect(s.capacity).toBeGreaterThan(0);
      expect(s.slotTimes.length).toBeGreaterThan(0);
      for (const t of s.slotTimes) {
        expect(t).toMatch(/^\d{2}:\d{2}$/);
      }
    }
  });

  it('events are well-formed', () => {
    for (const e of events) {
      expect(e.name.en.length).toBeGreaterThan(0);
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('bookings reference known sevas and carry a payment status', () => {
    const sevaIds = new Set(sevas.map((s) => s.id));
    for (const b of myBookings) {
      expect(sevaIds.has(b.sevaId)).toBe(true);
      expect(b.bookingCode.length).toBeGreaterThan(0);
      expect(['unpaid', 'paid']).toContain(b.paymentStatus);
    }
  });

  it('donations have positive amounts and receipt numbers', () => {
    for (const d of myDonations) {
      expect(d.amount).toBeGreaterThan(0);
      expect(d.receiptNo.length).toBeGreaterThan(0);
    }
  });

  it('announcements are bilingual', () => {
    for (const a of announcements) {
      expect(a.text.en.length).toBeGreaterThan(0);
      expect(a.text.kn.length).toBeGreaterThan(0);
    }
  });
});
