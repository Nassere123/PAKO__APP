import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../constants';
import { Storage } from './storage';

// Debug: Afficher la configuration au démarrage
console.log('🔧 Configuration API chargée:');
console.log('   Base URL:', API_CONFIG.BASE_URL);
console.log('   Timeout:', API_CONFIG.TIMEOUT, 'ms');

const API_BASE_URL = API_CONFIG.BASE_URL;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Récupérer le token depuis AsyncStorage
      const token = await Storage.getItem<string>('authToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Erreur lors de la récupération du token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide, nettoyer le stockage
      await Storage.removeItem('authToken');
      await Storage.removeItem('userData');
      await Storage.removeItem('@pako_user');
      await Storage.removeItem('@pako_is_connected');
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  get: <T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.get<T>(url, config),
  
  post: <T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.post<T>(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.put<T>(url, data, config),
  
  delete: <T = any>(url: string, config?: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.delete<T>(url, config),
};

export default api;
