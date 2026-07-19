import { useLanguageStore } from '../store/useLanguageStore';
import { translations } from '../lib/translations';

export default function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const t = (key, params = {}) => {
    const dict = translations[language] || translations.id;
    let translation = dict[key] || translations.id[key] || key;

    // Replace dynamic parameters, e.g. {name}
    Object.keys(params).forEach((param) => {
      translation = translation.replace(`{${param}}`, params[param]);
    });

    return translation;
  };

  return { t, language, toggleLanguage, setLanguage };
}
