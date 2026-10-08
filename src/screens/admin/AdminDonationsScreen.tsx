import { useState } from 'react';
import { useLang } from '../../i18n';
import { allDonations, createDonation } from '../../data/mock';
import { ScreenHeader } from '../../components/ScreenHeader';
import { fmtDate } from '../../components/text';

const inputCls =
  'mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 focus:border-amber-600 focus:outline-none';

/** Admin: donation list + record an offline (counter) donation. */
export function AdminDonationsScreen() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState('');

  const donations = allDonations();
  void refresh;
  const total = donations.reduce((s, d) => s + d.amount, 0);

  function submit() {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError(t('donationAmount'));
      return;
    }
    try {
      createDonation({
        devoteeName: name.trim() || 'Devotee',
        phone: '0000000000',
        amount: amt,
        purpose: 'General',
        anonymous: !name.trim(),
        mode: 'offline',
      });
      setOpen(false);
      setName('');
      setAmount('');
      setError('');
      setRefresh((r) => r + 1);
    } catch {
      setError(t('tryAgain'));
    }
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={t('manageDonations')} backTo="/admin/dashboard" />
      <div className="px-4 pt-3">
        <div className="rounded-2xl bg-maroon-800 p-4 text-amber-100">
          <p className="text-sm font-semibold uppercase opacity-70">{t('total')}</p>
          <p className="text-3xl font-extrabold">₹{total.toLocaleString('en-IN')}</p>
          <p className="text-sm opacity-80">{donations.length} donations</p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-3 flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-amber-700 text-base font-extrabold text-white"
        >
          + {t('recordOfflineDonation')}
        </button>

        {open && (
          <div className="mt-3 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
            <div>
              <label className="text-sm font-bold text-stone-800" htmlFor="adm-dn-name">
                {t('donorName')}
              </label>
              <input
                id="adm-dn-name"
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('anonymous')}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-stone-800" htmlFor="adm-dn-amt">
                {t('donationAmount')} *
              </label>
              <input
                id="adm-dn-amt"
                className={inputCls}
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="₹"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={submit}
              className="min-h-[52px] w-full rounded-2xl bg-maroon-800 text-base font-extrabold text-amber-100"
            >
              {t('save')}
            </button>
          </div>
        )}

        <div className="mt-3 space-y-2">
          {donations.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm">
              <div>
                <p className="text-sm font-bold text-stone-900">
                  {d.anonymous ? t('anonymous') : d.devoteeName}
                </p>
                <p className="text-xs text-stone-500">
                  {d.purpose} · {fmtDate(d.createdAt, lang)} · {d.mode === 'online' ? t('payNow') : t('payAtTemple')}
                </p>
              </div>
              <span className="shrink-0 text-base font-extrabold text-maroon-800">
                ₹{d.amount.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
