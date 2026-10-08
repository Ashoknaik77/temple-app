import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n';
import {
  adminLogout,
  adminStats,
  allBookings,
  allDonations,
  getTempleProfile,
  isSuperAdmin,
} from '../../data/mock';
import { ScreenHeader } from '../../components/ScreenHeader';
import { toISODate, useLocalText } from '../../components/text';

/** Admin home: branding, stats, quick actions, recent activity, pending work. */
export function AdminDashboardScreen() {
  const { t } = useLang();
  const loc = useLocalText();
  const navigate = useNavigate();
  const today = toISODate(new Date());
  const profile = getTempleProfile();
  const stats = adminStats(today);

  const recent = [
    ...allBookings()
      .slice(0, 3)
      .map((b) => ({
        id: b.id,
        icon: '🪔',
        text: `${loc(b.sevaName)} · ${b.devoteeName}`,
        sub: b.bookingCode,
      })),
    ...allDonations()
      .slice(0, 3)
      .map((d) => ({
        id: d.id,
        icon: '💰',
        text: `₹${d.amount.toLocaleString('en-IN')} · ${d.anonymous ? t('anonymous') : d.devoteeName}`,
        sub: d.receiptNo,
      })),
  ].slice(0, 5);

  const actions = [
    { to: '/admin/sevas', icon: '🪔', label: t('manageSevas') },
    { to: '/admin/events', icon: '📅', label: t('manageEvents') },
    { to: '/admin/bookings', icon: '🧾', label: t('manageBookings') },
    { to: '/admin/donations', icon: '💰', label: t('manageDonations') },
    { to: '/admin/announcements', icon: '📢', label: t('postAnnouncement') },
    { to: '/admin/profile', icon: '🛕', label: t('editTempleProfile') },
    { to: '/admin/reports', icon: '📊', label: t('reports') },
    ...(isSuperAdmin()
      ? [{ to: '/admin/users', icon: '👥', label: t('adminUsers') }]
      : []),
  ];

  function logout() {
    adminLogout();
    navigate('/more', { replace: true });
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={t('adminDashboard')} backTo="/more" />
      <div className="px-4 pt-3">
        {/* branding */}
        <div className="rounded-2xl bg-maroon-800 p-4 text-amber-100">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-700 text-2xl">
              🛕
            </div>
            <div>
              <h2 className="text-lg font-extrabold">{loc(profile.name)}</h2>
              <p className="text-xs opacity-80">{loc(profile.tagline)}</p>
            </div>
          </div>
        </div>

        {/* stats */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <StatCard label={t('todaysDonations')} value={`₹${stats.donationsToday.toLocaleString('en-IN')}`} />
          <StatCard label={t('todaysBookings')} value={String(stats.bookingsToday)} />
          <StatCard label={t('pendingItems')} value={String(stats.pendingCount)} alert={stats.pendingCount > 0} />
          <StatCard label={t('manageSevas')} value={String(stats.activeSevas)} />
        </div>

        {/* quick actions */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {actions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-2xl bg-white p-2 text-center shadow-sm active:bg-amber-50"
            >
              <span className="text-2xl" aria-hidden>
                {a.icon}
              </span>
              <span className="text-xs font-bold text-stone-800">{a.label}</span>
            </Link>
          ))}
        </div>

        {/* recent activity */}
        <h2 className="mt-5 text-sm font-bold uppercase tracking-wide text-stone-500">
          {t('recentActivity')}
        </h2>
        <div className="mt-2 space-y-2">
          {recent.length === 0 && <p className="text-sm text-stone-500">—</p>}
          {recent.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
              <span className="text-2xl" aria-hidden>
                {r.icon}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-stone-900">{r.text}</p>
                <p className="font-mono text-xs text-stone-400">{r.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={logout}
          className="mt-6 min-h-[52px] w-full rounded-2xl bg-white text-base font-bold text-red-700 shadow-sm"
        >
          {t('logout')}
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-2xl font-extrabold text-stone-900">{value}</p>
      <p className={`mt-1 text-xs font-bold ${alert ? 'text-red-700' : 'text-stone-500'}`}>{label}</p>
    </div>
  );
}
