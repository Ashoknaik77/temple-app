import { useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n';
import {
  createAdminUser,
  hasAnyAdmin,
  isAdminAuthed,
  verifyAdminLogin,
} from '../../data/mock';
import { ScreenHeader } from '../../components/ScreenHeader';

/**
 * Admin gate: phone + PIN login. Admin users are created by the super user
 * (phone number is the unique id). On first run, with no admins yet, the
 * gate offers to create the super admin account.
 */
export function AdminGate() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(isAdminAuthed());
  const [setupMode] = useState(() => !hasAnyAdmin());

  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (authed) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function login() {
    setError('');
    setBusy(true);
    try {
      const admin = await verifyAdminLogin(phone, pin);
      if (admin) {
        setAuthed(true);
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError(t('incorrectLogin'));
        setPin('');
      }
    } catch {
      setError(t('tryAgain'));
    } finally {
      setBusy(false);
    }
  }

  async function setup() {
    setError('');
    setBusy(true);
    try {
      await createAdminUser({ name, phone, pin, role: 'super' });
      const admin = await verifyAdminLogin(phone, pin);
      if (admin) {
        setAuthed(true);
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('tryAgain'));
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    'mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base focus:border-amber-600 focus:outline-none';

  return (
    <div className="pb-24">
      <ScreenHeader
        title={setupMode ? t('setupSuperAdmin') : t('adminLogin')}
        backTo="/more"
      />
      <div className="mx-auto mt-8 max-w-xs px-4">
        {setupMode ? (
          <>
            <p className="text-center text-sm text-stone-500">{t('setupSuperAdminNote')}</p>
            <label htmlFor="su-name" className="mt-4 block text-sm font-bold text-stone-800">
              {t('fullName')} *
            </label>
            <input
              id="su-name"
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
            <label htmlFor="su-phone" className="mt-3 block text-sm font-bold text-stone-800">
              {t('phone')} *
            </label>
            <input
              id="su-phone"
              className={inputCls}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              inputMode="tel"
              autoComplete="off"
              placeholder="98765 43210"
            />
            <label htmlFor="su-pin" className="mt-3 block text-sm font-bold text-stone-800">
              {t('choosePin')} *
            </label>
            <input
              id="su-pin"
              type="password"
              className={`${inputCls} text-center text-2xl tracking-[0.5em]`}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="new-password"
            />
            {error && (
              <p role="alert" className="mt-2 text-center text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={setup}
              disabled={busy}
              className="mt-4 min-h-[56px] w-full rounded-2xl bg-maroon-800 text-lg font-extrabold text-amber-100 disabled:opacity-60"
            >
              {t('createSuperAdmin')}
            </button>
          </>
        ) : (
          <>
            <label htmlFor="admin-phone" className="mt-4 block text-sm font-bold text-stone-800">
              {t('phone')}
            </label>
            <input
              id="admin-phone"
              className={inputCls}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              inputMode="tel"
              autoComplete="off"
              placeholder="98765 43210"
            />
            <label htmlFor="admin-pin" className="mt-3 block text-sm font-bold text-stone-800">
              {t('enterAdminPin')}
            </label>
            <input
              id="admin-pin"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && login()}
              className={`${inputCls} text-center text-2xl tracking-[0.5em]`}
              autoComplete="off"
            />
            {error && (
              <p role="alert" className="mt-2 text-center text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={login}
              disabled={busy}
              className="mt-4 min-h-[56px] w-full rounded-2xl bg-maroon-800 text-lg font-extrabold text-amber-100 disabled:opacity-60"
            >
              {t('adminLogin')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** Redirects to the admin gate when the admin session is missing. */
export function RequireAdmin() {
  if (!isAdminAuthed()) {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
}
