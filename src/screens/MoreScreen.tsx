import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import { ScreenHeader } from '../components/ScreenHeader';
import type { EnKeys } from '../i18n/en';

/** More tab: devotee shortcuts + admin entry. */
export function MoreScreen() {
  const { t } = useLang();

  const links: { to: string; icon: string; key: EnKeys }[] = [
    { to: '/bookings', icon: '🧾', key: 'myBookings' },
    { to: '/donations', icon: '💰', key: 'donationHistory' },
    { to: '/timings', icon: '🕉️', key: 'dailyTimings' },
    { to: '/contact', icon: '📞', key: 'contactTemple' },
    { to: '/gallery', icon: '🖼️', key: 'gallery' },
  ];

  return (
    <div className="pb-24">
      <ScreenHeader title={t('more')} backTo="/" />
      <div className="mt-3 space-y-2 px-4">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="flex min-h-[60px] items-center gap-3 rounded-2xl bg-white px-4 shadow-sm active:bg-amber-50"
          >
            <span className="text-2xl" aria-hidden>
              {l.icon}
            </span>
            <span className="flex-1 text-base font-bold text-stone-800">{t(l.key)}</span>
            <span className="text-stone-400" aria-hidden>
              →
            </span>
          </Link>
        ))}

        <Link
          to="/admin"
          className="flex min-h-[60px] items-center gap-3 rounded-2xl bg-maroon-800 px-4 shadow-sm"
        >
          <span className="text-2xl" aria-hidden>
            🔐
          </span>
          <span className="flex-1 text-base font-bold text-amber-100">{t('adminLogin')}</span>
          <span className="text-amber-100/60" aria-hidden>
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
