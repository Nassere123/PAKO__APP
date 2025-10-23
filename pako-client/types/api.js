// Types pour les réponses API
export const ApiResponseTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
};

// Structure d'une réponse API
export const ApiResponseStructure = {
  data: 'any',
  message: 'string',
  status: 'string',
  timestamp: 'date',
};

// Types d'erreurs API
export const ApiErrorTypes = {
  NETWORK_ERROR: 'network_error',
  VALIDATION_ERROR: 'validation_error',
  AUTH_ERROR: 'auth_error',
  SERVER_ERROR: 'server_error',
};
