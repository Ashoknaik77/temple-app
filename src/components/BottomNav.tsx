import { NavLink } from 'react-router-dom';
import { useLang } from '../i18n';
import type { EnKeys } from '../i18n/en';

const TABS: { to: string; key: EnKeys; icon: string }[] = [
  { to: '/', key: 'home', icon: '🛕' },
  { to: '/sevas', key: 'seva', icon: '🪔' },
  { to: '/donate', key: 'donate', icon: '💰' },
  { to: '/events', key: 'events', icon: '📅' },
  { to: '/more', key: 'more', icon: '⋯' },
];

export function BottomNav() {
  const { t } = useLang();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-xs font-semibold ${
                isActive ? 'text-amber-700' : 'text-stone-500'
              }`
            }
          >
            <span className="text-2xl" aria-hidden>
              {tab.icon}
            </span>
            {t(tab.key)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
