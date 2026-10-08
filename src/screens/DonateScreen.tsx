import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../i18n';
import { createDonation, getTempleProfile } from '../data/mock';
import type { Donation, DonationPurpose } from '../types';
import { ScreenHeader } from '../components/ScreenHeader';
import { useLocalText } from '../components/text';

const QUICK_AMOUNTS = [101, 501, 1100, 2100, 5100];

const inputCls =
  'mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none';

/** Donate: amount, purpose, donor details, online/offline, then receipt. */
export function DonateScreen() {
  const { t } = useLang();
  const loc = useLocalText();
  const navigate = useNavigate();

  const [amount, setAmount] = useState<number | ''>('');
  const [custom, setCustom] = useState('');
  const [purpose, setPurpose] = useState<DonationPurpose>('Annadaan');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [mode, setMode] = useState<'online' | 'offline'>('online');
  const [error, setError] = useState('');
  const templeProfile = getTempleProfile();

  const purposes: { value: DonationPurpose; label: string }[] = [
    { value: 'Annadaan', label: t('purposeAnnadaan') },
    { value: 'Temple Maintenance', label: t('purposeMaintenance') },
    { value: 'Gopuja', label: t('purposeGopuja') },
    { value: 'Vidya Daan', label: t('purposeVidyaDaan') },
    { value: 'General', label: t('purposeGeneral') },
    { value: 'Other', label: t('purposeOther') },
  ];

  const finalAmount = amount === '' ? Number(custom) || 0 : amount;

  function submit() {
    if (!finalAmount || finalAmount <= 0) {
      setError(t('donationAmount'));
      return;
    }
    if (!anonymous && !name.trim()) {
      setError(t('nameRequired'));
      return;
    }
    if (!anonymous && phone.replace(/\D/g, '').length !== 10) {
      setError(t('invalidPhone'));
      return;
    }
    try {
      const d: Donation = createDonation({
        devoteeName: name,
        phone: phone || '0000000000',
        amount: finalAmount,
        purpose,
        anonymous,
        mode,
      });
      navigate(`/donations/${d.receiptNo}`, { replace: true });
    } catch {
      setError(t('tryAgain'));
    }
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={t('donateTitle')} />
      <div className="px-4 pt-3">
        <p className="text-center text-sm text-stone-600">{loc(templeProfile.name)}</p>

        <h2 className="mt-4 text-lg font-bold text-stone-900">{t('donationAmount')}</h2>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={amount === a}
              onClick={() => {
                setAmount(a);
                setCustom('');
              }}
              className={`min-h-[56px] rounded-2xl text-lg font-extrabold shadow-sm ${
                amount === a ? 'bg-amber-200 ring-2 ring-amber-600' : 'bg-white text-stone-800'
              }`}
            >
              ₹{a.toLocaleString('en-IN')}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={amount === ''}
            onClick={() => setAmount('')}
            className={`min-h-[56px] rounded-2xl text-sm font-bold shadow-sm ${
              amount === '' ? 'bg-amber-200 ring-2 ring-amber-600' : 'bg-white text-stone-800'
            }`}
          >
            {t('customAmount')}
          </button>
        </div>
        {amount === '' && (
          <input
            className={inputCls}
            inputMode="numeric"
            placeholder="₹"
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))}
            aria-label={t('customAmount')}
          />
        )}

        <h2 className="mt-5 text-lg font-bold text-stone-900">{t('purpose')}</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {purposes.map((p) => (
            <button
              key={p.value}
              type="button"
              aria-pressed={purpose === p.value}
              onClick={() => setPurpose(p.value)}
              className={`min-h-[52px] rounded-2xl px-2 text-sm font-bold shadow-sm ${
                purpose === p.value
                  ? 'bg-amber-200 ring-2 ring-amber-600'
                  : 'bg-white text-stone-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          <label className="flex min-h-[56px] items-center gap-3 rounded-2xl bg-white px-4 shadow-sm">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="h-6 w-6 accent-amber-700"
            />
            <span className="text-base font-bold text-stone-800">{t('anonymous')}</span>
          </label>

          {!anonymous && (
            <>
              <div>
                <label htmlFor="dn-name" className="text-sm font-bold text-stone-800">
                  {t('donorName')} *
                </label>
                <input
                  id="dn-name"
                  className={inputCls}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="dn-phone" className="text-sm font-bold text-stone-800">
                  {t('phone')} *
                </label>
                <input
                  id="dn-phone"
                  className={inputCls}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="98765 43210"
                />
              </div>
            </>
          )}

          <fieldset>
            <legend className="text-sm font-bold text-stone-800">{t('confirmBooking')}</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(
                [
                  { m: 'online', label: t('payNow'), icon: '💳' },
                  { m: 'offline', label: t('payAtTemple'), icon: '🛕' },
                ] as { m: 'online' | 'offline'; label: string; icon: string }[]
              ).map((o) => (
                <button
                  key={o.m}
                  type="button"
                  aria-pressed={mode === o.m}
                  onClick={() => setMode(o.m)}
                  className={`min-h-[64px] rounded-2xl p-2 text-center shadow-sm ${
                    mode === o.m ? 'bg-amber-100 ring-2 ring-amber-600' : 'bg-white'
                  }`}
                >
                  <div className="text-xl" aria-hidden>
                    {o.icon}
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-stone-800">{o.label}</div>
                </button>
              ))}
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            className="min-h-[56px] w-full rounded-2xl bg-maroon-800 text-lg font-extrabold text-amber-100 shadow"
          >
            {t('donateNow')} {finalAmount > 0 ? `· ₹${finalAmount.toLocaleString('en-IN')}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
