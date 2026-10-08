import { useLang } from '../i18n';
import { getAdmins, getTempleProfile } from '../data/mock';
import { ScreenHeader } from '../components/ScreenHeader';
import { useLocalText } from '../components/text';

/** Devotee: temple contact details + other admins' names/phones (super admin excluded). */
export function ContactScreen() {
  const { t } = useLang();
  const loc = useLocalText();
  const profile = getTempleProfile();
  const admins = getAdmins().filter((a) => a.role !== 'super' && a.active);

  return (
    <div className="pb-24">
      <ScreenHeader title={t('contactTemple')} backTo="/" />
      <div className="px-4 pt-3">
        <div className="rounded-2xl bg-maroon-800 p-4 text-amber-100">
          <h2 className="text-lg font-extrabold">{loc(profile.name)}</h2>
          <p className="text-xs opacity-80">{profile.address}</p>
        </div>

        <a
          href={`tel:${profile.phone.replace(/\s/g, '')}`}
          className="mt-3 flex min-h-[64px] items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
        >
          <span className="text-2xl" aria-hidden>
            📞
          </span>
          <span>
            <span className="block text-xs font-bold text-stone-500">{t('templeOffice')}</span>
            <span className="block text-base font-extrabold text-stone-900">{profile.phone}</span>
          </span>
        </a>

        {admins.length > 0 && (
          <>
            <h2 className="mt-4 px-1 text-sm font-extrabold text-stone-700">{t('templeAdmins')}</h2>
            <div className="mt-2 space-y-2">
              {admins.map((a) => (
                <a
                  key={a.phone}
                  href={`tel:${a.phone}`}
                  className="flex min-h-[64px] items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-base font-extrabold text-amber-900"
                    aria-hidden
                  >
                    {a.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span>
                    <span className="block text-base font-extrabold text-stone-900">{a.name}</span>
                    <span className="block text-sm text-stone-500">{a.phone}</span>
                  </span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
