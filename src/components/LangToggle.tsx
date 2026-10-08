import { useLang, type Lang } from '../i18n';

/** EN / ಕನ್ನಡ toggle — shown at the top of every screen. */
export function LangToggle() {
  const { lang, setLang } = useLang();
  const pick = (l: Lang) => setLang(l);
  return (
    <div
      role="group"
      aria-label="Language / ಭಾಷೆ"
      className="flex overflow-hidden rounded-full border border-stone-300 bg-white text-sm font-bold"
    >
      {(['en', 'kn'] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => pick(l)}
          aria-pressed={lang === l}
          className={`min-h-[40px] px-4 ${lang === l ? 'bg-amber-700 text-white' : 'text-stone-600'}`}
        >
          {l === 'en' ? 'EN' : 'ಕನ್ನಡ'}
        </button>
      ))}
    </div>
  );
}
