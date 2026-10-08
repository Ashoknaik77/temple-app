/** Language context: English + Kannada with toggle, persisted. English fallback. */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { en, type EnKeys } from './en';
import { kn } from './kn';

export type Lang = 'en' | 'kn';
const STORE_KEY = 'temple-lang';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Translate a key (Kannada falls back to English). */
  t: (key: EnKeys) => string;
}

const Ctx = createContext<LangCtx>({ lang: 'en', setLang: () => {}, t: (k) => en[k] });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem(STORE_KEY) as Lang) === 'kn' ? 'kn' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'kn' ? 'kn' : 'en';
  }, [lang]);

  const t = useCallback(
    (key: EnKeys): string => {
      if (lang === 'kn') {
        const v = kn[key];
        if (v) return v;
      }
      return en[key];
    },
    [lang],
  );

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  return useContext(Ctx);
}
