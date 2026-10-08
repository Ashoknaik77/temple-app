/** Unit tests for the booking engine (local backend — no network). */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  cancelBooking,
  createBooking,
  findBookingByCode,
  getSlotBooked,
  initData,
  issueSevaReceipt,
  loadLocalBookings,
  seatsLeft,
  setPaymentStatus,
  sevas,
} from './mock';

beforeEach(async () => {
  localStorage.clear();
  await initData({ backend: 'local' });
});

describe('getSlotBooked / seatsLeft', () => {
  it('is stable for the same inputs without intervening writes', () => {
    const a = getSlotBooked('archana', '2026-10-10', '06:00');
    const b = getSlotBooked('archana', '2026-10-10', '06:00');
    expect(a).toBe(b);
  });

  it('counts real confirmed bookings against capacity', async () => {
    expect(getSlotBooked('archana', '2026-10-10', '06:00')).toBe(0);
    await createBooking({
      sevaId: 'archana',
      date: '2026-10-10',
      time: '06:00',
      devoteeName: 'Counter',
      phone: '9876543210',
      place: 'Kasaragod',
      payMode: 'online',
    });
    expect(getSlotBooked('archana', '2026-10-10', '06:00')).toBe(1);
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
  it('creates a booking with an SDP code and persists it', async () => {
    const b = await createBooking({
      sevaId: 'archana',
      date: '2026-10-12',
      time: '06:00',
      devoteeName: 'Test Devotee',
      phone: '+91 98765 43210',
      place: 'Kasaragod',
      note: 'Test note',
      payMode: 'payAtTemple',
    });
    expect(b.bookingCode).toMatch(/^SDP-20261012-\d{3}$/);
    expect(b.status).toBe('confirmed');
    expect(b.paymentStatus).toBe('unpaid');
    expect(b.phone).toBe('9876543210');
    expect(b.place).toBe('Kasaragod');
    expect(b.note).toBe('Test note');
    expect(loadLocalBookings()).toHaveLength(1);
    expect(findBookingByCode(b.bookingCode)?.id).toBe(b.id);
  });

  it('requires a name and 10-digit phone (engine normalizes)', async () => {
    const b = await createBooking({
      sevaId: 'archana',
      date: '2026-10-12',
      time: '08:00',
      devoteeName: '  Trim Me  ',
      phone: '919876543210',
      place: 'Kasaragod',
      payMode: 'online',
    });
    expect(b.devoteeName).toBe('Trim Me');
    expect(b.phone).toBe('9876543210');
  });

  it('requires a place', async () => {
    await expect(
      createBooking({
        sevaId: 'archana',
        date: '2026-10-12',
        time: '06:00',
        devoteeName: 'No Place',
        phone: '9876543210',
        place: '   ',
        payMode: 'payAtTemple',
      }),
    ).rejects.toThrow();
  });

  it('throws for unknown seva', async () => {
    await expect(
      createBooking({
        sevaId: 'nope',
        date: '2026-10-12',
        time: '06:00',
        devoteeName: 'X',
        phone: '9876543210',
        place: 'Kasaragod',
        payMode: 'online',
      }),
    ).rejects.toThrow();
  });

  it('has no per-slot booking limit (slots never fill up)', async () => {
    // naga-seva capacity is 8; booking beyond capacity must still succeed
    for (let i = 0; i < 10; i++) {
      await createBooking({
        sevaId: 'naga-seva',
        date: '2026-10-13',
        time: '09:00',
        devoteeName: `Devotee ${i}`,
        phone: '9876543210',
        place: 'Kasaragod',
        payMode: 'online',
      });
    }
    const extra = await createBooking({
      sevaId: 'naga-seva',
      date: '2026-10-13',
      time: '09:00',
      devoteeName: 'One More',
      phone: '9876543210',
      place: 'Kasaragod',
      payMode: 'online',
    });
    expect(extra.bookingCode).toMatch(/^SDP-20261013-/);
  });
});

describe('cancelBooking', () => {
  it('cancels a local booking and keeps it listed', async () => {
    const b = await createBooking({
      sevaId: 'archana',
      date: '2026-10-12',
      time: '10:00',
      devoteeName: 'Cancel Me',
      phone: '9876543210',
      place: 'Kasaragod',
      payMode: 'payAtTemple',
    });
    expect(await cancelBooking(b.id)).toBe(true);
    expect(findBookingByCode(b.bookingCode)?.status).toBe('cancelled');
  });

  it('returns false for unknown id', async () => {
    expect(await cancelBooking('missing')).toBe(false);
  });
});

describe('payment status (admin marks paid after UPI/cash)', () => {
  it('lets the admin mark a booking paid and back to unpaid', async () => {
    const b = await createBooking({
      sevaId: 'archana',
      date: '2026-10-14',
      time: '06:00',
      devoteeName: 'Payer',
      phone: '9876543210',
      place: 'Kasaragod',
      payMode: 'payAtTemple',
    });
    expect(b.paymentStatus).toBe('unpaid');
    expect(await setPaymentStatus(b.id, 'paid')).toBe(true);
    expect(findBookingByCode(b.bookingCode)?.paymentStatus).toBe('paid');
    expect(await setPaymentStatus(b.id, 'unpaid')).toBe(true);
    expect(findBookingByCode(b.bookingCode)?.paymentStatus).toBe('unpaid');
  });

  it('returns false for unknown id', async () => {
    expect(await setPaymentStatus('missing', 'paid')).toBe(false);
  });

  it('issues sequential receipt numbers only for paid bookings', async () => {
    const unpaid = await createBooking({
      sevaId: 'archana',
      date: '2026-10-24',
      time: '06:00',
      devoteeName: 'No Receipt',
      phone: '9876543210',
      place: 'Kasaragod',
      payMode: 'payAtTemple',
    });
    expect(await issueSevaReceipt(unpaid.id)).toBeNull();

    const paid = await createBooking({
      sevaId: 'archana',
      date: '2026-10-24',
      time: '08:00',
      devoteeName: 'Receipt One',
      phone: '9876543210',
      place: 'Kasaragod',
      payMode: 'payAtTemple',
      paymentStatus: 'paid',
      paidBy: 'Retest Owner',
    });
    const r1 = await issueSevaReceipt(paid.id);
    expect(r1).toMatch(/^SDP-R-2026-\d{4}$/);
    // re-issuing returns the same number (stable for reprints)
    expect(await issueSevaReceipt(paid.id)).toBe(r1);
    expect(findBookingByCode(paid.bookingCode)?.receiptNo).toBe(r1);

    const paid2 = await createBooking({
      sevaId: 'archana',
      date: '2026-10-24',
      time: '10:00',
      devoteeName: 'Receipt Two',
      phone: '9876543210',
      place: 'Kasaragod',
      payMode: 'payAtTemple',
      paymentStatus: 'paid',
    });
    const r2 = await issueSevaReceipt(paid2.id);
    expect(r2).not.toBe(r1);
  });

  it('records which admin marked a booking paid', async () => {
    const b = await createBooking({
      sevaId: 'archana',
      date: '2026-10-23',
      time: '06:00',
      devoteeName: 'Payer Two',
      phone: '9876543210',
      place: 'Kasaragod',
      payMode: 'payAtTemple',
    });
    expect(await setPaymentStatus(b.id, 'paid', 'Retest Owner')).toBe(true);
    const after = findBookingByCode(b.bookingCode)!;
    expect(after.paymentStatus).toBe('paid');
    expect(after.paidBy).toBe('Retest Owner');
    expect(after.paidAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // marking unpaid clears the collector
    expect(await setPaymentStatus(b.id, 'unpaid')).toBe(true);
    const cleared = findBookingByCode(b.bookingCode)!;
    expect(cleared.paymentStatus).toBe('unpaid');
    expect(cleared.paidBy).toBeUndefined();
  });

  it('supports admin-created bookings with payment collected on the spot', async () => {
    const b = await createBooking({
      sevaId: 'archana',
      date: '2026-10-14',
      time: '08:00',
      devoteeName: 'Walk-in Devotee',
      phone: '9876543210',
      place: 'Kasaragod',
      payMode: 'payAtTemple',
      paymentStatus: 'paid',
    });
    expect(b.paymentStatus).toBe('paid');
    expect(findBookingByCode(b.bookingCode)?.paymentStatus).toBe('paid');
  });
});

describe('booking code uniqueness (regression)', () => {
  it('increments past the sample booking code on the same date', async () => {
    const b = await createBooking({
      sevaId: 'archana',
      date: '2026-10-08', // same date as sample booking SDP-20261008-001
      time: '06:00',
      devoteeName: 'Unique Code',
      phone: '9876543210',
      place: 'Kasaragod',
      payMode: 'payAtTemple',
    });
    expect(b.bookingCode).toBe('SDP-20261008-002');
  });

  it('keeps incrementing for multiple bookings on one date', async () => {
    const mk = (time: string) =>
      createBooking({
        sevaId: 'archana',
        date: '2026-10-09',
        time,
        devoteeName: 'X',
        phone: '9876543210',
        place: 'Kasaragod',
        payMode: 'online',
      });
    expect((await mk('06:00')).bookingCode).toBe('SDP-20261009-001');
    expect((await mk('08:00')).bookingCode).toBe('SDP-20261009-002');
  });
});
