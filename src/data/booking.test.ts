/** Unit tests for the mock booking engine. */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  cancelBooking,
  createBooking,
  findBookingByCode,
  getSlotBooked,
  loadLocalBookings,
  seatsLeft,
  sevas,
} from './mock';

beforeEach(() => {
  localStorage.clear();
});

describe('getSlotBooked / seatsLeft', () => {
  it('is deterministic for the same inputs', () => {
    const a = getSlotBooked('archana', '2026-10-10', '06:00');
    const b = getSlotBooked('archana', '2026-10-10', '06:00');
    expect(a).toBe(b);
  });

  it('stays within capacity bounds', () => {
    for (const s of sevas) {
      for (const t of s.slotTimes) {
        const booked = getSlotBooked(s.id, '2026-10-10', t);
        expect(booked).toBeGreaterThanOrEqual(0);
        expect(booked).toBeLessThanOrEqual(s.capacity);
        const left = seatsLeft(s.id, '2026-10-10', t);
        expect(left).toBe(s.capacity - booked);
      }
    }
  });

  it('returns 0 for unknown seva', () => {
    expect(seatsLeft('nope', '2026-10-10', '06:00')).toBe(0);
  });
});

describe('createBooking', () => {
  it('creates a booking with an SDP code and persists it', () => {
    const b = createBooking({
      sevaId: 'archana',
      date: '2026-10-12',
      time: '06:00',
      devoteeName: 'Test Devotee',
      phone: '+91 98765 43210',
      people: 2,
      payMode: 'payAtTemple',
    });
    expect(b.bookingCode).toMatch(/^SDP-20261012-\d{3}$/);
    expect(b.status).toBe('confirmed');
    expect(b.phone).toBe('9876543210');
    expect(loadLocalBookings()).toHaveLength(1);
    expect(findBookingByCode(b.bookingCode)?.id).toBe(b.id);
  });

  it('requires a name and 10-digit phone (engine normalizes)', () => {
    const b = createBooking({
      sevaId: 'archana',
      date: '2026-10-12',
      time: '08:00',
      devoteeName: '  Trim Me  ',
      phone: '919876543210',
      people: 1,
      payMode: 'online',
    });
    expect(b.devoteeName).toBe('Trim Me');
    expect(b.phone).toBe('9876543210');
  });

  it('throws for unknown seva', () => {
    expect(() =>
      createBooking({
        sevaId: 'nope',
        date: '2026-10-12',
        time: '06:00',
        devoteeName: 'X',
        phone: '9876543210',
        people: 1,
        payMode: 'online',
      }),
    ).toThrow();
  });
});

describe('cancelBooking', () => {
  it('cancels a local booking and keeps it listed', () => {
    const b = createBooking({
      sevaId: 'archana',
      date: '2026-10-12',
      time: '10:00',
      devoteeName: 'Cancel Me',
      phone: '9876543210',
      people: 1,
      payMode: 'payAtTemple',
    });
    expect(cancelBooking(b.id)).toBe(true);
    expect(findBookingByCode(b.bookingCode)?.status).toBe('cancelled');
  });

  it('returns false for unknown id', () => {
    expect(cancelBooking('missing')).toBe(false);
  });
});

describe('booking code uniqueness (regression)', () => {
  it('increments past the sample booking code on the same date', () => {
    const b = createBooking({
      sevaId: 'archana',
      date: '2026-10-08', // same date as sample booking SDP-20261008-001
      time: '06:00',
      devoteeName: 'Unique Code',
      phone: '9876543210',
      people: 1,
      payMode: 'payAtTemple',
    });
    expect(b.bookingCode).toBe('SDP-20261008-002');
  });

  it('keeps incrementing for multiple bookings on one date', () => {
    const mk = (time: string) =>
      createBooking({
        sevaId: 'archana',
        date: '2026-10-09',
        time,
        devoteeName: 'X',
        phone: '9876543210',
        people: 1,
        payMode: 'online',
      });
    expect(mk('06:00').bookingCode).toBe('SDP-20261009-001');
    expect(mk('08:00').bookingCode).toBe('SDP-20261009-002');
  });
});
