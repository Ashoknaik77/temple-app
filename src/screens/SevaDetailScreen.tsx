import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLang } from '../i18n';
import { seatsLeft, sevas } from '../data/mock';
import { ScreenHeader } from '../components/ScreenHeader';
import { fmtDate, fmtTime, toISODate, useLocalText } from '../components/text';

const DAYS_AHEAD = 14;

/** Step 2 of booking: pick a date and an available time slot. */
export function SevaDetailScreen() {
  const { t, lang } = useLang();
  const loc = useLocalText();
  const navigate = useNavigate();
  const { sevaId } = useParams();
  const seva = sevas.find((s) => s.id === sevaId);

  const days = useMemo(() => {
    const out: string[] = [];
    const now = new Date();
    for (let i = 0; i < DAYS_AHEAD; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      out.push(toISODate(d));
    }
    return out;
  }, []);

  const [date, setDate] = useState(days[0]);

  if (!seva) {
    return (
      <div className="pb-24">
        <ScreenHeader title={t('chooseSeva')} backTo="/sevas" />
        <p className="px-4 pt-8 text-center text-stone-500">{t('tryAgain')}</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={loc(seva.name)} backTo="/sevas" />
      <div className="px-4 pt-3">
        <p className="text-sm leading-relaxed text-stone-600">{loc(seva.desc)}</p>
        <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
            {seva.price === 0 ? t('freeEntry') : `₹${seva.price}`}
          </span>
          <span className="text-stone-500">
            ⏱ {seva.durationMin} {t('mins')}
          </span>
        </div>

        <h2 className="mt-6 text-lg font-bold text-stone-900">{t('chooseDateTime')}</h2>

        {/* date strip */}
        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-2"
          role="radiogroup"
          aria-label={t('chooseDateTime')}
        >
          {days.map((d) => {
            const dt = new Date(d + 'T12:00:00');
            const active = d === date;
            return (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setDate(d)}
                className={`min-h-[64px] min-w-[64px] shrink-0 rounded-2xl px-2 py-2 text-center font-bold ${
                  active
                    ? 'bg-maroon-800 text-amber-100'
                    : 'bg-white text-stone-700 shadow-sm'
                }`}
              >
                <div className="text-xs font-semibold uppercase opacity-70">
                  {dt.toLocaleDateString(lang === 'kn' ? 'kn-IN' : 'en-IN', { weekday: 'short' })}
                </div>
                <div className="text-xl">{dt.getDate()}</div>
              </button>
            );
          })}
        </div>

        <h2 className="mt-5 text-lg font-bold text-stone-900">{t('selectSlot')}</h2>
        <p className="text-sm text-stone-500">{fmtDate(date, lang)}</p>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {seva.slotTimes.map((time) => {
            const left = seatsLeft(seva.id, date, time);
            const full = left <= 0;
            return (
              <button
                key={time}
                type="button"
                disabled={full}
                onClick={() => navigate(`/sevas/${seva.id}/book?date=${date}&time=${time}`)}
                className={`min-h-[72px] rounded-2xl p-3 text-left shadow-sm ${
                  full ? 'bg-stone-100 text-stone-400' : 'bg-white active:bg-amber-50'
                }`}
              >
                <div className="text-xl font-extrabold text-stone-900">{fmtTime(time)}</div>
                <div className={`mt-1 text-sm font-semibold ${full ? '' : 'text-emerald-700'}`}>
                  {full ? t('slotFull') : `${left} ${t('seatsLeft')}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
