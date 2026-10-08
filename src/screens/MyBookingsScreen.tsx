import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import { myDeviceBookings } from '../data/mock';
import { ScreenHeader } from '../components/ScreenHeader';
import { fmtDate, fmtTime, toISODate, useLocalText } from '../components/text';

/** Devotee's booking history. */
export function MyBookingsScreen() {
  const { t, lang } = useLang();
  const loc = useLocalText();
  const today = toISODate(new Date());
  const bookings = myDeviceBookings();

  const upcoming = bookings.filter((b) => b.date >= today && b.status === 'confirmed');
  const past = bookings.filter((b) => !(b.date >= today && b.status === 'confirmed'));

  return (
    <div className="pb-24">
      <ScreenHeader title={t('myBookings')} />
      <div className="px-4 pt-3">
        {bookings.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-5xl" aria-hidden>
              🪔
            </p>
            <p className="mt-3 text-stone-500">{t('noBookings')}</p>
            <Link
              to="/sevas"
              className="mt-4 inline-flex min-h-[52px] items-center rounded-2xl bg-maroon-800 px-6 text-base font-extrabold text-amber-100"
            >
              {t('bookNow')}
            </Link>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section aria-label={t('upcoming')}>
                <h2 className="mt-2 text-sm font-bold uppercase tracking-wide text-stone-500">
                  {t('upcoming')} ({upcoming.length})
                </h2>
                <div className="mt-2 space-y-3">
                  {upcoming.map((b) => (
                    <BookingRow
                      key={b.id}
                      code={b.bookingCode}
                      title={loc(b.sevaName)}
                      sub={`${fmtDate(b.date, lang)} · ${fmtTime(b.time)}`}
                      status={t('confirmed')}
                      statusCls="text-emerald-700"
                      payment={t(b.paymentStatus)}
                      paymentCls={
                        b.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                      }
                    />
                  ))}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section aria-label={t('past')} className="mt-6">
                <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
                  {t('past')} ({past.length})
                </h2>
                <div className="mt-2 space-y-3">
                  {past.map((b) => (
                    <BookingRow
                      key={b.id}
                      code={b.bookingCode}
                      title={loc(b.sevaName)}
                      sub={`${fmtDate(b.date, lang)} · ${fmtTime(b.time)}`}
                      status={t(b.status as 'cancelled' | 'completed')}
                      statusCls={b.status === 'cancelled' ? 'text-red-700' : 'text-stone-500'}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BookingRow({
  code,
  title,
  sub,
  status,
  statusCls,
  payment,
  paymentCls,
}: {
  code: string;
  title: string;
  sub: string;
  status: string;
  statusCls: string;
  payment?: string;
  paymentCls?: string;
}) {
  return (
    <Link
      to={`/bookings/${code}`}
      className="block rounded-2xl bg-white p-4 shadow-sm active:bg-amber-50"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-stone-900">{title}</h3>
          <p className="mt-0.5 text-sm text-stone-500">{sub}</p>
          <p className="mt-0.5 text-xs font-mono text-stone-400">{code}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`text-sm font-bold ${statusCls}`}>{status}</span>
          {payment && <span className={`text-xs font-bold ${paymentCls}`}>₹ {payment}</span>}
        </div>
      </div>
    </Link>
  );
}
