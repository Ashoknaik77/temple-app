import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLang } from '../i18n';
import { createBooking, sevas } from '../data/mock';
import type { PayMode } from '../types';
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
  const seva = sevas.find((s) => s.id === sevaId);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gotra, setGotra] = useState('');
  const [people, setPeople] = useState(1);
  const [sankalpa, setSankalpa] = useState('');
  const [payMode, setPayMode] = useState<PayMode>('payAtTemple');
  const [error, setError] = useState('');

  if (!seva || !date || !time) {
    return (
      <div className="pb-24">
        <ScreenHeader title={t('yourDetails')} backTo="/sevas" />
        <p className="px-4 pt-8 text-center text-stone-500">{t('tryAgain')}</p>
      </div>
    );
  }

  function submit() {
    if (!seva) return;
    if (!name.trim()) {
      setError(t('nameRequired'));
      return;
    }
    if (phone.replace(/\D/g, '').length !== 10) {
      setError(t('invalidPhone'));
      return;
    }
    try {
      const booking = createBooking({
        sevaId: seva.id,
        date,
        time,
        devoteeName: name,
        phone,
        gotra,
        people,
        sankalpa,
        payMode,
      });
      navigate(`/bookings/${booking.bookingCode}`, { replace: true });
    } catch {
      setError(t('slotFull'));
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
            {seva.price === 0 ? t('freeEntry') : `₹${seva.price * people}`}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bk-gotra" className="text-sm font-bold text-stone-800">
                {t('gotra')}
              </label>
              <input
                id="bk-gotra"
                className={inputCls}
                value={gotra}
                onChange={(e) => setGotra(e.target.value)}
                placeholder={t('gotra')}
              />
            </div>
            <div>
              <label htmlFor="bk-people" className="text-sm font-bold text-stone-800">
                {t('numPeople')}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  aria-label="−"
                  onClick={() => setPeople((p) => Math.max(1, p - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl font-bold text-stone-700 shadow-sm"
                >
                  −
                </button>
                <span id="bk-people" className="w-8 text-center text-xl font-extrabold">
                  {people}
                </span>
                <button
                  type="button"
                  aria-label="+"
                  onClick={() => setPeople((p) => Math.min(20, p + 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl font-bold text-stone-700 shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="bk-sankalpa" className="text-sm font-bold text-stone-800">
              {t('specialRequests')}
            </label>
            <textarea
              id="bk-sankalpa"
              className={inputCls}
              rows={2}
              value={sankalpa}
              onChange={(e) => setSankalpa(e.target.value)}
            />
          </div>

          <fieldset>
            <legend className="text-sm font-bold text-stone-800">{t('confirmBooking')}</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(
                [
                  { mode: 'payAtTemple', label: t('payAtTemple'), icon: '🛕' },
                  { mode: 'online', label: t('payNow'), icon: '💳' },
                ] as { mode: PayMode; label: string; icon: string }[]
              ).map((o) => (
                <button
                  key={o.mode}
                  type="button"
                  aria-pressed={payMode === o.mode}
                  onClick={() => setPayMode(o.mode)}
                  className={`min-h-[72px] rounded-2xl p-3 text-center shadow-sm ${
                    payMode === o.mode
                      ? 'bg-amber-100 ring-2 ring-amber-600'
                      : 'bg-white'
                  }`}
                >
                  <div className="text-2xl" aria-hidden>
                    {o.icon}
                  </div>
                  <div className="mt-1 text-sm font-bold text-stone-800">{o.label}</div>
                </button>
              ))}
            </div>
          </fieldset>

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
