import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLang } from '../../i18n';
import { getSevas, saveSeva } from '../../data/mock';
import type { Seva } from '../../types';
import { ScreenHeader } from '../../components/ScreenHeader';

const inputCls =
  'mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 focus:border-amber-600 focus:outline-none';

/** Admin: add or edit a seva (bilingual name/desc, price, slots, capacity). */
export function AdminSevaFormScreen() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === 'new';
  const existing = isNew ? null : getSevas().find((s) => s.id === id);

  const [nameEn, setNameEn] = useState(existing?.name.en ?? '');
  const [nameKn, setNameKn] = useState(existing?.name.kn ?? '');
  const [descEn, setDescEn] = useState(existing?.desc.en ?? '');
  const [descKn, setDescKn] = useState(existing?.desc.kn ?? '');
  const [price, setPrice] = useState(existing ? String(existing.price) : '0');
  const [capacity, setCapacity] = useState(existing ? String(existing.capacity) : '10');
  const [slots, setSlots] = useState(existing ? existing.slotTimes.join(', ') : '');
  const [duration, setDuration] = useState(existing ? String(existing.durationMin) : '15');
  const [error, setError] = useState('');

  if (!isNew && !existing) {
    return (
      <div className="pb-24">
        <ScreenHeader title={t('manageSevas')} backTo="/admin/sevas" />
        <p className="px-4 pt-8 text-center text-stone-500">{t('tryAgain')}</p>
      </div>
    );
  }

  async function submit() {
    if (!nameEn.trim()) {
      setError(t('nameRequired'));
      return;
    }
    const slotTimes = slots
      .split(',')
      .map((s) => s.trim())
      .filter((s) => /^\d{1,2}:\d{2}$/.test(s))
      .map((s) => {
        const [h, m] = s.split(':').map(Number);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      });
    if (slotTimes.length === 0) {
      setError(t('selectSlot'));
      return;
    }
    const seva: Seva = {
      id: existing?.id ?? `seva-${Date.now()}`,
      name: { en: nameEn.trim(), kn: nameKn.trim() || nameEn.trim() },
      desc: { en: descEn.trim(), kn: descKn.trim() || descEn.trim() },
      price: Math.max(0, Number(price) || 0),
      durationMin: Math.max(5, Number(duration) || 15),
      capacity: Math.max(1, Number(capacity) || 10),
      slotTimes,
      active: existing?.active ?? true,
    };
    await saveSeva(seva);
    navigate('/admin/sevas', { replace: true });
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={isNew ? t('addNew') : t('edit')} backTo="/admin/sevas" />
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
        <div className="grid grid-cols-3 gap-3">
          <Field label="₹ Price">
            <input className={inputCls} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Field label={t('numPeople')}>
            <input className={inputCls} inputMode="numeric" value={capacity} onChange={(e) => setCapacity(e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Field label={t('mins')}>
            <input className={inputCls} inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value.replace(/\D/g, ''))} />
          </Field>
        </div>
        <Field label="Slots (HH:MM, comma separated)">
          <input className={inputCls} value={slots} onChange={(e) => setSlots(e.target.value)} placeholder="06:00, 18:00" />
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
