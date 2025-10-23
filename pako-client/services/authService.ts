import { apiService } from '../lib/api';
import { Storage } from '../lib/storage';
import { AuthCredentials, RegisterData, User, ApiResponse } from '../types';
import { getWorkingBaseURL } from '../utils/networkTest';

interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

interface OtpResult {
  success: boolean;
  message?: string;
  expiresIn?: number;
  error?: string;
}

export const AuthService = {
  // Envoyer un code OTP
  async sendOtp(phone: string, firstName?: string, lastName?: string): Promise<OtpResult> {
    try {
      const requestData: any = { phone };
      
      // Debug: Afficher les données avant envoi
      console.log('=== FRONTEND DEBUG SEND OTP ===');
      console.log('Phone:', phone);
      console.log('FirstName:', firstName);
      console.log('LastName:', lastName);
      console.log('================================');
      
      // Ajouter firstName et lastName si fournis
      if (firstName && firstName.trim() !== '') {
        requestData.firstName = firstName.trim();
      }
      if (lastName && lastName.trim() !== '') {
        requestData.lastName = lastName.trim();
      }

      console.log('Request data:', requestData);
      const response = await apiService.post('/auth/send-otp', requestData);
      
      return { 
        success: true, 
        message: response.data.message,
        expiresIn: response.data.expiresIn
      };
    } catch (error: any) {
      console.log('Erreur sendOtp détaillée:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      return { 
        success: false, 
        error: error.response?.data?.message || `Erreur lors de l'envoi du code OTP: ${error.message}` 
      };
    }
  },

  // Vérifier un code OTP
  async verifyOtp(phone: string, code: string): Promise<AuthResult> {
    try {
      const response = await apiService.post('/auth/verify-otp', {
        phone,
        code,
      });
      
      return { 
        success: true, 
        user: response.data.user
      };
    } catch (error: any) {
      console.log('Erreur verifyOtp:', error);
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Code OTP invalide' 
      };
    }
  },

  // Connexion avec OTP
  async login(phone: string, otpCode: string): Promise<AuthResult> {
    try {
      const response = await apiService.post('/auth/login', {
        phone,
        otpCode,
      });
      
      const { access_token, user } = response.data;
      
      // Sauvegarder le token et les données utilisateur
      await Storage.setItem('authToken', access_token);
      await Storage.setItem('userData', user);
      
      return { success: true, user, token: access_token };
    } catch (error: any) {
      console.log('Erreur login:', error);
      
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
      const response = await apiService.post('/auth/register', userData);
      return { success: true, user: response.data.user };
    } catch (error: any) {
      console.log('Erreur register:', error);
      
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

  // Récupérer les informations utilisateur depuis la base de données
  async getUserFromDatabase(userId: string): Promise<AuthResult> {
    try {
      const response = await apiService.post('/auth/user-by-id', { userId });
      return { 
        success: true, 
        user: response.data.user 
      };
    } catch (error: any) {
      console.log('Erreur getUserFromDatabase:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération des données utilisateur' 
      };
    }
  },

  // Récupérer les informations utilisateur par numéro de téléphone
  async getUserByPhone(phone: string): Promise<AuthResult> {
    try {
      const response = await apiService.post('/auth/user-info', { phone });
      return { 
        success: true, 
        user: response.data.user 
      };
    } catch (error: any) {
      console.log('Erreur getUserByPhone:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération des données utilisateur' 
      };
    }
  },
};
