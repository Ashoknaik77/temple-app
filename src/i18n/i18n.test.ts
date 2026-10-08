/** Unit tests for i18n: English completeness, Kannada fallback. */
import { describe, it, expect } from 'vitest';
import { en } from './en';
import { kn } from './kn';
import { translate } from './index';

describe('translate', () => {
  it('returns English strings for en', () => {
    expect(translate('en', 'bookSeva')).toBe('Book a Seva');
    expect(translate('en', 'home')).toBe('Home');
  });

  it('returns Kannada strings for kn when present', () => {
    expect(translate('kn', 'bookSeva')).toBe('ಸೇವೆ ಬುಕ್ ಮಾಡಿ');
    expect(translate('kn', 'home')).toBe('ಮುಖಪುಟ');
  });

  it('falls back to English for missing Kannada keys', () => {
    const missing = (Object.keys(en) as (keyof typeof en)[]).filter((k) => !kn[k]);
    for (const k of missing) {
      expect(translate('kn', k)).toBe(en[k]);
    }
  });

  it('every English key has a non-empty string', () => {
    for (const k of Object.keys(en) as (keyof typeof en)[]) {
      expect(typeof en[k]).toBe('string');
      expect(en[k].length).toBeGreaterThan(0);
    }
  });

  it('Kannada translations are non-empty where present', () => {
    for (const [k, v] of Object.entries(kn)) {
      expect(typeof v).toBe('string');
      expect((v as string).length).toBeGreaterThan(0, `empty kn translation for ${k}`);
    }
  });
});
