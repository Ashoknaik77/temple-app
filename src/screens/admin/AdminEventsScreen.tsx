import { Link } from 'react-router-dom';
import { useLang } from '../../i18n';
import { deleteEvent, getEvents } from '../../data/mock';
import { ScreenHeader } from '../../components/ScreenHeader';
import { fmtDate, useLocalText } from '../../components/text';

/** Admin: list events, add/edit/delete. */
export function AdminEventsScreen() {
  const { t, lang } = useLang();
  const loc = useLocalText();
  const events = [...getEvents()].sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <div className="pb-24">
      <ScreenHeader title={t('manageEvents')} backTo="/admin/dashboard" />
      <div className="px-4 pt-3">
        <Link
          to="/admin/events/new"
          className="flex min-h-[56px] items-center justify-center rounded-2xl bg-maroon-800 text-base font-extrabold text-amber-100"
        >
          + {t('addNew')}
        </Link>
        <div className="mt-3 space-y-3">
          {events.map((e) => (
            <div key={e.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <h3 className="text-base font-bold text-stone-900">{loc(e.name)}</h3>
              <p className="text-sm text-stone-500">
                {fmtDate(e.date, lang)} · {e.time} · {e.location}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  to={`/admin/events/${e.id}`}
                  className="flex min-h-[48px] items-center justify-center rounded-xl bg-stone-100 text-sm font-bold text-stone-800"
                >
                  {t('edit')}
                </Link>
                <button
                  type="button"
                  onClick={() => deleteEvent(e.id)}
                  className="min-h-[48px] rounded-xl bg-stone-100 text-sm font-bold text-red-700"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
