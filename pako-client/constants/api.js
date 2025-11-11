// Configuration pour différents environnements
const getBaseURL = () => {
  // Détection automatique de l'environnement
  if (__DEV__) {
    // 🔧 CONFIGURATION POUR RÉSOUDRE NETWORK ERROR
    // React Native/Expo ne peut pas toujours accéder à localhost
    // Solutions par ordre de priorité:
    
    // Option 1: IP locale (recommandé pour Expo Go)
    const localIP = '192.168.1.28'; // IP de la carte réseau sans fil
    
    // Option 2: localhost (iOS Simulator uniquement)  
    // const apiURL = 'http://localhost:3000';
    
    // Option 3: Android Emulator
    // const apiURL = 'http://10.0.2.2:3000';  
    
    const apiURL = `http://${localIP}:3000`;
    console.log('🔗 Configuration API DEV:', apiURL);
    console.log('🔧 Si erreur réseau, vérifiez votre IP locale avec ipconfig');
    
    return apiURL;
  }
  return 'https://api.pako.com'; // Production
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
