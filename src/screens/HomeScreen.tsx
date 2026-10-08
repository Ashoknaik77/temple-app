import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../i18n';
import { LangToggle } from '../components/LangToggle';
import type { Localized } from '../types';
import {
  dailyInfo,
  getAnnouncements,
  getTempleProfile,
  myDeviceBookings,
  nextMajorEvent,
} from '../data/mock';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function useLocal() {
  const { lang } = useLang();
  return (v: Localized) => (lang === 'kn' ? v.kn : v.en);
}

function Countdown({ date }: { date: string }) {
  const { t } = useLang();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const target = new Date(date + 'T00:00:00').getTime();
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      {[
        [d, t('days')],
        [h, t('hours')],
        [m, t('mins')],
      ].map(([v, label]) => (
        <div key={label as string} className="text-center">
          <div className="min-w-[56px] rounded-xl bg-maroon-800 px-2 py-1.5 text-2xl font-extrabold text-amber-100">
            {v}
          </div>
          <div className="mt-1 text-xs font-semibold text-amber-100/80">{label}</div>
        </div>
      ))}
    </div>
  );
}

export function HomeScreen() {
  const { t } = useLang();
  const loc = useLocal();
  const navigate = useNavigate();
  const today = todayStr();
  const templeProfile = getTempleProfile();
  const announcements = getAnnouncements();

  const nextEvent = useMemo(() => nextMajorEvent(today), [today]);
  const nextBooking = useMemo(
    () =>
      myDeviceBookings()
        .filter((b) => b.date >= today && b.status === 'confirmed')
        .sort((a, b) => (a.date < b.date ? -1 : 1))[0] ?? null,
    [today],
  );
  const todaysBooking = nextBooking?.date === today ? nextBooking : null;
  const [popupOpen, setPopupOpen] = useState(!!todaysBooking);

  const tiles = [
    { to: '/sevas', icon: '🪔', label: t('bookSeva') },
    { to: '/donate', icon: '💰', label: t('donateTitle') },
    { to: '/events', icon: '📅', label: t('upcomingEvents') },
    { to: '/timings', icon: '🕉️', label: t('dailyTimings') },
    ...(templeProfile.liveDarshanUrl
      ? [{ to: '/darshan', icon: '📺', label: t('liveDarshan') }]
      : []),
    { to: '/contact', icon: '📞', label: t('contactTemple') },
  ];

  return (
    <div className="pb-24">
      {/* ---- header ---- */}
      <div className="flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-700 text-xl text-white">
            🛕
          </div>
          <span className="text-sm font-bold text-stone-800">{loc(templeProfile.name)}</span>
        </div>
        <LangToggle />
      </div>

      {/* ---- hero ---- */}
      <div className="relative mt-3 h-52 overflow-hidden">
        {templeProfile.coverUrl ? (
          <img src={templeProfile.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-700 via-maroon-700 to-maroon-800">
            <span className="text-7xl" aria-hidden>🛕</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h1 className="text-2xl font-extrabold text-white">{loc(templeProfile.name)}</h1>
          <p className="text-sm font-medium text-amber-100">{loc(templeProfile.tagline)}</p>
        </div>
      </div>

      {/* ---- day-of seva popup ---- */}
      {popupOpen && todaysBooking && (
        <div className="px-4 pt-4">
          <div className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-4 shadow-sm">
            <p className="text-base font-bold text-stone-900">
              🔔 {loc(todaysBooking.sevaName)} {t('todayAt')} {todaysBooking.time}
            </p>
            <p className="mt-1 text-sm text-stone-600">
              {t('arriveEarly')} {t('bookingId')}: {todaysBooking.bookingCode}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/bookings')}
                className="min-h-[48px] flex-1 rounded-xl bg-amber-700 px-4 text-base font-bold text-white"
              >
                {t('viewDetails')}
              </button>
              <button
                type="button"
                onClick={() => setPopupOpen(false)}
                aria-label={t('close')}
                className="min-h-[48px] rounded-xl border border-stone-300 px-4 text-base font-bold text-stone-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5 px-4 pt-4">
        {/* ---- countdown ---- */}
        {nextEvent && (
          <div className="rounded-2xl bg-maroon-800 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-200">
              {t('countdownTo')} · {loc(nextEvent.name)}
            </p>
            <div className="mt-2">
              <Countdown date={nextEvent.date} />
            </div>
            <p className="mt-2 text-sm text-amber-100/90">
              {nextEvent.date} · {nextEvent.time}
            </p>
          </div>
        )}

        {/* ---- today's special ---- */}
        {dailyInfo.special && (
          <div className="rounded-2xl bg-temple-100 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-temple-700">
              ✨ {t('todaysSpecial')}
            </p>
            <p className="mt-1 text-base font-medium text-stone-800">{loc(dailyInfo.special)}</p>
          </div>
        )}

        {/* ---- quick tiles ---- */}
        <div className="grid grid-cols-3 gap-3">
          {tiles.map((tile) => (
            <Link
              key={tile.to}
              to={tile.to}
              className="flex min-h-[96px] flex-col items-center justify-center gap-1 rounded-2xl bg-white p-3 text-center shadow-sm"
            >
              <span className="text-3xl" aria-hidden>{tile.icon}</span>
              <span className="text-sm font-bold leading-tight text-stone-800">{tile.label}</span>
            </Link>
          ))}
        </div>

        {/* ---- next seva card ---- */}
        {nextBooking && nextBooking.date !== today && (
          <Link to="/bookings" className="block rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
              {t('yourNextSeva')}
            </p>
            <p className="mt-1 text-base font-bold text-stone-900">{loc(nextBooking.sevaName)}</p>
            <p className="text-sm text-stone-600">
              {nextBooking.date} · {nextBooking.time} · {t('bookingId')}: {nextBooking.bookingCode}
            </p>
          </Link>
        )}

        {/* ---- announcements ticker ---- */}
        {announcements.length > 0 && (
          <div>
            <h2 className="mb-2 text-base font-bold text-stone-800">📢 {t('announcements')}</h2>
            <div className="space-y-2">
              {announcements.map((a) => (
                <div key={a.id} className="rounded-2xl bg-white p-3 text-sm text-stone-700 shadow-sm">
                  {loc(a.text)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- gallery preview ---- */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-800">📸 {t('gallery')}</h2>
            <Link to="/gallery" className="text-sm font-bold text-amber-700">{t('viewAll')}</Link>
          </div>
          {templeProfile.galleryUrls.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto">
              {templeProfile.galleryUrls.slice(0, 6).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="h-24 w-24 shrink-0 rounded-xl object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-white p-4 text-center text-sm text-stone-400 shadow-sm">
              🛕 {loc(templeProfile.name)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
