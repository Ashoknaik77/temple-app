import { useState } from 'react';
import { useLang } from '../../i18n';
import { addAnnouncement, getAnnouncements } from '../../data/mock';
import { ScreenHeader } from '../../components/ScreenHeader';
import { fmtDate, toISODate, useLocalText } from '../../components/text';

const inputCls =
  'mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 focus:border-amber-600 focus:outline-none';

/** Admin: post a bilingual announcement. */
export function AdminAnnouncementsScreen() {
  const { t, lang } = useLang();
  const loc = useLocalText();
  const [textEn, setTextEn] = useState('');
  const [textKn, setTextKn] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState('');

  const list = getAnnouncements();
  void refresh;

  function submit() {
    if (!textEn.trim()) {
      setError(t('nameRequired'));
      return;
    }
    addAnnouncement({
      id: `a-${Date.now()}`,
      text: { en: textEn.trim(), kn: textKn.trim() || textEn.trim() },
      createdAt: toISODate(new Date()),
    });
    setTextEn('');
    setTextKn('');
    setError('');
    setRefresh((r) => r + 1);
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={t('postAnnouncement')} backTo="/admin/dashboard" />
      <div className="px-4 pt-3">
        <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <label className="text-sm font-bold text-stone-800" htmlFor="adm-an-en">
              Announcement (English) *
            </label>
            <textarea
              id="adm-an-en"
              className={inputCls}
              rows={2}
              value={textEn}
              onChange={(e) => setTextEn(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-bold text-stone-800" htmlFor="adm-an-kn">
              ಘೋಷಣೆ (ಕನ್ನಡ)
            </label>
            <textarea
              id="adm-an-kn"
              className={inputCls}
              rows={2}
              value={textKn}
              onChange={(e) => setTextKn(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={submit}
            className="min-h-[52px] w-full rounded-2xl bg-maroon-800 text-base font-extrabold text-amber-100"
          >
            {t('post')}
          </button>
        </div>

        <h2 className="mt-5 text-sm font-bold uppercase tracking-wide text-stone-500">
          {t('announcements')}
        </h2>
        <div className="mt-2 space-y-2">
          {list.map((a) => (
            <div key={a.id} className="rounded-2xl bg-white p-3 shadow-sm">
              <p className="text-sm text-stone-800">{loc(a.text)}</p>
              <p className="mt-1 text-xs text-stone-400">{fmtDate(a.createdAt, lang)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
