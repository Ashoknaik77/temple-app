import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import { myDeviceDonations } from '../data/mock';
import { ScreenHeader } from '../components/ScreenHeader';
import { fmtDate } from '../components/text';

/** Devotee's donation history with receipt links. */
export function DonationHistoryScreen() {
  const { t, lang } = useLang();
  const donations = myDeviceDonations();
  const total = donations.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="pb-24">
      <ScreenHeader title={t('donationHistory')} />
      <div className="px-4 pt-3">
        {donations.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-5xl" aria-hidden>
              💰
            </p>
            <p className="mt-3 text-stone-500">{t('noDonations')}</p>
            <Link
              to="/donate"
              className="mt-4 inline-flex min-h-[52px] items-center rounded-2xl bg-maroon-800 px-6 text-base font-extrabold text-amber-100"
            >
              {t('donateNow')}
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-maroon-800 p-4 text-amber-100">
              <p className="text-sm font-semibold uppercase opacity-70">{t('total')}</p>
              <p className="text-3xl font-extrabold">₹{total.toLocaleString('en-IN')}</p>
              <p className="text-sm opacity-80">
                {donations.length} {t('donationHistory').toLowerCase()}
              </p>
            </div>
            <div className="mt-3 space-y-3">
              {donations.map((d) => (
                <Link
                  key={d.id}
                  to={`/donations/${d.receiptNo}`}
                  className="block rounded-2xl bg-white p-4 shadow-sm active:bg-amber-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-stone-900">
                        {d.anonymous ? t('anonymous') : d.devoteeName}
                      </h3>
                      <p className="mt-0.5 text-sm text-stone-500">
                        {d.purpose} · {fmtDate(d.createdAt, lang)}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-stone-400">{d.receiptNo}</p>
                    </div>
                    <span className="shrink-0 text-lg font-extrabold text-maroon-800">
                      ₹{d.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
