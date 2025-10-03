import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../constants';

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
  (config: InternalAxiosRequestConfig) => {
    // Ajouter le token d'auth si disponible
    const token = 'your-auth-token'; // Récupérer depuis AsyncStorage
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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
