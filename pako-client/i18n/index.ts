import AsyncStorage from '@react-native-async-storage/async-storage';
import fr from './fr';
import en from './en';
import de from './de';
import es from './es';

const LANGUAGE_KEY = '@pako_language';

// Type pour les traductions
type Translations = { [key: string]: string };

// Ressources de traduction
const resources: { [key: string]: Translations } = {
  fr: fr,
  en: en,
  de: de,
  es: es,
};

let currentLanguage = 'fr';

// Fonction pour charger la langue sauvegardée
export const loadStoredLanguage = async (): Promise<string> => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (storedLanguage && resources[storedLanguage]) {
      currentLanguage = storedLanguage;
      return storedLanguage;
    }
    return 'fr'; // Par défaut: français
  } catch (error) {
    console.log('Erreur lors du chargement de la langue:', error);
    return 'fr';
  }
};

// Fonction helper pour changer la langue et la sauvegarder
export const changeLanguage = async (language: string): Promise<void> => {
  try {
    if (resources[language]) {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
      currentLanguage = language;
      console.log('✅ Langue changée vers:', language);
    }
  } catch (error) {
    console.log('Erreur lors du changement de langue:', error);
  }
};

// Fonction pour obtenir la traduction
export const t = (key: string): string => {
  const translations = resources[currentLanguage];
  return translations[key] || key;
};

// Fonction pour obtenir la langue actuelle
export const getCurrentLanguage = (): string => {
  return currentLanguage;
};

// Créer un objet i18n compatible react-i18next
const i18n = {
  get language() { return currentLanguage; },
  set language(value: string) { currentLanguage = value; },
  changeLanguage,
  t,
  getCurrentLanguage,
};

// Charger la langue sauvegardée au démarrage
(async () => {
  const lang = await loadStoredLanguage();
  currentLanguage = lang;
})();

export default i18n;