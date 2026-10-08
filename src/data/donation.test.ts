/** Unit tests for the mock donation engine. */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  allDonations,
  createDonation,
  findDonationByReceipt,
  loadLocalDonations,
} from './mock';

beforeEach(() => {
  localStorage.clear();
});

describe('createDonation', () => {
  it('creates a donation with a receipt number and persists it', () => {
    const d = createDonation({
      devoteeName: 'Test Donor',
      phone: '+91 98765 43210',
      amount: 1100,
      purpose: 'Annadaan',
      anonymous: false,
      mode: 'online',
    });
    expect(d.receiptNo).toMatch(/^SDP-D-\d{4}-\d{4}$/);
    expect(d.amount).toBe(1100);
    expect(d.phone).toBe('9876543210');
    expect(loadLocalDonations()).toHaveLength(1);
    expect(findDonationByReceipt(d.receiptNo)?.id).toBe(d.id);
  });

  it('masks the donor name when anonymous', () => {
    const d = createDonation({
      devoteeName: 'Should Be Hidden',
      phone: '9876543210',
      amount: 501,
      purpose: 'General',
      anonymous: true,
      mode: 'offline',
    });
    expect(d.anonymous).toBe(true);
    expect(d.devoteeName).toBe('Anonymous');
  });

  it('rejects zero or negative amounts', () => {
    expect(() =>
      createDonation({
        devoteeName: 'X',
        phone: '9876543210',
        amount: 0,
        purpose: 'General',
        anonymous: false,
        mode: 'online',
      }),
    ).toThrow();
    expect(() =>
      createDonation({
        devoteeName: 'X',
        phone: '9876543210',
        amount: -50,
        purpose: 'General',
        anonymous: false,
        mode: 'online',
      }),
    ).toThrow();
  });

  it('rounds fractional amounts to whole rupees', () => {
    const d = createDonation({
      devoteeName: 'X',
      phone: '9876543210',
      amount: 100.6,
      purpose: 'General',
      anonymous: false,
      mode: 'online',
    });
    expect(d.amount).toBe(101);
  });
});

describe('allDonations', () => {
  it('includes the sample donation and lists newest first', () => {
    createDonation({
      devoteeName: 'New Donor',
      phone: '9876543210',
      amount: 200,
      purpose: 'Gopuja',
      anonymous: false,
      mode: 'online',
    });
    const all = allDonations();
    expect(all.length).toBeGreaterThanOrEqual(2);
    expect(all[0].createdAt >= all[all.length - 1].createdAt).toBe(true);
  });
});
