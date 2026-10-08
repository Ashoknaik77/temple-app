import { useLang } from '../i18n';
import { getEvents } from '../data/mock';
import { ScreenHeader } from '../components/ScreenHeader';
import { fmtDate, fmtTime, toISODate, useLocalText } from '../components/text';

/** Devotee: upcoming temple events, soonest first. */
export function EventsScreen() {
  const { t, lang } = useLang();
  const loc = useLocalText();
  const today = toISODate(new Date());
  const events = getEvents()
    .filter((e) => e.date >= today)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.time < b.time ? -1 : 1));

  return (
    <div className="pb-24">
      <ScreenHeader title={t('upcomingEvents')} backTo="/" />
      <div className="px-4 pt-3">
        {events.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500 shadow-sm">
            {t('noEvents')}
          </p>
        )}
        <div className="space-y-3">
          {events.map((e) => (
            <article key={e.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {e.posterUrl && (
                <img src={e.posterUrl} alt="" className="h-36 w-full object-cover" loading="lazy" />
              )}
              <div className="p-4">
                <h2 className="text-base font-extrabold text-stone-900">{loc(e.name)}</h2>
                <p className="mt-1 text-sm font-bold text-amber-800">
                  {fmtDate(e.date, lang)} · {fmtTime(e.time)}
                </p>
                {e.location && (
                  <p className="mt-1 text-sm text-stone-600">
                    📍 {e.location}
                  </p>
                )}
                {(e.desc.en || e.desc.kn) && (
                  <p className="mt-2 text-sm text-stone-600">{loc(e.desc)}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
