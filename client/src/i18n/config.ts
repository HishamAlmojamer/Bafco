import ar from './ar.json';
import en from './en.json';

export type Locale = 'ar' | 'en';
export type TranslationKey = keyof typeof en;

const translations: Record<Locale, Record<string, string>> = { ar, en };

let currentLocale: Locale = 'en';

const listeners: Array<(locale: Locale) => void> = [];

export function setLocale(locale: Locale) {
  currentLocale = locale;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  listeners.forEach((fn) => fn(locale));
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string, params?: Record<string, string | number>): string {
  const locale = translations[currentLocale];
  let value = locale[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, String(v));
    });
  }
  return value;
}

export function onLocaleChange(fn: (locale: Locale) => void) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function getDir(): 'ltr' | 'rtl' {
  return currentLocale === 'ar' ? 'rtl' : 'ltr';
}

// Detect initial locale
const stored = localStorage.getItem('locale') as Locale | null;
if (stored && (stored === 'ar' || stored === 'en')) {
  setLocale(stored);
} else {
  const browserLang = navigator.language.startsWith('ar') ? 'ar' : 'en';
  setLocale(browserLang);
}
