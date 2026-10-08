import { useMemo, useState } from 'react';
import { useLang } from '../../i18n';
import { collectionReport, getTempleProfile, monthRange, weekRange } from '../../data/mock';
import { downloadReportPdf } from '../../lib/reportPdf';
import { ScreenHeader } from '../../components/ScreenHeader';
import { fmtDate, toISODate, useLocalText } from '../../components/text';

type Period = 'day' | 'week' | 'month';

/** Admin: seva-wise booking/payment collections + donations, by day / week / month. */
export function AdminReportsScreen() {
  const { t, lang } = useLang();
  const loc = useLocalText();
  const [period, setPeriod] = useState<Period>('week');
  const [anchor, setAnchor] = useState(toISODate(new Date()));

  const { start: from, end: to } = useMemo(() => {
    if (period === 'day') return { start: anchor, end: anchor };
    if (period === 'month') return monthRange(anchor);
    return weekRange(anchor);
  }, [period, anchor]);

  const report = useMemo(() => collectionReport(from, to), [from, to]);

  const inputCls =
    'mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base focus:border-amber-600 focus:outline-none';
  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  function onDownloadPdf() {
    const profile = getTempleProfile();
    downloadReportPdf(report, {
      templeName: profile.name.en,
      templeAddress: profile.address,
      templePhone: profile.phone,
      periodLabel: t(period === 'day' ? 'dayView' : period === 'week' ? 'weekView' : 'monthView'),
      dateRange:
        from === to ? fmtDate(from, lang) : `${fmtDate(from, lang)} – ${fmtDate(to, lang)}`,
    });
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={t('reports')} backTo="/admin/dashboard" />
      <div className="px-4 pt-3">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-stone-100 p-1">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className={`min-h-[44px] rounded-xl text-sm font-bold ${
                period === p ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              {t(p === 'day' ? 'dayView' : p === 'week' ? 'weekView' : 'monthView')}
            </button>
          ))}
        </div>

        <label className="mt-3 block text-sm font-bold text-stone-800" htmlFor="rp-date">
          {period === 'day'
            ? t('selectDate')
            : period === 'week'
              ? t('weekOf')
              : t('monthOf')}
        </label>
        <input
          id="rp-date"
          type="date"
          className={inputCls}
          value={anchor}
          onChange={(e) => setAnchor(e.target.value)}
        />
        <p className="mt-2 text-sm font-semibold text-stone-500">
          {from === to ? fmtDate(from, lang) : `${fmtDate(from, lang)} – ${fmtDate(to, lang)}`}
        </p>
        <button
          type="button"
          onClick={onDownloadPdf}
          className="mt-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-maroon-800 text-base font-extrabold text-amber-100 shadow"
        >
          <span aria-hidden>📄</span> {t('downloadPdf')}
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-emerald-700 p-4 text-white">
            <p className="text-xs font-bold uppercase opacity-80">{t('sevaCollected')}</p>
            <p className="mt-1 text-2xl font-extrabold">{inr(report.totalCollected)}</p>
          </div>
          <div className="rounded-2xl bg-amber-600 p-4 text-white">
            <p className="text-xs font-bold uppercase opacity-80">{t('sevaPending')}</p>
            <p className="mt-1 text-2xl font-extrabold">{inr(report.totalPending)}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-stone-500">{t('donationsReceived')}</p>
            <p className="mt-1 text-2xl font-extrabold text-stone-900">
              {inr(report.donationsTotal)}
            </p>
          </div>
          <div className="rounded-2xl bg-maroon-800 p-4 text-amber-100">
            <p className="text-xs font-bold uppercase opacity-80">{t('grandCollected')}</p>
            <p className="mt-1 text-2xl font-extrabold">{inr(report.grandCollected)}</p>
          </div>
        </div>

        <h2 className="mt-5 text-sm font-bold uppercase tracking-wide text-stone-500">
          {t('sevaWise')} ({report.totalBookings} {t('bookings')})
        </h2>
        <div className="mt-2 space-y-3">
          {report.rows.map((r) => (
            <div key={r.sevaId} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-stone-900">{loc(r.sevaName)}</h3>
                <span className="shrink-0 text-sm font-bold text-stone-500">
                  {r.bookings} {t('bookings')}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-emerald-50 p-2">
                  <p className="text-lg font-extrabold text-emerald-700">{r.paidCount}</p>
                  <p className="text-xs font-bold text-stone-500">{t('paid')}</p>
                  <p className="text-xs font-bold text-emerald-700">{inr(r.collected)}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-2">
                  <p className="text-lg font-extrabold text-amber-700">{r.unpaidCount}</p>
                  <p className="text-xs font-bold text-stone-500">{t('unpaid')}</p>
                  <p className="text-xs font-bold text-amber-700">{inr(r.pending)}</p>
                </div>
                <div className="rounded-xl bg-stone-100 p-2">
                  <p className="text-lg font-extrabold text-stone-700">{inr(r.price)}</p>
                  <p className="text-xs font-bold text-stone-500">{t('price')}</p>
                  <p className="text-xs text-stone-400">/ {t('bookings')}</p>
                </div>
              </div>
            </div>
          ))}
          {report.rows.length === 0 && (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500 shadow-sm">
              {t('noBookings')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
