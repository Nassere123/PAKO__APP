// Configuration pour différents environnements
const getBaseURL = () => {
  // 1. Vérifier si une URL API personnalisée est définie (priorité haute)
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log('🔗 Configuration API depuis variable d\'environnement:', process.env.EXPO_PUBLIC_API_URL);
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Détection automatique de l'environnement
  if (__DEV__) {
    // 🔧 CONFIGURATION POUR RÉSOUDRE NETWORK ERROR
    // React Native/Expo ne peut pas toujours accéder à localhost
    // Solutions par ordre de priorité:
    
    // Option 1: IP locale (recommandé pour Expo Go)
    // ⚠️ IMPORTANT: Remplacez cette IP par l'IP de votre PC sur le réseau local
    // Pour trouver votre IP: ouvrez cmd et tapez "ipconfig"
    // Cherchez "IPv4 Address" sous votre connexion WiFi ou Ethernet
    const localIP = '192.168.1.10'; // ⚠️ REMPLACEZ PAR VOTRE IP LOCALE
    
    // Option 2: localhost (iOS Simulator uniquement)  
    // const apiURL = 'http://localhost:3000';
    
    // Option 3: Android Emulator
    // const apiURL = 'http://10.0.2.2:3000';  
    
    const apiURL = `http://${localIP}:3000`;
    console.log('🔗 Configuration API DEV:', apiURL);
    console.log('🔧 Si erreur réseau, vérifiez votre IP locale avec ipconfig');
    
    return apiURL;
  }
  
  // 3. Production - Remplacez par votre URL de backend déployé
  // Exemples:
  // - Heroku: 'https://votre-app.herokuapp.com'
  // - Railway: 'https://votre-app.railway.app'
  // - AWS: 'https://api.pako.com'
  // - ngrok (pour test local): 'https://votre-url.ngrok.io'
  const productionURL = 'https://dispiteously-acerbic-nella.ngrok-free.dev'; // URL ngrok pour tester
  
  console.log('🔗 Configuration API Production:', productionURL);
  return productionURL;
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 30000, // Augmenté à 30 secondes pour éviter les timeouts prématurés
  ENDPOINTS: {
    AUTH: {
      SEND_OTP: '/auth/send-otp',
      VERIFY_OTP: '/auth/verify-otp',
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
    },
    USER: {
      PROFILE: '/users/profile',
      UPDATE: '/users/update',
      DELETE: '/users/delete',
    },
    ORDERS: {
      LIST: '/orders',
      CREATE: '/orders',
      UPDATE: '/orders',
      DELETE: '/orders',
    },
  },
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Clé API Google Maps pour le suivi d'itinéraire
export const GOOGLE_MAPS_API_KEY = 'AIzaSyC-bVoeZI6vktP-Jd0YwQVEOFRlAeTdTp0';
