export const API_CONFIG = {
  BASE_URL: 'https://api.pako.com',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
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
