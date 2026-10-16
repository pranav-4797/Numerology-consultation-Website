'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, type Lang } from '@/i18n/translations';
import { setCookie, getCookie, COOKIE_LANG_KEY } from '@/utils/cookies';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => translations.en[key] ?? key,
});

const STORAGE_KEY = 'divya-urja-lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    try {
      // 1. Try reading from persistent cookie first
      const cookieLang = getCookie(COOKIE_LANG_KEY);
      if (cookieLang === 'en' || cookieLang === 'hi' || cookieLang === 'mr') {
        setTimeout(() => setLangState(cookieLang), 0);
        return;
      }

      // 2. Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'hi' || stored === 'mr') {
        setTimeout(() => {
          setLangState(stored);
          setCookie(COOKIE_LANG_KEY, stored, 365);
        }, 0);
      }
    } catch {
      // Storage unavailable — stay on English
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      setCookie(COOKIE_LANG_KEY, next, 365);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string) => translations[lang][key] ?? translations.en[key] ?? key,
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
