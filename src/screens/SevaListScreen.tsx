import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import { getSevas } from '../data/mock';
import { ScreenHeader } from '../components/ScreenHeader';
import { useLocalText } from '../components/text';

/** Step 1 of booking: pick which seva. */
export function SevaListScreen() {
  const { t } = useLang();
  const loc = useLocalText();
  const sevas = getSevas();

  return (
    <div className="pb-24">
      <ScreenHeader title={t('chooseSeva')} />
      <div className="mt-4 space-y-3 px-4">
        {sevas
          .filter((s) => s.active)
          .map((s) => (
            <Link
              key={s.id}
              to={`/sevas/${s.id}`}
              className="block rounded-2xl bg-white p-4 shadow-sm active:bg-amber-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-stone-900">{loc(s.name)}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{loc(s.desc)}</p>
                </div>
                <span className="text-2xl text-stone-400" aria-hidden>
                  →
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm font-semibold">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
                  {s.price === 0 ? t('freeEntry') : `₹${s.price}`}
                </span>
                <span className="text-stone-500">
                  ⏱ {s.durationMin} {t('mins')}
                </span>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
