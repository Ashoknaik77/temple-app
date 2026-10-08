import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../i18n';
import {
  expenseSummary,
  getExpenseCategories,
  getExpenses,
  getTempleProfile,
  monthRange,
  quarterRange,
  restoreExpense,
  softDeleteExpense,
  currentAdmin,
  weekRange,
} from '../../data/mock';
import type { Expense, ExpensePaymentMode } from '../../types';
import { downloadExpenseReportPdf, downloadExpensesCsv } from '../../lib/expenseReport';
import { ScreenHeader } from '../../components/ScreenHeader';
import { fmtDate, toISODate } from '../../components/text';

type Period = 'day' | 'week' | 'month' | 'quarter' | 'year';

const MODES: ExpensePaymentMode[] = ['Cash', 'UPI', 'Bank', 'Cheque', 'Card'];

/** Admin: temple expense tracking — list, filter, summaries, export. */
export function AdminExpensesScreen() {
  const { t, lang } = useLang();
  const [period, setPeriod] = useState<Period>('month');
  const [anchor, setAnchor] = useState(toISODate(new Date()));
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [catFilter, setCatFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [minAmt, setMinAmt] = useState('');
  const [maxAmt, setMaxAmt] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categories = useMemo(() => getExpenseCategories(), [refresh]);

  const { from, to, label } = useMemo(() => {
    if (useCustom && customFrom && customTo) {
      return { from: customFrom, to: customTo, label: t('customRange') };
    }
    if (period === 'day') return { from: anchor, to: anchor, label: t('dayView') };
    if (period === 'week') {
      const r = weekRange(anchor);
      return { from: r.start, to: r.end, label: t('weekView') };
    }
    if (period === 'quarter') {
      const r = quarterRange(anchor);
      return { from: r.start, to: r.end, label: r.label };
    }
    if (period === 'year') {
      const y = anchor.slice(0, 4);
      return { from: `${y}-01-01`, to: `${y}-12-31`, label: y };
    }
    const r = monthRange(anchor);
    return { from: r.start, to: r.end, label: t('monthView') };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, anchor, useCustom, customFrom, customTo]);

  const filtered = useMemo(() => {
    const min = minAmt ? Number(minAmt) : -Infinity;
    const max = maxAmt ? Number(maxAmt) : Infinity;
    return getExpenses(showDeleted).filter(
      (e) =>
        e.date >= from &&
        e.date <= to &&
        (!catFilter || e.categoryId === catFilter) &&
        (!modeFilter || e.paymentMode === modeFilter) &&
        e.amount >= min &&
        e.amount <= max,
      // eslint-disable-next-line react-hooks/exhaustive-deps
    );
  }, [from, to, catFilter, modeFilter, minAmt, maxAmt, showDeleted, refresh]);

  const summary = useMemo(() => expenseSummary(from, to), [from, to, refresh]);

  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const inputCls =
    'w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm focus:border-amber-600 focus:outline-none';

  async function onDelete(e: Expense) {
    setConfirmDeleteId(e.id);
  }

  async function confirmDelete() {
    if (!confirmDeleteId || deleting) return;
    setDeleting(true);
    try {
      await softDeleteExpense(confirmDeleteId, currentAdmin()?.name);
      setConfirmDeleteId(null);
      setRefresh((r) => r + 1);
    } finally {
      setDeleting(false);
    }
  }

  async function onRestore(e: Expense) {
    await restoreExpense(e.id, currentAdmin()?.name);
    setRefresh((r) => r + 1);
  }

  function onCsv() {
    downloadExpensesCsv(filtered.filter((e) => !e.deleted), `expenses-${from}-${to}.csv`);
  }

  function onPdf() {
    const profile = getTempleProfile();
    downloadExpenseReportPdf(
      summary,
      filtered.filter((e) => !e.deleted),
      {
        templeName: profile.name.en,
        templeAddress: profile.address,
        templePhone: profile.phone,
        periodLabel: label,
        dateRange: from === to ? fmtDate(from, lang) : `${fmtDate(from, lang)} – ${fmtDate(to, lang)}`,
      },
    );
  }

  const maxCat = Math.max(1, ...summary.byCategory.map((c) => c.total));

  return (
    <div className="pb-24">
      <ScreenHeader title={t('expenses')} backTo="/admin/dashboard" />
      <div className="px-4 pt-3">
        <div className="flex gap-2">
          <Link
            to="/admin/expenses/new"
            className="flex min-h-[52px] flex-1 items-center justify-center rounded-2xl bg-maroon-800 text-base font-extrabold text-amber-100"
          >
            + {t('addExpense')}
          </Link>
          <Link
            to="/admin/expenses/categories"
            className="flex min-h-[52px] items-center justify-center rounded-2xl bg-white px-4 text-sm font-bold text-stone-700 shadow-sm"
          >
            {t('categories')}
          </Link>
        </div>

        {/* period tabs */}
        <div className="mt-3 grid grid-cols-5 gap-1 rounded-2xl bg-stone-100 p-1" role="group">
          {(['day', 'week', 'month', 'quarter', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p && !useCustom}
              onClick={() => {
                setPeriod(p);
                setUseCustom(false);
              }}
              className={`min-h-[40px] rounded-xl text-xs font-bold ${
                period === p && !useCustom ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              {t(
                p === 'day'
                  ? 'dayView'
                  : p === 'week'
                    ? 'weekView'
                    : p === 'month'
                      ? 'monthView'
                      : p === 'quarter'
                        ? 'quarterView'
                        : 'yearView',
              )}
            </button>
          ))}
        </div>

        {/* custom range */}
        <div className="mt-2 flex items-end gap-2">
          <label className="flex-1 text-xs font-bold text-stone-600">
            {t('viewingPeriod')}
            <input
              type="date"
              value={anchor}
              onChange={(e) => {
                setAnchor(e.target.value);
                setUseCustom(false);
              }}
              className={inputCls + ' mt-1'}
              aria-label={t('viewingPeriod')}
            />
          </label>
          <label className="flex-1 text-xs font-bold text-stone-600">
            {t('from')}
            <input
              type="date"
              value={customFrom}
              onChange={(e) => {
                setCustomFrom(e.target.value);
                setUseCustom(true);
              }}
              className={inputCls + ' mt-1'}
            />
          </label>
          <label className="flex-1 text-xs font-bold text-stone-600">
            {t('to')}
            <input
              type="date"
              value={customTo}
              onChange={(e) => {
                setCustomTo(e.target.value);
                setUseCustom(true);
              }}
              className={inputCls + ' mt-1'}
            />
          </label>
        </div>

        {/* summary cards */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-maroon-800 p-3 text-amber-100">
            <div className="text-[11px] font-bold opacity-80">{t('totalSpent')}</div>
            <div className="text-lg font-extrabold">{inr(summary.total)}</div>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="text-[11px] font-bold text-stone-500">{t('expenseCount')}</div>
            <div className="text-lg font-extrabold text-stone-900">{summary.count}</div>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="text-[11px] font-bold text-stone-500">{t('avgPerDay')}</div>
            <div className="text-lg font-extrabold text-stone-900">{inr(summary.avgPerDay)}</div>
          </div>
        </div>
        <p className="mt-2 text-xs font-semibold text-stone-500">
          {label} · {from === to ? fmtDate(from, lang) : `${fmtDate(from, lang)} – ${fmtDate(to, lang)}`}
        </p>

        {/* category breakdown */}
        {summary.byCategory.length > 0 && (
          <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="text-sm font-extrabold text-stone-800">{t('spendByCategory')}</h2>
            <div className="mt-2 space-y-2">
              {summary.byCategory.slice(0, 8).map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="max-w-[60%] truncate font-bold text-stone-700">{c.name}</span>
                    <span className="font-extrabold text-stone-900">{inr(c.total)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 to-maroon-700"
                      style={{ width: `${Math.max(3, (c.total / maxCat) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* filters */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className={inputCls} aria-label={t('category')}>
            <option value="">{t('allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className={inputCls} aria-label={t('paymentMode')}>
            <option value="">{t('allModes')}</option>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="number"
            inputMode="numeric"
            placeholder={t('minAmount')}
            value={minAmt}
            onChange={(e) => setMinAmt(e.target.value)}
            className={inputCls}
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder={t('maxAmount')}
            value={maxAmt}
            onChange={(e) => setMaxAmt(e.target.value)}
            className={inputCls}
          />
        </div>
        <label className="mt-2 flex min-h-[44px] items-center gap-2 text-sm font-bold text-stone-600">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
            className="h-5 w-5 accent-amber-700"
          />
          {t('showDeleted')}
        </label>

        {/* export */}
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={onCsv}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-2xl bg-white text-sm font-bold text-stone-700 shadow-sm"
          >
            ⬇ {t('exportCsv')}
          </button>
          <button
            type="button"
            onClick={onPdf}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-2xl bg-white text-sm font-bold text-stone-700 shadow-sm"
          >
            📄 {t('exportPdf')}
          </button>
        </div>

        {/* expense list */}
        <div className="mt-3 space-y-2">
          {filtered.map((e) => (
            <article
              key={e.id}
              className={`rounded-2xl bg-white p-3 shadow-sm ${e.deleted ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-3">
                {e.receiptDataUrl && (
                  <img
                    src={e.receiptDataUrl}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    loading="lazy"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-sm font-extrabold text-stone-900">
                      {e.categoryName}
                      {e.customNote ? ` (${e.customNote})` : ''}
                    </h3>
                    <span className="shrink-0 text-sm font-extrabold text-maroon-800">
                      {inr(e.amount)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {fmtDate(e.date, lang)} · {e.paymentMode} · {e.paidTo}
                  </p>
                  {(e.note || e.invoiceNo) && (
                    <p className="mt-0.5 truncate text-xs text-stone-500">
                      {[e.invoiceNo && `#${e.invoiceNo}`, e.note].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {e.deleted && (
                    <p className="mt-0.5 text-xs font-bold text-red-700">
                      {t('deleted')} {e.deletedBy ? `· ${e.deletedBy}` : ''}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                {!e.deleted ? (
                  <>
                    <Link
                      to={`/admin/expenses/${e.id}`}
                      className="flex min-h-[40px] flex-1 items-center justify-center rounded-xl bg-stone-100 text-xs font-bold text-stone-700"
                    >
                      {t('edit')}
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(e)}
                      className="flex min-h-[40px] flex-1 items-center justify-center rounded-xl bg-red-50 text-xs font-bold text-red-700"
                    >
                      {t('delete')}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => onRestore(e)}
                    className="flex min-h-[40px] flex-1 items-center justify-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-700"
                  >
                    {t('restore')}
                  </button>
                )}
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500 shadow-sm">
              {t('noExpenses')}
            </p>
          )}
        </div>
      </div>

      {/* in-app delete confirmation */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          role="dialog"
          aria-modal="true"
          aria-label={t('confirmDeleteExpense')}
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <p className="text-base font-extrabold text-stone-900">{t('confirmDeleteExpense')}</p>
            <p className="mt-1 text-sm text-stone-500">{t('deleteExpenseHint')}</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleting}
                className="min-h-[52px] flex-1 rounded-2xl bg-stone-100 text-base font-bold text-stone-700 disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="min-h-[52px] flex-1 rounded-2xl bg-red-600 text-base font-extrabold text-white disabled:opacity-50"
              >
                {deleting ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
