import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LANGUAGES_AVAILABLE, translate } from '../i18n';
import { getLanguage, saveLanguage } from '../services/preferences';

const LanguageContext = createContext({ language: 'es', setLanguage: () => {}, t: (key) => key });

// Idioma de toda la interfaz: se restaura de AsyncStorage y cambia al instante al elegirlo en el registro o el perfil
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('es');

  useEffect(() => {
    let active = true;
    getLanguage().then((stored) => {
      if (active && LANGUAGES_AVAILABLE.includes(stored)) setLanguageState(stored);
    });
    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback((next) => {
    if (!LANGUAGES_AVAILABLE.includes(next)) return;
    setLanguageState(next);
    saveLanguage(next);
  }, []);

  const t = useCallback((key, params) => translate(language, key, params), [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
