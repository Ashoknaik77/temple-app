import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useLang } from '../../i18n';
import {
  createAdminUser,
  currentAdmin,
  getAdmins,
  isSuperAdmin,
  setAdminActive,
} from '../../data/mock';
import { ScreenHeader } from '../../components/ScreenHeader';

/** Super user: create and manage temple admin users (phone is the unique id). */
export function AdminUsersScreen() {
  const { t } = useLang();
  const [refresh, setRefresh] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<'admin' | 'super'>('admin');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const admins = useMemo(() => getAdmins(), [refresh]);
  const me = currentAdmin()?.phone;

  if (!isSuperAdmin()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const inputCls =
    'mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base focus:border-amber-600 focus:outline-none';

  async function submit() {
    setError('');
    setBusy(true);
    try {
      await createAdminUser({ name, phone, pin, role });
      setName('');
      setPhone('');
      setPin('');
      setRole('admin');
      setRefresh((r) => r + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('tryAgain'));
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(target: string, active: boolean) {
    if (target === me) {
      setError(t('cannotDeactivateSelf'));
      return;
    }
    if (await setAdminActive(target, active)) setRefresh((r) => r + 1);
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={t('adminUsers')} backTo="/admin/dashboard" />
      <div className="px-4 pt-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-stone-500">
          {t('addAdminUser')}
        </h2>
        <div className="mt-2 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <label htmlFor="au-name" className="text-sm font-bold text-stone-800">
              {t('fullName')} *
            </label>
            <input
              id="au-name"
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="au-phone" className="text-sm font-bold text-stone-800">
                {t('phone')} *
              </label>
              <input
                id="au-phone"
                className={inputCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                inputMode="tel"
                autoComplete="off"
                placeholder="98765 43210"
              />
            </div>
            <div>
              <label htmlFor="au-pin" className="text-sm font-bold text-stone-800">
                {t('choosePin')} *
              </label>
              <input
                id="au-pin"
                type="password"
                className={inputCls}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoComplete="new-password"
              />
            </div>
          </div>
          <div>
            <label htmlFor="au-role" className="text-sm font-bold text-stone-800">
              {t('role')}
            </label>
            <select
              id="au-role"
              className={inputCls}
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'super')}
            >
              <option value="admin">{t('roleAdmin')}</option>
              <option value="super">{t('roleSuper')}</option>
            </select>
          </div>
          {error && (
            <p role="alert" className="text-sm font-bold text-red-700">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="min-h-[52px] w-full rounded-2xl bg-maroon-800 text-base font-extrabold text-amber-100 disabled:opacity-60"
          >
            {t('addAdminUser')}
          </button>
        </div>

        <h2 className="mt-5 text-sm font-bold uppercase tracking-wide text-stone-500">
          {t('adminUsers')} ({admins.length})
        </h2>
        <div className="mt-2 space-y-3">
          {admins.map((a) => (
            <div key={a.phone} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {a.name}
                    {a.phone === me && (
                      <span className="ml-2 text-xs font-bold text-stone-400">
                        ({t('you')})
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-stone-500">{a.phone}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${
                    a.role === 'super'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {t(a.role === 'super' ? 'roleSuper' : 'roleAdmin')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => toggleActive(a.phone, !a.active)}
                disabled={a.phone === me}
                className={`mt-3 min-h-[44px] w-full rounded-xl text-sm font-bold disabled:opacity-40 ${
                  a.active ? 'bg-stone-100 text-red-700' : 'bg-emerald-700 text-white'
                }`}
              >
                {a.active ? t('deactivate') : t('activate')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
