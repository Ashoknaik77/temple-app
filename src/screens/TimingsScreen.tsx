import { useLang } from '../i18n';
import { getTempleProfile } from '../data/mock';
import { ScreenHeader } from '../components/ScreenHeader';
import { useLocalText } from '../components/text';

/** Devotee: daily temple timings from the temple profile. */
export function TimingsScreen() {
  const { t } = useLang();
  const loc = useLocalText();
  const profile = getTempleProfile();
  const rows = [
    { label: t('morningTimings'), value: profile.timings.morning },
    { label: t('eveningTimings'), value: profile.timings.evening },
    { label: t('fridaySpecial'), value: profile.timings.fridaySpecial },
  ].filter((r) => r.value.trim());

  return (
    <div className="pb-24">
      <ScreenHeader title={t('dailyTimings')} backTo="/" />
      <div className="px-4 pt-3">
        <div className="rounded-2xl bg-maroon-800 p-4 text-amber-100">
          <h2 className="text-lg font-extrabold">{loc(profile.name)}</h2>
          <p className="text-xs opacity-80">{profile.address}</p>
        </div>
        {rows.length === 0 && (
          <p className="mt-3 rounded-2xl bg-white p-6 text-center text-sm text-stone-500 shadow-sm">
            {t('noTimings')}
          </p>
        )}
        <dl className="mt-3 space-y-3">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm"
            >
              <dt className="text-sm font-bold text-stone-500">{r.label}</dt>
              <dd className="text-right text-base font-extrabold text-stone-900">{r.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 px-1 text-xs text-stone-400">{t('timingsNote')}</p>
      </div>
    </div>
  );
}
