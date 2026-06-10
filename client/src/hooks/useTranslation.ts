import { useState, useEffect } from 'react';
import { t, getLocale, onLocaleChange, type Locale, setLocale } from '../i18n/config';

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>(getLocale());

  useEffect(() => {
    return onLocaleChange(setLocaleState);
  }, []);

  return {
    t,
    locale,
    setLocale,
    isRtl: locale === 'ar',
  };
}
