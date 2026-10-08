import { useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n';
import { adminLogin, isAdminAuthed } from '../../data/mock';
import { ScreenHeader } from '../../components/ScreenHeader';

/** PIN gate for the admin area (demo-grade; real auth comes with the backend). */
export function AdminGate() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [authed, setAuthed] = useState(isAdminAuthed());

  if (authed) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  function submit() {
    if (adminLogin(pin)) {
      setAuthed(true);
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError(t('incorrectPin'));
      setPin('');
    }
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={t('adminLogin')} backTo="/more" />
      <div className="mx-auto mt-10 max-w-xs px-4">
        <p className="text-center text-sm text-stone-500">{t('adminNote')}</p>
        <label htmlFor="admin-pin" className="mt-4 block text-sm font-bold text-stone-800">
          {t('enterAdminPin')}
        </label>
        <input
          id="admin-pin"
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-4 text-center text-2xl tracking-[0.5em] focus:border-amber-600 focus:outline-none"
          autoComplete="off"
        />
        {error && (
          <p role="alert" className="mt-2 text-center text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={submit}
          className="mt-4 min-h-[56px] w-full rounded-2xl bg-maroon-800 text-lg font-extrabold text-amber-100"
        >
          {t('adminLogin')}
        </button>
      </div>
    </div>
  );
}

/** Redirects to the PIN gate when the admin session is missing. */
export function RequireAdmin() {
  if (!isAdminAuthed()) {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
}
