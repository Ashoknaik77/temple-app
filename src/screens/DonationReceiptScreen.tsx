import { Link, useParams } from 'react-router-dom';
import { useLang } from '../i18n';
import { findDonationByReceipt, getTempleProfile } from '../data/mock';
import { ScreenHeader } from '../components/ScreenHeader';
import { fmtDate, useLocalText } from '../components/text';

/** 80G donation receipt: printable, with temple registration details. */
export function DonationReceiptScreen() {
  const { t, lang } = useLang();
  const loc = useLocalText();
  const { receiptNo } = useParams();
  const donation = receiptNo ? findDonationByReceipt(receiptNo) : null;
  const templeProfile = getTempleProfile();

  if (!donation) {
    return (
      <div className="pb-24">
        <ScreenHeader title={t('downloadReceipt')} backTo="/donations" />
        <p className="px-4 pt-8 text-center text-stone-500">{t('tryAgain')}</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="print:hidden">
        <ScreenHeader title={t('thankYouDonation')} backTo="/donate" />
      </div>

      <div className="px-4 pt-3">
        <div
          id="donation-receipt"
          className="rounded-2xl border-2 border-amber-700 bg-white p-6 shadow-sm"
        >
          <div className="text-center">
            <div className="text-4xl" aria-hidden>
              🛕
            </div>
            <h2 className="mt-2 text-xl font-extrabold text-stone-900">{loc(templeProfile.name)}</h2>
            <p className="text-xs text-stone-500">{templeProfile.address}</p>
            {templeProfile.reg80G && (
              <p className="mt-1 text-xs font-bold text-stone-600">{templeProfile.reg80G}</p>
            )}
          </div>

          <hr className="my-4 border-amber-200" />

          <dl className="space-y-2 text-[15px]">
            <div className="flex justify-between gap-3">
              <dt className="text-stone-500">{t('receiptNo')}</dt>
              <dd className="font-mono font-bold text-stone-900">{donation.receiptNo}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-stone-500">{t('donorName')}</dt>
              <dd className="text-right font-bold text-stone-900">
                {donation.anonymous ? t('anonymous') : donation.devoteeName}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-stone-500">{t('purpose')}</dt>
              <dd className="text-right font-bold text-stone-900">{donation.purpose}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-stone-500">{t('donationAmount')}</dt>
              <dd className="text-right text-2xl font-extrabold text-maroon-800">
                ₹{donation.amount.toLocaleString('en-IN')}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-stone-500">{t('madeOn')}</dt>
              <dd className="text-right font-bold text-stone-900">
                {fmtDate(donation.createdAt, lang)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-stone-500">{t('status')}</dt>
              <dd className="text-right font-bold text-stone-900">
                {donation.mode === 'online' ? t('payNow') : t('offlineDonationNote')}
              </dd>
            </div>
          </dl>

          <hr className="my-4 border-amber-200" />
          <p className="text-center text-xs leading-relaxed text-stone-500">
            🙏 {t('thankYouDonation')}
          </p>
        </div>

        <div className="print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-4 min-h-[56px] w-full rounded-2xl bg-maroon-800 text-lg font-extrabold text-amber-100 shadow"
          >
            🖨️ {t('downloadReceipt')}
          </button>
          <Link
            to="/donations"
            className="mt-3 flex min-h-[52px] items-center justify-center rounded-2xl bg-white text-base font-bold text-stone-700 shadow-sm"
          >
            {t('donationHistory')}
          </Link>
        </div>
      </div>
    </div>
  );
}
