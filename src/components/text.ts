import { useCallback } from 'react';
import { useLang } from '../i18n';
import type { Localized } from '../types';

/** Pick the localized string for the current language. */
export function useLocalText() {
  const { lang } = useLang();
  return useCallback((v: Localized) => (lang === 'kn' ? v.kn : v.en), [lang]);
}

/** YYYY-MM-DD in the device's local timezone (not UTC). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** '18:00' -> '6:00 PM' — friendlier for elderly users than 24h. */
export function fmtTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** '2026-10-08' -> '8 Oct 2026' style label in the current locale. */
export function fmtDate(iso: string, lang: 'en' | 'kn'): string {
  const [y, mo, d] = iso.split('-').map(Number);
  const dt = new Date(y, mo - 1, d);
  return dt.toLocaleDateString(lang === 'kn' ? 'kn-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
