// Configuration pour différents environnements
const getBaseURL = () => {
  // Détection automatique de l'environnement
  if (__DEV__) {
    // Pour Expo Go, utiliser l'IP locale de votre machine
    // Remplacez 192.168.1.100 par l'IP de votre machine sur le réseau local
    return 'http://192.168.1.17:3000'; // IP locale pour Expo Go
    // Alternative: 'http://10.0.2.2:3000' pour émulateur Android natif
  }
  return 'https://api.pako.com'; // Production
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 10000,
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
