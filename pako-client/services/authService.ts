import { apiService } from '../lib/api';
import api from '../lib/api';
import { Storage } from '../lib/storage';
import { API_CONFIG } from '../constants/api';
import { AuthCredentials, RegisterData, User, ApiResponse } from '../types';

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
      console.log('\n🚀 ===== ENVOI OTP DÉMARRÉ =====');
      console.log('📞 Phone:', phone);
      console.log('👤 FirstName:', firstName);
      console.log('👤 LastName:', lastName);
      console.log('🔗 URL cible:', `${api.defaults?.baseURL || 'undefined'}/auth/send-otp`);
      console.log('⏱️  Timeout configuré:', api.defaults?.timeout || 'undefined', 'ms');
      
      // Ajouter firstName et lastName si fournis
      if (firstName && firstName.trim() !== '') {
        requestData.firstName = firstName.trim();
      }
      if (lastName && lastName.trim() !== '') {
        requestData.lastName = lastName.trim();
      }

      console.log('📦 Payload final:', requestData);
      console.log('📡 Envoi de la requête...');
      
      const startTime = Date.now();
      const response = await apiService.post('/auth/send-otp', requestData);
      const endTime = Date.now();
      
      console.log(`✅ Réponse reçue en ${endTime - startTime}ms`);
      console.log('📊 Status:', response.status);
      console.log('📊 Headers:', response.headers);
      
      console.log('✅ SEND OTP RÉUSSI');
      console.log('===============================\n');
      
      return { 
        success: true, 
        message: response.data.message,
        expiresIn: response.data.expiresIn
      };
    } catch (error: any) {
      console.log('\n❌ ===== ERREUR SEND OTP =====');
      console.log('🔍 Type d\'erreur:', error.name);
      console.log('📝 Message:', error.message);
      console.log('🔢 Code:', error.code);
      console.log('🌐 URL tentée:', error.config?.url);
      console.log('⏱️  Timeout:', error.config?.timeout);
      console.log('📊 Status HTTP:', error.response?.status);
      console.log('📋 Headers response:', error.response?.headers);
      console.log('📦 Data response:', error.response?.data);
      
      // Diagnostic spécifique selon le type d'erreur
      const baseURL = error.config?.baseURL || API_CONFIG.BASE_URL;
      if (error.message.includes('Network Error') || error.message.includes('Network request failed')) {
        console.log('\n🚨 ERREUR RÉSEAU DÉTECTÉE:');
        console.log('💡 Vérifications suggérées:');
        console.log('1. Backend démarré ? (cd "BACK END" && npm run start:dev)');
        console.log('2. URL correcte ?', baseURL);
        console.log('3. Téléphone/émulateur sur le même réseau Wi-Fi ?');
        console.log('4. Pare-feu/antivirus bloque ?');
        console.log('5. IP correspond à votre machine ? (ipconfig / ifconfig)');
        console.log('\n🔧 Pour tester:');
        console.log(`   curl ${baseURL}/`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log('\n🚨 CONNEXION REFUSÉE:');
        console.log('💡 Le serveur refuse la connexion');
        console.log('   URL:', baseURL);
        console.log('   Vérifiez que le backend écoute sur le bon port (3000)');
        console.log('   Vérifiez que le backend est démarré');
      } else if (error.code === 'TIMEOUT' || error.message.includes('timeout')) {
        console.log('\n🚨 TIMEOUT:');
        console.log('💡 La requête a pris trop de temps');
        console.log('   URL:', baseURL);
        console.log('   Timeout configuré:', error.config?.timeout || API_CONFIG.TIMEOUT, 'ms');
        console.log('   Vérifiez votre connexion réseau');
      }
      
      console.log('=============================\n');
      
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

  async logout(userId?: string): Promise<AuthResult> {
    try {
      console.log('\n🚪 ===== DÉBUT DÉCONNEXION FRONTEND =====');
      console.log(`🆔 UserID reçu: ${userId || 'non fourni'}`);
      
      // ÉTAPE 1: Validation de l'UUID
      if (userId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
          console.log('❌ UUID invalide détecté:', userId);
          console.log('⚠️ Déconnexion locale uniquement (pas de notification backend)');
        } else {
          console.log('✅ UUID valide:', userId);
          
          // ÉTAPE 2: Notification du backend
          try {
            console.log('📡 Envoi requête POST /auth/logout au backend...');
            console.log('🔗 URL:', 'http://localhost:3000/auth/logout');
            console.log('📦 Payload:', { userId });
            
            const response = await apiService.post('/auth/logout', { userId });
            
            console.log('✅ Réponse backend reçue:');
            console.log('   Status:', response.status);
            console.log('   Message:', response.data.message);
            console.log('📊 Backend devrait afficher les statistiques maintenant');
            
          } catch (backendError: any) {
            console.log('❌ Erreur communication backend:');
            console.log('   URL tentée:', backendError.config?.url);
            console.log('   Method:', backendError.config?.method);
            console.log('   Status:', backendError.response?.status);
            console.log('   Message:', backendError.response?.data?.message);
            console.log('   Erreur réseau:', backendError.message);
            console.log('⚠️ Poursuite de la déconnexion locale...');
          }
        }
      } else {
        console.log('⚠️ Pas d\'UserID - déconnexion locale uniquement');
      }
      
      // ÉTAPE 3: Nettoyage local obligatoire
      console.log('\n🧹 Nettoyage des données locales...');
      await Storage.removeItem('authToken');
      await Storage.removeItem('userData');
      await Storage.removeItem('@pako_user');
      await Storage.removeItem('@pako_is_connected');
      
      // Nettoyer aussi le stockage des colis si nécessaire
      if (userId) {
        const userOrdersKey = `@pako_orders_${userId}`;
        await Storage.removeItem(userOrdersKey);
        console.log('🗑️ Commandes utilisateur supprimées');
      }
      
      console.log('✅ Données locales nettoyées');
      
      console.log('✅ DÉCONNEXION FRONTEND TERMINÉE');
      console.log('=======================================\n');
      
      return { success: true };
    } catch (error) {
      console.error('❌ ERREUR CRITIQUE lors de la déconnexion:', error);
      return { success: false, error: 'Erreur lors de la déconnexion' };
    }
  },

  // Sauvegarder le token d'authentification
  async saveToken(token: string): Promise<void> {
    try {
      await Storage.setItem('authToken', token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
      throw error;
    }
  },

  // Récupérer le token d'authentification
  async getToken(): Promise<string | null> {
    try {
      return await Storage.getItem<string>('authToken');
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  },

  // Vérifier si l'utilisateur a un token valide
  async hasValidToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      return token !== null && token.length > 0;
    } catch (error) {
      return false;
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
