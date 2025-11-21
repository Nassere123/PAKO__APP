import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ApiError } from './config';

// Clé pour stocker le token dans AsyncStorage
const TOKEN_KEY = '@pako_pro:auth_token';

// Classe pour gérer les appels HTTP
class HttpClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
    
    // Afficher l'URL configurée au démarrage pour le débogage
    if (__DEV__) {
      console.log('🔧 Configuration API:');
      console.log(`   Base URL: ${this.baseURL}`);
      console.log(`   Timeout: ${this.timeout}ms`);
    }
  }

  // Récupérer le token depuis AsyncStorage
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  // Sauvegarder le token
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
    }
  }

  // Supprimer le token
  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
    }
  }

  // Construire l'URL complète
  private buildURL(endpoint: string): string {
    // Enlever le slash initial s'il existe pour éviter les doubles slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseURL}/${cleanEndpoint}`;
  }

  // Gérer les erreurs
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data?.message || data?.error || `Erreur HTTP ${response.status}`,
        status: response.status,
        errors: data?.errors,
      };
      throw error;
    }

    return data;
  }

  // Méthode pour tester la connexion au serveur
  async testConnection(): Promise<{ success: boolean; message: string }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes pour le test
    
    try {
      const response = await fetch(`${this.baseURL}/api`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Si le serveur répond (même avec 404), c'est qu'il est accessible
      if (response.ok || response.status === 404) {
        return {
          success: true,
          message: `✅ Serveur accessible sur ${this.baseURL}`,
        };
      }
      
      return {
        success: false,
        message: `Serveur répond avec le statut ${response.status}`,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: `⏱️ Timeout: Le serveur ne répond pas dans les 5 secondes.\n\nVérifiez que:\n• Le serveur est DÉMARRÉ (npm run start:dev dans BACK END)\n• Le serveur écoute sur le port 3000\n• Votre appareil/émulateur peut accéder à ${this.baseURL}`,
        };
      }
      
      return {
        success: false,
        message: `❌ Impossible de se connecter à ${this.baseURL}\n\nVérifiez que:\n• Le serveur est DÉMARRÉ (npm run start:dev dans BACK END)\n• Le serveur écoute sur le port 3000\n• Votre appareil/émulateur peut accéder à cette adresse\n• Le firewall ne bloque pas la connexion`,
      };
    }
  }

  // Méthode générique pour les requêtes
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Créer un AbortController pour gérer le timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.buildURL(endpoint), {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw { message: 'La requête a expiré', status: 408 } as ApiError;
      }
      // Gestion spécifique des erreurs réseau
      if (error.message === 'Network request failed' || error.message?.includes('Network')) {
        // Ne pas logger comme erreur critique pour les appels non critiques (comme updateOnlineStatus)
        // Ces erreurs sont souvent temporaires et se résolvent automatiquement
        if (__DEV__ && !endpoint.includes('online-status')) {
          console.warn('⚠️ Erreur réseau lors de l\'appel à:', this.buildURL(endpoint));
        }
        
        // Créer un message d'erreur plus clair sans appeler testConnection() (coûteux)
        throw {
          message: `Erreur réseau: Impossible de se connecter au serveur. Vérifiez votre connexion.`,
          status: 0,
          url: this.buildURL(endpoint),
        } as ApiError;
      }
      throw error;
    }
  }

  // Méthodes HTTP
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Instance singleton
export const httpClient = new HttpClient();

