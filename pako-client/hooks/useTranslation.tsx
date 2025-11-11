import { useState } from 'react';
import i18n from '../i18n';

/**
 * Hook pour utiliser les traductions dans les composants React
 * Force le re-render quand la langue change
 */
export const useTranslation = () => {
  const [key, setKey] = useState(0);

  return {
    t: i18n.t,
    i18n: {
      language: i18n.getCurrentLanguage(),
      changeLanguage: async (language: string) => {
        await i18n.changeLanguage(language);
        setKey(k => k + 1); // Force re-render
      },
    },
  };
};
