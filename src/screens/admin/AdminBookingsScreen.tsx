import { useMemo, useState } from 'react';
import { useLang } from '../../i18n';
import { allBookings, cancelBooking, completeBooking } from '../../data/mock';
import { ScreenHeader } from '../../components/ScreenHeader';
import { fmtDate, fmtTime, toISODate, useLocalText } from '../../components/text';

/** Admin: bookings list with date filter; mark done / cancel. */
export function AdminBookingsScreen() {
  const { t, lang } = useLang();
  const loc = useLocalText();
  const [date, setDate] = useState(toISODate(new Date()));
  const [refresh, setRefresh] = useState(0);

  const bookings = useMemo(
    () => allBookings().filter((b) => b.date === date),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [date, refresh],
  );

  function act(id: string, fn: (id: string) => boolean) {
    if (fn(id)) setRefresh((r) => r + 1);
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={t('manageBookings')} backTo="/admin/dashboard" />
      <div className="px-4 pt-3">
        <label className="text-sm font-bold text-stone-800" htmlFor="adm-bk-date">
          {t('chooseDateTime')}
        </label>
        <input
          id="adm-bk-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base focus:border-amber-600 focus:outline-none"
        />
        <p className="mt-2 text-sm font-semibold text-stone-500">
          {bookings.length} {t('manageBookings').toLowerCase()} · {fmtDate(date, lang)}
        </p>
        <div className="mt-2 space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-stone-900">{loc(b.sevaName)}</h3>
                  <p className="text-sm text-stone-600">
                    {b.devoteeName} · {b.phone} · {fmtTime(b.time)} · {b.people} {t('numPeople').toLowerCase()}
                  </p>
                  <p className="font-mono text-xs text-stone-400">{b.bookingCode}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${
                    b.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : b.status === 'completed'
                        ? 'bg-stone-200 text-stone-600'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {t(b.status)}
                </span>
              </div>
              {b.status === 'confirmed' && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => act(b.id, completeBooking)}
                    className="min-h-[48px] rounded-xl bg-emerald-700 text-sm font-bold text-white"
                  >
                    {t('markDone')}
                  </button>
                  <button
                    type="button"
                    onClick={() => act(b.id, cancelBooking)}
                    className="min-h-[48px] rounded-xl bg-stone-100 text-sm font-bold text-red-700"
                  >
                    {t('cancel')}
                  </button>
                </div>
              )}
            </div>
          ))}
          {bookings.length === 0 && (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500 shadow-sm">
              {t('noBookings')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
