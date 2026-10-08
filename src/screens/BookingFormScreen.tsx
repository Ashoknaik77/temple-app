import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLang } from '../i18n';
import { createBooking, getSevas } from '../data/mock';
import { ScreenHeader } from '../components/ScreenHeader';
import { fmtDate, fmtTime, useLocalText } from '../components/text';

const inputCls =
  'mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none';

/** Step 3 of booking: devotee details + payment choice, then confirm. */
export function BookingFormScreen() {
  const { t, lang } = useLang();
  const loc = useLocalText();
  const navigate = useNavigate();
  const { sevaId } = useParams();
  const [params] = useSearchParams();
  const date = params.get('date') ?? '';
  const time = params.get('time') ?? '';
  const seva = getSevas().find((s) => s.id === sevaId);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [place, setPlace] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!seva || !date || !time) {
    return (
      <div className="pb-24">
        <ScreenHeader title={t('yourDetails')} backTo="/sevas" />
        <p className="px-4 pt-8 text-center text-stone-500">{t('tryAgain')}</p>
      </div>
    );
  }

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
      });
      navigate(`/bookings/${booking.bookingCode}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error && e.message === 'slot full' ? t('slotFull') : t('tryAgain'));
    }
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={t('yourDetails')} backTo={`/sevas/${seva.id}`} />

      <div className="px-4 pt-3">
        {/* summary card */}
        <div className="rounded-2xl bg-maroon-800 p-4 text-amber-100">
          <h2 className="text-sm font-semibold uppercase opacity-70">{t('bookingSummary')}</h2>
          <p className="mt-1 text-lg font-extrabold">{loc(seva.name)}</p>
          <p className="mt-1 text-sm font-semibold">
            {fmtDate(date, lang)} · {fmtTime(time)}
          </p>
          <p className="mt-1 text-lg font-extrabold">
            {seva.price === 0 ? t('freeEntry') : `₹${seva.price}`}
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </p>
        )}

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="bk-name" className="text-sm font-bold text-stone-800">
              {t('fullName')} *
            </label>
            <input
              id="bk-name"
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder={t('fullName')}
            />
          </div>

          <div>
            <label htmlFor="bk-phone" className="text-sm font-bold text-stone-800">
              {t('phone')} *
            </label>
            <input
              id="bk-phone"
              className={inputCls}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="numeric"
              autoComplete="tel"
              placeholder="98765 43210"
            />
          </div>

          <div>
            <label htmlFor="bk-place" className="text-sm font-bold text-stone-800">
              {t('place')} *
            </label>
            <input
              id="bk-place"
              className={inputCls}
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder={t('place')}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="bk-note" className="text-sm font-bold text-stone-800">
              {t('note')}
            </label>
            <textarea
              id="bk-note"
              className={inputCls}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="rounded-2xl bg-amber-50 p-4 text-sm text-stone-700 ring-1 ring-amber-200">
            <span aria-hidden>🙏 </span>
            {t('payLaterNote')}
          </div>

          <button
            type="button"
            onClick={submit}
            className="min-h-[56px] w-full scroll-mb-28 rounded-2xl bg-maroon-800 text-lg font-extrabold text-amber-100 shadow"
          >
            {t('confirmBooking')}
          </button>
        </div>
      </div>
    </div>
  );
}
