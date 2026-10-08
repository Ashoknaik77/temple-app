/** Unit tests for the expense module (local backend — no network). */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  defaultExpenseCategories,
  deleteExpenseCategory,
  expenseSummary,
  getExpenseCategories,
  getExpenses,
  initData,
  quarterRange,
  restoreExpense,
  saveExpense,
  saveExpenseCategory,
  softDeleteExpense,
} from './mock';

beforeEach(async () => {
  localStorage.clear();
  await initData({ backend: 'local' });
});

const base = {
  date: '2026-10-08',
  categoryId: 'cat-01',
  amount: 500,
  paymentMode: 'Cash' as const,
  paidTo: 'Flower vendor',
};

describe('expense categories', () => {
  it('seeds the 26 default categories', () => {
    expect(defaultExpenseCategories).toHaveLength(26);
    const names = getExpenseCategories().map((c) => c.name);
    expect(names).toContain('Pooja Materials');
    expect(names).toContain('Electricity Bill');
    expect(names).toContain('Other');
  });

  it('adds a new category', async () => {
    const cat = await saveExpenseCategory({ name: 'Test Category' });
    expect(cat.id).toBeTruthy();
    expect(getExpenseCategories().some((c) => c.id === cat.id)).toBe(true);
  });

  it('rejects duplicate category names', async () => {
    await expect(saveExpenseCategory({ name: 'Pooja Materials' })).rejects.toThrow(
      'category exists',
    );
  });

  it('renames a category', async () => {
    const cat = await saveExpenseCategory({ name: 'Rename Me' });
    const updated = await saveExpenseCategory({ id: cat.id, name: 'Renamed' });
    expect(updated.name).toBe('Renamed');
  });

  it('deactivates a category (hidden from default list)', async () => {
    const cat = await saveExpenseCategory({ name: 'Temp Cat' });
    await saveExpenseCategory({ id: cat.id, name: cat.name, active: false });
    expect(getExpenseCategories().some((c) => c.id === cat.id)).toBe(false);
    expect(getExpenseCategories(true).some((c) => c.id === cat.id)).toBe(true);
  });

  it('deletes a category', async () => {
    const cat = await saveExpenseCategory({ name: 'Delete Me' });
    await deleteExpenseCategory(cat.id);
    expect(getExpenseCategories(true).some((c) => c.id === cat.id)).toBe(false);
  });
});

describe('saveExpense', () => {
  it('creates an expense with audit fields', async () => {
    const e = await saveExpense(base, 'Srini');
    expect(e.id).toBeTruthy();
    expect(e.categoryName).toBe('Pooja Materials');
    expect(e.deleted).toBe(false);
    expect(e.createdBy).toBe('Srini');
    expect(e.createdAt).toBeTruthy();
  });

  it('requires Other to carry a custom note', async () => {
    const other = getExpenseCategories().find((c) => c.name === 'Other')!;
    await expect(saveExpense({ ...base, categoryId: other.id }, 'Admin')).rejects.toThrow();
    const e = await saveExpense(
      { ...base, categoryId: other.id, customNote: 'Special offering' },
      'Admin',
    );
    expect(e.customNote).toBe('Special offering');
  });

  it('rejects invalid amounts', async () => {
    await expect(saveExpense({ ...base, amount: 0 }, 'Admin')).rejects.toThrow('invalid amount');
    await expect(saveExpense({ ...base, amount: -5 }, 'Admin')).rejects.toThrow('invalid amount');
  });

  it('rejects missing paidTo', async () => {
    await expect(saveExpense({ ...base, paidTo: '  ' }, 'Admin')).rejects.toThrow();
  });

  it('edits an expense and records updatedBy', async () => {
    const e = await saveExpense(base, 'Srini');
    const updated = await saveExpense({ ...base, id: e.id, amount: 750, note: 'revised' }, 'Asha');
    expect(updated.amount).toBe(750);
    expect(updated.note).toBe('revised');
    expect(updated.updatedBy).toBe('Asha');
    expect(getExpenses()).toHaveLength(1);
  });

  it('normalizes vendor phone digits', async () => {
    const e = await saveExpense({ ...base, vendorPhone: '+91 98765 43210' }, 'Admin');
    expect(e.vendorPhone).toBe('9876543210');
  });
});

describe('soft delete', () => {
  it('hides deleted expenses by default but keeps them for audit', async () => {
    const e = await saveExpense(base, 'Srini');
    await softDeleteExpense(e.id, 'Srini');
    expect(getExpenses()).toHaveLength(0);
    const all = getExpenses(true);
    expect(all).toHaveLength(1);
    expect(all[0].deleted).toBe(true);
    expect(all[0].deletedBy).toBe('Srini');
  });

  it('restores a deleted expense', async () => {
    const e = await saveExpense(base, 'Srini');
    await softDeleteExpense(e.id, 'Srini');
    await restoreExpense(e.id, 'Asha');
    expect(getExpenses()).toHaveLength(1);
    expect(getExpenses()[0].deleted).toBe(false);
  });
});

describe('expenseSummary', () => {
  it('aggregates totals, counts and per-category breakdown', async () => {
    await saveExpense({ ...base, date: '2026-10-05', amount: 500 }, 'Admin');
    await saveExpense({ ...base, date: '2026-10-06', amount: 1500, categoryId: 'cat-05' }, 'Admin');
    await saveExpense({ ...base, date: '2026-09-01', amount: 999 }, 'Admin'); // outside
    const s = expenseSummary('2026-10-01', '2026-10-31');
    expect(s.total).toBe(2000);
    expect(s.count).toBe(2);
    expect(s.byCategory).toHaveLength(2);
    expect(s.byCategory[0].total).toBe(1500); // sorted desc
    expect(s.avgPerDay).toBe(Math.round(2000 / 31));
  });

  it('excludes soft-deleted expenses', async () => {
    const e = await saveExpense({ ...base, amount: 500 }, 'Admin');
    await softDeleteExpense(e.id, 'Admin');
    const s = expenseSummary('2026-10-01', '2026-10-31');
    expect(s.total).toBe(0);
    expect(s.count).toBe(0);
  });
});

describe('quarterRange', () => {
  it('computes Q4 2026', () => {
    const r = quarterRange('2026-10-08');
    expect(r.start).toBe('2026-10-01');
    expect(r.end).toBe('2026-12-31');
    expect(r.label).toBe('Q4 2026');
  });

  it('computes Q1 with Feb end', () => {
    const r = quarterRange('2026-02-15');
    expect(r.start).toBe('2026-01-01');
    expect(r.end).toBe('2026-03-31');
    expect(r.label).toBe('Q1 2026');
  });
});
