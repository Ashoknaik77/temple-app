import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLang } from '../../i18n';
import { getEvents, saveEvent } from '../../data/mock';
import type { TempleEvent } from '../../types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { toISODate } from '../../components/text';

const inputCls =
  'mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 focus:border-amber-600 focus:outline-none';

/** Admin: add or edit an event. */
export function AdminEventFormScreen() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { id } = useParams();
  // '/admin/events/new' is a static route with no :id param (id === undefined);
  // treat both as "create new".
  const isNew = !id || id === 'new';
  const existing = isNew ? null : getEvents().find((e) => e.id === id);

  const [nameEn, setNameEn] = useState(existing?.name.en ?? '');
  const [nameKn, setNameKn] = useState(existing?.name.kn ?? '');
  const [descEn, setDescEn] = useState(existing?.desc.en ?? '');
  const [descKn, setDescKn] = useState(existing?.desc.kn ?? '');
  const [date, setDate] = useState(existing?.date ?? toISODate(new Date()));
  const [time, setTime] = useState(existing?.time ?? '');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [error, setError] = useState('');

  if (!isNew && !existing) {
    return (
      <div className="pb-24">
        <ScreenHeader title={t('manageEvents')} backTo="/admin/events" />
        <p className="px-4 pt-8 text-center text-stone-500">{t('tryAgain')}</p>
      </div>
    );
  }

  async function submit() {
    if (!nameEn.trim() || !date) {
      setError(t('nameRequired'));
      return;
    }
    const event: TempleEvent = {
      id: existing?.id ?? `event-${Date.now()}`,
      name: { en: nameEn.trim(), kn: nameKn.trim() || nameEn.trim() },
      desc: { en: descEn.trim(), kn: descKn.trim() || descEn.trim() },
      date,
      time: time.trim(),
      location: location.trim(),
      rsvpEnabled: existing?.rsvpEnabled ?? false,
    };
    await saveEvent(event);
    navigate('/admin/events', { replace: true });
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={isNew ? t('addNew') : t('edit')} backTo="/admin/events" />
      <div className="space-y-4 px-4 pt-3">
        <Field label="Name (English)">
          <input className={inputCls} value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </Field>
        <Field label="ಹೆಸರು (ಕನ್ನಡ)">
          <input className={inputCls} value={nameKn} onChange={(e) => setNameKn(e.target.value)} />
        </Field>
        <Field label="Description (English)">
          <textarea className={inputCls} rows={2} value={descEn} onChange={(e) => setDescEn(e.target.value)} />
        </Field>
        <Field label="ವಿವರಣೆ (ಕನ್ನಡ)">
          <textarea className={inputCls} rows={2} value={descKn} onChange={(e) => setDescKn(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('chooseDateTime')}>
            <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label={t('selectSlot')}>
            <input className={inputCls} value={time} onChange={(e) => setTime(e.target.value)} placeholder="6:00 PM" />
          </Field>
        </div>
        <Field label={t('location')}>
          <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} />
        </Field>
        {error && (
          <p role="alert" className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={submit}
          className="min-h-[56px] w-full rounded-2xl bg-maroon-800 text-lg font-extrabold text-amber-100"
        >
          {t('save')}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-bold text-stone-800">{label}</label>
      {children}
    </div>
  );
}
