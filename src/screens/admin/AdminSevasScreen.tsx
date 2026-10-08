import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../i18n';
import { getSevas, saveSeva } from '../../data/mock';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useLocalText } from '../../components/text';

/** Admin: list sevas, toggle active, add/edit. */
export function AdminSevasScreen() {
  const { t } = useLang();
  const loc = useLocalText();
  const sevas = getSevas();
  const [, setRefresh] = useState(0);

  async function toggle(id: string) {
    const s = sevas.find((x) => x.id === id);
    if (s) {
      await saveSeva({ ...s, active: !s.active });
      setRefresh((r) => r + 1);
    }
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={t('manageSevas')} backTo="/admin/dashboard" />
      <div className="px-4 pt-3">
        <Link
          to="/admin/sevas/new"
          className="flex min-h-[56px] items-center justify-center rounded-2xl bg-maroon-800 text-base font-extrabold text-amber-100"
        >
          + {t('addNew')}
        </Link>
        <div className="mt-3 space-y-3">
          {sevas.map((s) => (
            <div key={s.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-stone-900">{loc(s.name)}</h3>
                  <p className="text-sm text-stone-500">
                    ₹{s.price} · {s.slotTimes.join(', ')} · {s.capacity}/{t('seatsLeft')}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${
                    s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {s.active ? t('activate') : t('deactivate')}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  to={`/admin/sevas/${s.id}`}
                  className="flex min-h-[48px] items-center justify-center rounded-xl bg-stone-100 text-sm font-bold text-stone-800"
                >
                  {t('edit')}
                </Link>
                <button
                  type="button"
                  onClick={() => toggle(s.id)}
                  className="min-h-[48px] rounded-xl bg-stone-100 text-sm font-bold text-stone-800"
                >
                  {s.active ? t('deactivate') : t('activate')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
