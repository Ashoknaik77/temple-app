import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n';
import { getTempleProfile, saveTempleProfile } from '../../data/mock';
import type { TempleProfile } from '../../types';
import { ScreenHeader } from '../../components/ScreenHeader';

const inputCls =
  'mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 focus:border-amber-600 focus:outline-none';

/** Admin: edit temple branding/profile — no code changes needed. */
export function AdminProfileScreen() {
  const { t } = useLang();
  const navigate = useNavigate();
  const current = getTempleProfile();

  const [nameEn, setNameEn] = useState(current.name.en);
  const [nameKn, setNameKn] = useState(current.name.kn);
  const [tagEn, setTagEn] = useState(current.tagline.en);
  const [tagKn, setTagKn] = useState(current.tagline.kn);
  const [aboutEn, setAboutEn] = useState(current.about.en);
  const [aboutKn, setAboutKn] = useState(current.about.kn);
  const [address, setAddress] = useState(current.address);
  const [phone, setPhone] = useState(current.phone);
  const [whatsapp, setWhatsapp] = useState(current.whatsapp);
  const [email, setEmail] = useState(current.email);
  const [morning, setMorning] = useState(current.timings.morning);
  const [evening, setEvening] = useState(current.timings.evening);
  const [friday, setFriday] = useState(current.timings.fridaySpecial);

  async function submit() {
    const profile: TempleProfile = {
      ...current,
      name: { en: nameEn.trim(), kn: nameKn.trim() || nameEn.trim() },
      tagline: { en: tagEn.trim(), kn: tagKn.trim() || tagEn.trim() },
      about: { en: aboutEn.trim(), kn: aboutKn.trim() || aboutEn.trim() },
      address: address.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      timings: { morning: morning.trim(), evening: evening.trim(), fridaySpecial: friday.trim() },
    };
    await saveTempleProfile(profile);
    navigate('/admin/dashboard', { replace: true });
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={t('editTempleProfile')} backTo="/admin/dashboard" />
      <div className="space-y-4 px-4 pt-3">
        <Field label={t('templeName')}>
          <input className={inputCls} value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </Field>
        <Field label="ದೇವಸ್ಥಾನದ ಹೆಸರು">
          <input className={inputCls} value={nameKn} onChange={(e) => setNameKn(e.target.value)} />
        </Field>
        <Field label={t('tagline')}>
          <input className={inputCls} value={tagEn} onChange={(e) => setTagEn(e.target.value)} />
        </Field>
        <Field label="ಘೋಷವಾಕ್ಯ">
          <input className={inputCls} value={tagKn} onChange={(e) => setTagKn(e.target.value)} />
        </Field>
        <Field label={t('about')}>
          <textarea className={inputCls} rows={3} value={aboutEn} onChange={(e) => setAboutEn(e.target.value)} />
        </Field>
        <Field label="ದೇವಸ್ಥಾನದ ಬಗ್ಗೆ">
          <textarea className={inputCls} rows={3} value={aboutKn} onChange={(e) => setAboutKn(e.target.value)} />
        </Field>
        <Field label={t('address')}>
          <input className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('phone')}>
            <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label={t('whatsapp')}>
            <input className={inputCls} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </Field>
        </div>
        <Field label={t('email')}>
          <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={`${t('timings')} (morning)`}>
          <input className={inputCls} value={morning} onChange={(e) => setMorning(e.target.value)} />
        </Field>
        <Field label={`${t('timings')} (evening)`}>
          <input className={inputCls} value={evening} onChange={(e) => setEvening(e.target.value)} />
        </Field>
        <Field label={`${t('timings')} (Friday)`}>
          <input className={inputCls} value={friday} onChange={(e) => setFriday(e.target.value)} />
        </Field>
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
