// Configuration de l'API pour PAKO PRO
import { Platform } from 'react-native';

// ⚙️ CONFIGURATION MANUELLE - Pour Expo Go ou appareil physique
// Si vous utilisez Expo Go sur un appareil physique, utilisez l'IP locale de votre machine
// Trouvez votre IP avec: ipconfig (Windows) ou ifconfig (Mac/Linux)
const MANUAL_IP = '192.168.1.10'; // IP locale de votre machine

// Détection automatique de l'URL de base selon la plateforme
const getBaseURL = (): string => {
  if (!__DEV__) {
    // Production - Remplacez par votre URL de production
    return 'https://votre-api-production.com';
  }

  // Si une IP manuelle est définie, l'utiliser (priorité pour Expo Go ou appareil physique)
  if (MANUAL_IP) {
    console.log(`📱 Utilisation de l'IP manuelle: ${MANUAL_IP}`);
    return `http://${MANUAL_IP}:3000`;
  }

  // Développement - Détection automatique de la plateforme (si MANUAL_IP n'est pas défini)
  if (Platform.OS === 'android') {
    // Pour Android Emulator, utilisez 10.0.2.2 qui pointe vers localhost de la machine hôte
    return 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    // Pour iOS Simulator, localhost fonctionne
    return 'http://localhost:3000';
  } else {
    // Web ou autres plateformes
    return 'http://localhost:3000';
  }
};

export const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: 30000, // 30 secondes
};

// Types pour les réponses API
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Types pour les erreurs API
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}
