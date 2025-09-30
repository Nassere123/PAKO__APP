import { apiService } from '../lib/api';
import { Storage } from '../lib/storage';
import { AuthCredentials, RegisterData, User, ApiResponse } from '../types';

interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export const AuthService = {
  async login(phone: string, password: string): Promise<AuthResult> {
    try {
      const response = await apiService.post<ApiResponse<{ user: User; token: string }>>('/auth/login', {
        phone,
        password,
      });
      
      const { token, user } = response.data.data;
      
      // Sauvegarder le token et les données utilisateur
      await Storage.setItem('authToken', token);
      await Storage.setItem('userData', user);
      
      return { success: true, user, token };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur de connexion' 
      };
    }
  },

  async logout(): Promise<AuthResult> {
    try {
      await Storage.removeItem('authToken');
      await Storage.removeItem('userData');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la déconnexion' };
    }
  },

  async register(userData: RegisterData): Promise<AuthResult> {
    try {
      const response = await apiService.post<ApiResponse<{ user: User }>>('/auth/register', userData);
      return { success: true, user: response.data.data.user };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de l\'inscription' 
      };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await Storage.getItem<string>('authToken');
      if (!token) return null;

      const response = await apiService.get<ApiResponse<{ user: User }>>('/auth/me');
      return response.data.data.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
};
