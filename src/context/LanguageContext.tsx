import React, { createContext, useContext, useState, useEffect } from 'react';
import { en, TranslationKey } from '../locales/en.ts';
import { hi } from '../locales/hi.ts';
import { pa } from '../locales/pa.ts';
import { bn } from '../locales/bn.ts';
import { mr } from '../locales/mr.ts';
import { ta } from '../locales/ta.ts';
import { te } from '../locales/te.ts';
import { gu } from '../locales/gu.ts';
import { Language } from '../types/index.ts';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];

const DICTIONARIES: Record<Language, Partial<Record<TranslationKey, string>>> = {
  en,
  hi,
  pa,
  bn,
  mr,
  ta,
  te,
  gu,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  hasSelectedLanguage: boolean;
  confirmLanguageSelection: (lang: Language) => void;
  resetLanguageSelection: () => void;
  t: (key: TranslationKey) => string;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('jobbond_lang'));
    } catch {
      return false;
    }
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('jobbond_lang');
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved as Language;
      }
    } catch {}
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('jobbond_lang', lang);
      setHasSelectedLanguage(true);
    } catch {}
  };

  const confirmLanguageSelection = (lang: Language) => {
    setLanguage(lang);
  };

  const resetLanguageSelection = () => {
    try {
      localStorage.removeItem('jobbond_lang');
    } catch {}
    setHasSelectedLanguage(false);
  };

  const t = (key: TranslationKey): string => {
    const dict = DICTIONARIES[language] || en;
    return dict[key] || en[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        hasSelectedLanguage,
        confirmLanguageSelection,
        resetLanguageSelection,
        t,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
