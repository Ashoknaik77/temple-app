import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import { LangToggle } from '../components/LangToggle';
import type { EnKeys } from '../i18n/en';

/** Temporary screen for phases not yet built. */
export function PlaceholderScreen({ titleKey }: { titleKey: EnKeys }) {
  const { t } = useLang();
  return (
    <div className="px-4 pb-24 pt-4">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-2xl" aria-label={t('back')}>←</Link>
        <LangToggle />
      </div>
      <h1 className="mt-4 text-2xl font-extrabold text-stone-900">{t(titleKey)}</h1>
      <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-5xl" aria-hidden>🛕</p>
        <p className="mt-3 text-sm text-stone-500">{t('loading')}</p>
      </div>
    </div>
  );
}
