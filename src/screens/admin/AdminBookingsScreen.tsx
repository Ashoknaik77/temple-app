import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../i18n';
import {
  allBookings,
  bookingsByDate,
  cancelBooking,
  completeBooking,
  currentAdmin,
  getSevas,
  getTempleProfile,
  issueSevaReceipt,
  setPaymentStatus,
  weekRange,
} from '../../data/mock';
import { downloadSevaReceiptPdf } from '../../lib/sevaReceiptPdf';
import { ScreenHeader } from '../../components/ScreenHeader';
import { fmtDate, fmtTime, toISODate, useLocalText } from '../../components/text';
import type { Booking } from '../../types';

/** Admin: day or week (Mon–Sun) list of seva requestors; mark done / cancel / paid. */
export function AdminBookingsScreen() {
  const { t, lang } = useLang();
  const [date, setDate] = useState(toISODate(new Date()));
  const [mode, setMode] = useState<'day' | 'week'>('day');
  const [refresh, setRefresh] = useState(0);

  // Quick-jump day chips: today + next 6 days (ease of use for "is there a booking tomorrow/Friday?")
  const dayChips = useMemo(() => {
    const locale = lang === 'kn' ? 'kn-IN' : 'en-IN';
    const chips: { date: string; label: string; sub: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      chips.push({
        date: toISODate(d),
        label:
          i === 0
            ? t('today')
            : i === 1
              ? t('tomorrow')
              : d.toLocaleDateString(locale, { weekday: 'long' }),
        sub: d.toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
      });
    }
    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const groups = useMemo(() => {
    if (mode === 'day') {
      const list = allBookings().filter((b) => b.date === date);
      return [{ date, bookings: list }];
    }
    const { start, end } = weekRange(date);
    return bookingsByDate(start, end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, mode, refresh]);

  // Quick search by devotee name or phone (for walk-in payments).
  const [query, setQuery] = useState('');
  const visibleGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    const qDigits = q.replace(/\D/g, '');
    const match = (b: Booking) =>
      b.devoteeName.toLowerCase().includes(q) ||
      (qDigits && b.phone.replace(/\D/g, '').includes(qDigits));
    return groups
      .map((g) => ({ ...g, bookings: g.bookings.filter(match) }))
      .filter((g) => g.bookings.length > 0);
  }, [groups, query]);

  const total = visibleGroups.reduce((n, g) => n + g.bookings.length, 0);
  const rangeLabel =
    mode === 'day'
      ? fmtDate(date, lang)
      : `${fmtDate(groups[0]?.date ?? date, lang)} – ${fmtDate(
          groups[groups.length - 1]?.date ?? date,
          lang,
        )}`;

  async function act(id: string, fn: (id: string) => Promise<boolean>) {
    if (await fn(id)) setRefresh((r) => r + 1);
  }

  async function togglePaid(id: string, currentlyPaid: boolean) {
    const adminName = currentAdmin()?.name;
    if (await setPaymentStatus(id, currentlyPaid ? 'unpaid' : 'paid', adminName)) {
      setRefresh((r) => r + 1);
    }
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={t('manageBookings')} backTo="/admin/dashboard" />
      <div className="px-4 pt-3">
        <Link
          to="/admin/bookings/new"
          className="flex min-h-[56px] items-center justify-center rounded-2xl bg-maroon-800 text-base font-extrabold text-amber-100"
        >
          + {t('newBooking')}
        </Link>

        <div className="mt-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchNamePhone')}
            aria-label={t('searchNamePhone')}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base focus:border-amber-600 focus:outline-none"
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-stone-100 p-1">
          {(['day', 'week'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`min-h-[44px] rounded-xl text-sm font-bold ${
                mode === m ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              {t(m === 'day' ? 'dayView' : 'weekView')}
            </button>
          ))}
        </div>

        <label className="mt-3 block text-sm font-bold text-stone-800" htmlFor="adm-bk-date">
          {mode === 'day' ? t('selectDate') : t('weekOf')}
        </label>
        {mode === 'day' && (
          <div
            className="mt-2 flex gap-2 overflow-x-auto pb-1"
            role="group"
            aria-label={t('selectDate')}
          >
            {dayChips.map((c) => {
              const active = c.date === date;
              return (
                <button
                  key={c.date}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDate(c.date)}
                  className={`min-h-[56px] min-w-[76px] shrink-0 rounded-2xl px-3 py-2 text-center shadow-sm ${
                    active ? 'bg-maroon-800 text-amber-100' : 'bg-white text-stone-800'
                  }`}
                >
                  <div className="text-xs font-bold">{c.label}</div>
                  <div className={`text-sm font-extrabold ${active ? '' : 'text-stone-500'}`}>
                    {c.sub}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        <input
          id="adm-bk-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base focus:border-amber-600 focus:outline-none"
        />
        <p className="mt-2 text-sm font-semibold text-stone-500">
          {total} {t('requestors').toLowerCase()} · {rangeLabel}
        </p>

        <div className="mt-2 space-y-5">
          {visibleGroups.map(
            (g) =>
              g.bookings.length > 0 && (
                <section key={g.date} aria-label={g.date}>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
                    {fmtDate(g.date, lang)}
                  </h2>
                  <div className="mt-2 space-y-3">
                    {g.bookings.map((b) => (
                      <BookingCard
                        key={b.id}
                        b={b}
                        onAct={act}
                        onTogglePaid={togglePaid}
                      />
                    ))}
                  </div>
                </section>
              ),
          )}
          {total === 0 && (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500 shadow-sm">
              {t('noBookings')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingCard({
  b,
  onAct,
  onTogglePaid,
}: {
  b: Booking;
  onAct: (id: string, fn: (id: string) => Promise<boolean>) => Promise<void>;
  onTogglePaid: (id: string, currentlyPaid: boolean) => Promise<void>;
}) {
  const { t, lang } = useLang();
  const loc = useLocalText();

  async function receipt() {
    const receiptNo = await issueSevaReceipt(b.id);
    if (!receiptNo) return;
    const profile = getTempleProfile();
    const seva = getSevas().find((s) => s.id === b.sevaId);
    downloadSevaReceiptPdf({
      templeName: profile.name.en,
      templeAddress: profile.address,
      templePhone: profile.phone,
      receiptNo,
      date: fmtDate(b.paidAt ?? new Date().toISOString().slice(0, 10), lang),
      devoteeName: b.devoteeName,
      place: b.place,
      phone: b.phone,
      sevaName: loc(b.sevaName),
      sevaDate: fmtDate(b.date, lang),
      sevaTime: fmtTime(b.time),
      amount: seva?.price ?? 0,
      collectedBy: b.paidBy ?? currentAdmin()?.name ?? '',
      bookingCode: b.bookingCode,
    });
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-stone-900">{b.devoteeName}</h3>
          <p className="text-sm text-stone-600">
            {loc(b.sevaName)} · {fmtTime(b.time)}
          </p>
          <p className="text-sm text-stone-600">
            {[b.place, b.phone].filter(Boolean).join(' · ')}
          </p>
          {b.note && <p className="mt-1 text-sm italic text-stone-500">“{b.note}”</p>}
          <p className="font-mono text-xs text-stone-400">{b.bookingCode}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`rounded-full px-2 py-1 text-xs font-bold ${
              b.status === 'confirmed'
                ? 'bg-emerald-100 text-emerald-800'
                : b.status === 'completed'
                  ? 'bg-stone-200 text-stone-600'
                  : 'bg-red-100 text-red-700'
            }`}
          >
            {t(b.status)}
          </span>
          <span
            className={`text-xs font-bold ${
              b.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            ₹ {t(b.paymentStatus)}
          </span>
          {b.paymentStatus === 'paid' && b.paidBy && (
            <span className="text-[11px] text-stone-500">
              {t('collectedBy')} {b.paidBy}
            </span>
          )}
        </div>
      </div>
      {b.status === 'confirmed' && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onAct(b.id, completeBooking)}
            className="min-h-[48px] rounded-xl bg-emerald-700 text-sm font-bold text-white"
          >
            {t('markDone')}
          </button>
          <button
            type="button"
            onClick={() => onAct(b.id, cancelBooking)}
            className="min-h-[48px] rounded-xl bg-stone-100 text-sm font-bold text-red-700"
          >
            {t('cancel')}
          </button>
        </div>
      )}
      {b.status !== 'cancelled' && (
        <button
          type="button"
          onClick={() => onTogglePaid(b.id, b.paymentStatus === 'paid')}
          className={`mt-2 min-h-[48px] w-full rounded-xl text-sm font-bold ${
            b.paymentStatus === 'paid' ? 'bg-stone-100 text-stone-700' : 'bg-amber-600 text-white'
          }`}
        >
          {b.paymentStatus === 'paid' ? t('markUnpaid') : t('markPaid')}
        </button>
      )}
      {b.paymentStatus === 'paid' && b.status !== 'cancelled' && (
        <button
          type="button"
          onClick={receipt}
          className="mt-2 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-maroon-800 shadow-sm ring-1 ring-stone-200"
        >
          <span aria-hidden>🧾</span> {t('receiptPdf')}
        </button>
      )}
    </div>
  );
}
