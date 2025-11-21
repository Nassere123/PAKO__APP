// Configuration de l'API
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
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

