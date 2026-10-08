/** Unit tests for the admin store (profile, sevas, events, announcements, auth, stats). */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  addAnnouncement,
  cancelBooking,
  collectionReport,
  completeBooking,
  createBooking,
  adminStats,
  createAdminUser,
  currentAdmin,
  adminLogout,
  deleteAnnouncement,
  deleteEvent,
  getAdmins,
  getAnnouncements,
  getEvents,
  getSevas,
  getTempleProfile,
  hasAnyAdmin,
  initData,
  isAdminAuthed,
  isSuperAdmin,
  saveEvent,
  saveSeva,
  saveTempleProfile,
  setAdminActive,
  setPaymentStatus,
  sevas,
  verifyAdminLogin,
} from './mock';
import { toISODate } from '../components/text';

beforeEach(async () => {
  localStorage.clear();
  sessionStorage.clear();
  await initData({ backend: 'local' });
});

describe('admin users', () => {
  it('starts with no admins (first-run setup)', () => {
    expect(hasAnyAdmin()).toBe(false);
    expect(isAdminAuthed()).toBe(false);
  });

  it('creates a super admin and logs in with phone + PIN', async () => {
    const a = await createAdminUser({
      name: 'Super User',
      phone: '98765 43210',
      pin: '1234',
      role: 'super',
    });
    expect(a.phone).toBe('9876543210');
    expect(a.role).toBe('super');
    expect(a.pinHash).not.toContain('1234');
    expect(a.pinHash).toMatch(/^[0-9a-f]{64}$/);
    expect(hasAnyAdmin()).toBe(true);

    expect(await verifyAdminLogin('9876543210', '0000')).toBeNull();
    const ok = await verifyAdminLogin('9876543210', '1234');
    expect(ok?.name).toBe('Super User');
    expect(isAdminAuthed()).toBe(true);
    expect(isSuperAdmin()).toBe(true);
    expect(currentAdmin()?.phone).toBe('9876543210');
    adminLogout();
    expect(isAdminAuthed()).toBe(false);
  });

  it('rejects duplicate phone numbers', async () => {
    await createAdminUser({ name: 'One', phone: '9999999999', pin: '1111', role: 'admin' });
    await expect(
      createAdminUser({ name: 'Two', phone: '9999999999', pin: '2222', role: 'admin' }),
    ).rejects.toThrow('already registered');
  });

  it('rejects bad phone and short PIN', async () => {
    await expect(
      createAdminUser({ name: 'X', phone: '12345', pin: '1234', role: 'admin' }),
    ).rejects.toThrow();
    await expect(
      createAdminUser({ name: 'X', phone: '8888888888', pin: '12', role: 'admin' }),
    ).rejects.toThrow();
  });

  it('deactivates an admin (login then fails)', async () => {
    await createAdminUser({ name: 'Temp', phone: '7777777777', pin: '4321', role: 'admin' });
    expect(await verifyAdminLogin('7777777777', '4321')).not.toBeNull();
    expect(await setAdminActive('7777777777', false)).toBe(true);
    expect(await verifyAdminLogin('7777777777', '4321')).toBeNull();
    expect(getAdmins().find((a) => a.phone === '7777777777')?.active).toBe(false);
  });
});

describe('announcements', () => {
  it('adds and deletes announcements', async () => {
    const before = getAnnouncements().length;
    await deleteAnnouncement('a1');
    expect(getAnnouncements()).toHaveLength(before - 1);
    expect(getAnnouncements().some((a) => a.id === 'a1')).toBe(false);
  });
});

describe('temple profile', () => {
  it('returns the seeded profile and persists edits', async () => {
    expect(getTempleProfile().name.en).toBe('Sri Durga Parameshwari Temple');
    const updated = { ...getTempleProfile(), phone: '+91 11111 22222' };
    await saveTempleProfile(updated);
    expect(getTempleProfile().phone).toBe('+91 11111 22222');
  });
});

describe('sevas', () => {
  it('toggles active via saveSeva and keeps the count', async () => {
    const before = getSevas().length;
    const s = { ...getSevas()[0], active: false };
    await saveSeva(s);
    expect(getSevas()).toHaveLength(before);
    expect(getSevas()[0].active).toBe(false);
  });

  it('adds a brand-new seva', async () => {
    const before = getSevas().length;
    await saveSeva({
      id: 'test-seva',
      name: { en: 'Test', kn: 'ಟೆಸ್ಟ್' },
      desc: { en: 'd', kn: 'd' },
      price: 10,
      durationMin: 10,
      capacity: 5,
      slotTimes: ['06:00'],
      active: true,
    });
    expect(getSevas()).toHaveLength(before + 1);
    expect(getSevas().some((x) => x.id === 'test-seva')).toBe(true);
  });
});

describe('events', () => {
  it('adds and deletes events', async () => {
    const before = getEvents().length;
    await saveEvent({
      id: 'e-test',
      name: { en: 'Test Event', kn: 'ಟೆಸ್ಟ್' },
      desc: { en: '', kn: '' },
      date: '2026-12-01',
      time: '6 PM',
      location: 'Temple',
      rsvpEnabled: false,
    });
    expect(getEvents()).toHaveLength(before + 1);
    await deleteEvent('e-test');
    expect(getEvents()).toHaveLength(before);
  });
});

describe('announcements', () => {
  it('prepends new announcements', async () => {
    const before = getAnnouncements().length;
    await addAnnouncement({
      id: 'a-test',
      text: { en: 'Hello', kn: 'ಹಲೋ' },
      createdAt: toISODate(new Date()),
    });
    const list = getAnnouncements();
    expect(list).toHaveLength(before + 1);
    expect(list[0].id).toBe('a-test');
  });
});

describe('collectionReport', () => {
  it('totals seva-wise bookings, paid/pending and donations for a range', async () => {
    // archana = ₹50, naga-seva = ₹500 (seed prices)
    const b1 = await createBooking({
      sevaId: 'archana', date: '2026-10-20', time: '06:00',
      devoteeName: 'Paid One', phone: '9876543210', place: 'Kasaragod',
      payMode: 'payAtTemple', paymentStatus: 'paid',
    });
    await createBooking({
      sevaId: 'archana', date: '2026-10-20', time: '08:00',
      devoteeName: 'Unpaid One', phone: '9876543210', place: 'Kasaragod',
      payMode: 'payAtTemple',
    });
    await createBooking({
      sevaId: 'naga-seva', date: '2026-10-21', time: '09:00',
      devoteeName: 'Paid Two', phone: '9876543210', place: 'Kasaragod',
      payMode: 'payAtTemple', paymentStatus: 'paid',
    });
    // outside the range — must not count
    await createBooking({
      sevaId: 'archana', date: '2026-11-01', time: '06:00',
      devoteeName: 'Later', phone: '9876543210', place: 'Kasaragod',
      payMode: 'payAtTemple',
    });
    // mark the first booking done — payment can still be toggled afterwards
    expect(await completeBooking(b1.id)).toBe(true);
    expect(await setPaymentStatus(b1.id, 'unpaid')).toBe(true);
    expect(await setPaymentStatus(b1.id, 'paid')).toBe(true);

    const r = collectionReport('2026-10-20', '2026-10-21');
    const archana = r.rows.find((x) => x.sevaId === 'archana')!;
    expect(archana.bookings).toBe(2);
    expect(archana.paidCount).toBe(1);
    expect(archana.unpaidCount).toBe(1);
    expect(archana.collected).toBe(50);
    expect(archana.pending).toBe(50);
    const naga = r.rows.find((x) => x.sevaId === 'naga-seva')!;
    expect(naga.collected).toBe(500);
    expect(r.totalBookings).toBe(3);
    expect(r.totalCollected).toBe(550);
    expect(r.totalPending).toBe(50);
    expect(r.grandCollected).toBe(r.totalCollected + r.donationsTotal);
  });

  it('excludes cancelled bookings', async () => {
    const b = await createBooking({
      sevaId: 'archana', date: '2026-10-22', time: '06:00',
      devoteeName: 'Cancel Row', phone: '9876543210', place: 'Kasaragod',
      payMode: 'payAtTemple', paymentStatus: 'paid',
    });
    await cancelBooking(b.id);
    const r = collectionReport('2026-10-22', '2026-10-22');
    expect(r.rows.find((x) => x.sevaId === 'archana')).toBeUndefined();
    expect(r.totalBookings).toBe(0);
  });
});

describe('adminStats', () => {
  it('returns numeric stats', () => {
    const stats = adminStats(toISODate(new Date()));
    expect(stats.donationsToday).toBeGreaterThanOrEqual(0);
    expect(stats.bookingsToday).toBeGreaterThanOrEqual(0);
    expect(stats.pendingCount).toBeGreaterThanOrEqual(0);
    expect(stats.activeSevas).toBe(sevas.length);
    expect(stats.upcomingEvents).toBeGreaterThanOrEqual(0);
  });
});
