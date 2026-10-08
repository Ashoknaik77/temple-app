import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n';
import { createBooking, currentAdmin, getSevas, seatsLeft } from '../../data/mock';
import { ScreenHeader } from '../../components/ScreenHeader';
import { toISODate, useLocalText } from '../../components/text';

/** Admin: create a booking directly for a devotee who called or walked in. */
export function AdminBookingFormScreen() {
  const { t } = useLang();
  const loc = useLocalText();
  const navigate = useNavigate();

  const sevas = useMemo(() => getSevas().filter((s) => s.active), []);
  const [sevaId, setSevaId] = useState(sevas[0]?.id ?? '');
  const [date, setDate] = useState(toISODate(new Date()));
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [place, setPlace] = useState('');
  const [note, setNote] = useState('');
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');

  const seva = sevas.find((s) => s.id === sevaId);
  const slotTimes = seva?.slotTimes ?? [];
  const left = seva && time ? seatsLeft(seva.id, date, time) : null;

  const inputCls =
    'mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base focus:border-amber-600 focus:outline-none';

  async function submit() {
    if (!seva) return;
    if (!name.trim()) {
      setError(t('nameRequired'));
      return;
    }
    if (phone.replace(/\D/g, '').length !== 10) {
      setError(t('invalidPhone'));
      return;
    }
    if (!time) {
      setError(t('selectTime'));
      return;
    }
    if (!place.trim()) {
      setError(t('placeRequired'));
      return;
    }
    try {
      const booking = await createBooking({
        sevaId: seva.id,
        date,
        time,
        devoteeName: name,
        phone,
        place,
        note,
        payMode: 'payAtTemple',
        paymentStatus: paid ? 'paid' : 'unpaid',
        paidBy: paid ? currentAdmin()?.name : undefined,
      });
      navigate(`/bookings/${booking.bookingCode}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error && e.message === 'slot full' ? t('slotFull') : t('tryAgain'));
    }
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={t('bookForDevotee')} backTo="/admin/bookings" />
      <div className="px-4 pt-3">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-stone-800" htmlFor="ab-seva">
              {t('selectSeva')}
            </label>
            <select
              id="ab-seva"
              className={inputCls}
              value={sevaId}
              onChange={(e) => {
                setSevaId(e.target.value);
                setTime('');
              }}
            >
              {sevas.map((s) => (
                <option key={s.id} value={s.id}>
                  {loc(s.name)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold text-stone-800" htmlFor="ab-date">
                {t('selectDate')}
              </label>
              <input
                id="ab-date"
                type="date"
                className={inputCls}
                value={date}
                min={toISODate(new Date())}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-stone-800" htmlFor="ab-time">
                {t('selectTime')}
              </label>
              <select
                id="ab-time"
                className={inputCls}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                <option value="">—</option>
                {slotTimes.map((st) => (
                  <option key={st} value={st}>
                    {st}
                    {seva ? ` (${seatsLeft(seva.id, date, st)} ${t('seatsLeft')})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {left !== null && (
            <p className="text-sm font-semibold text-stone-500">
              {left} {t('seatsLeft')}
            </p>
          )}

          <div>
            <label className="text-sm font-bold text-stone-800" htmlFor="ab-name">
              {t('fullName')}
            </label>
            <input
              id="ab-name"
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold text-stone-800" htmlFor="ab-phone">
                {t('phone')}
              </label>
              <input
                id="ab-phone"
                className={inputCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-stone-800" htmlFor="ab-place">
                {t('place')} *
              </label>
              <input
                id="ab-place"
                className={inputCls}
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-stone-800" htmlFor="ab-note">
              {t('note')}
            </label>
            <textarea
              id="ab-note"
              className={inputCls}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <label className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <input
              type="checkbox"
              className="h-6 w-6 accent-amber-700"
              checked={paid}
              onChange={(e) => setPaid(e.target.checked)}
            />
            <span className="text-base font-bold text-stone-800">{t('paymentCollected')}</span>
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            className="min-h-[56px] w-full rounded-2xl bg-maroon-800 text-lg font-extrabold text-amber-100 shadow"
          >
            {t('confirmBooking')}
          </button>
        </div>
      </div>
    </div>
  );
}
