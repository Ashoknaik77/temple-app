/** Unit tests for the admin store (profile, sevas, events, announcements, auth, stats). */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  addAnnouncement,
  adminLogin,
  adminStats,
  deleteEvent,
  getAnnouncements,
  getEvents,
  getSevas,
  getTempleProfile,
  isAdminAuthed,
  saveEvent,
  saveSeva,
  saveTempleProfile,
  sevas,
} from './mock';
import { toISODate } from '../components/text';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('admin auth', () => {
  it('rejects a wrong PIN and accepts the demo PIN', () => {
    expect(adminLogin('0000')).toBe(false);
    expect(isAdminAuthed()).toBe(false);
    expect(adminLogin('1234')).toBe(true);
    expect(isAdminAuthed()).toBe(true);
  });
});

describe('temple profile', () => {
  it('returns the seeded profile and persists edits', () => {
    expect(getTempleProfile().name.en).toBe('Sri Durga Parameshwari Temple');
    const updated = { ...getTempleProfile(), phone: '+91 11111 22222' };
    saveTempleProfile(updated);
    expect(getTempleProfile().phone).toBe('+91 11111 22222');
  });
});

describe('sevas', () => {
  it('toggles active via saveSeva and keeps the count', () => {
    const before = getSevas().length;
    const s = { ...getSevas()[0], active: false };
    saveSeva(s);
    expect(getSevas()).toHaveLength(before);
    expect(getSevas()[0].active).toBe(false);
  });

  it('adds a brand-new seva', () => {
    const before = getSevas().length;
    saveSeva({
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
  it('adds and deletes events', () => {
    const before = getEvents().length;
    saveEvent({
      id: 'e-test',
      name: { en: 'Test Event', kn: 'ಟೆಸ್ಟ್' },
      desc: { en: '', kn: '' },
      date: '2026-12-01',
      time: '6 PM',
      location: 'Temple',
      rsvpEnabled: false,
    });
    expect(getEvents()).toHaveLength(before + 1);
    deleteEvent('e-test');
    expect(getEvents()).toHaveLength(before);
  });
});

describe('announcements', () => {
  it('prepends new announcements', () => {
    const before = getAnnouncements().length;
    addAnnouncement({
      id: 'a-test',
      text: { en: 'Hello', kn: 'ಹಲೋ' },
      createdAt: toISODate(new Date()),
    });
    const list = getAnnouncements();
    expect(list).toHaveLength(before + 1);
    expect(list[0].id).toBe('a-test');
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
