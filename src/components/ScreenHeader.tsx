import { Link } from 'react-router-dom';
import { useLang } from '../i18n';
import { LangToggle } from './LangToggle';

/** Consistent top bar: back button, title, language toggle. */
export function ScreenHeader({ title, backTo = '/' }: { title: string; backTo?: string }) {
  const { t } = useLang();
  return (
    <div className="flex items-center justify-between px-4 pt-4">
      <Link
        to={backTo}
        aria-label={t('back')}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl text-stone-700 shadow-sm"
      >
        ←
      </Link>
      <h1 className="flex-1 px-3 text-center text-xl font-extrabold text-stone-900">{title}</h1>
      <LangToggle />
    </div>
  );
}
