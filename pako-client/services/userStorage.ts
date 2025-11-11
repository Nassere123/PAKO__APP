import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
  isConnected: boolean;
  loginDate: string;
}

const USER_KEY = '@pako_user';
const IS_CONNECTED_KEY = '@pako_is_connected';

export class UserStorageService {
  // Sauvegarder les informations utilisateur
  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(IS_CONNECTED_KEY, 'true');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
      throw error;
    }
  }

  // Récupérer les informations utilisateur
  static async getUser(): Promise<User | null> {
    try {
      const userString = await AsyncStorage.getItem(USER_KEY);
      if (userString) {
        const user = JSON.parse(userString);
        
        // Vérifier si l'ID est un UUID valide
        if (user.id && !this.isValidUUID(user.id)) {
          console.log('⚠️ ID utilisateur invalide détecté (timestamp):', user.id);
          console.log('🧹 Nettoyage des données obsolètes...');
          // Nettoyer les données obsolètes avec ID timestamp
          await this.logout();
          return null;
        }
        
        return user;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  // Valider si une chaîne est un UUID valide
  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Vérifier si l'utilisateur est connecté
  static async isUserConnected(): Promise<boolean> {
    try {
      const isConnected = await AsyncStorage.getItem(IS_CONNECTED_KEY);
      return isConnected === 'true';
    } catch (error) {
      console.error('Erreur lors de la vérification de la connexion:', error);
      return false;
    }
  }

  // Déconnecter l'utilisateur
  static async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.removeItem(IS_CONNECTED_KEY);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }

  // Mettre à jour les informations utilisateur
  static async updateUser(updates: Partial<User>): Promise<void> {
    try {
      const currentUser = await this.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        await this.saveUser(updatedUser);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }

  // Créer un utilisateur UNIQUEMENT avec l'UUID de la base de données PostgreSQL
  static async createUser(userData: {
    id: string; // UUID PostgreSQL OBLIGATOIRE du backend
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  }): Promise<User> {
    // VALIDATION STRICTE : L'ID DOIT être un UUID PostgreSQL valide
    if (!userData.id) {
      throw new Error('❌ ERREUR CRITIQUE: ID utilisateur manquant - doit venir de PostgreSQL');
    }

    // Vérifier que c'est un UUID valide (format PostgreSQL)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userData.id)) {
      throw new Error(`❌ ERREUR CRITIQUE: ID invalide "${userData.id}" - doit être un UUID PostgreSQL`);
    }

    console.log('🔑 Création utilisateur avec UUID PostgreSQL valide:', userData.id);
    console.log('👤 Utilisateur:', userData.firstName, userData.lastName);

    const newUser: User = {
      id: userData.id, // UUID PostgreSQL UNIQUEMENT
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      email: userData.email,
      address: 'Adresse non définie',
      isConnected: true,
      loginDate: new Date().toISOString(),
    };

    await this.saveUser(newUser);
    console.log('✅ Utilisateur sauvegardé avec UUID PostgreSQL:', userData.id);
    return newUser;
  }

  // Obtenir le nom complet de l'utilisateur
  static async getUserFullName(): Promise<string> {
    try {
      const user = await this.getUser();
      if (user) {
        return `${user.firstName} ${user.lastName}`;
      }
      return 'Utilisateur';
    } catch (error) {
      console.error('Erreur lors de la récupération du nom:', error);
      return 'Utilisateur';
    }
  }

  // Obtenir les statistiques de l'utilisateur (pour l'écran profil)
  static async getUserStats(): Promise<{
    courses: number;
    annulees: number;
    enCours: number;
    validees: number;
  }> {
    // Pour l'instant, retourner des données simulées
    // Plus tard, vous pourrez stocker ces données dans AsyncStorage ou une base de données
    return {
      courses: 0,
      annulees: 0,
      enCours: 0,
      validees: 0,
    };
  }

  // Nettoyer toutes les données utilisateur obsolètes (avec ID timestamp)
  static async cleanObsoleteData(): Promise<void> {
    try {
      console.log('🧹 Nettoyage forcé des données obsolètes...');
      
      // Supprimer toutes les données utilisateur
      await AsyncStorage.removeItem(USER_KEY);
      await AsyncStorage.removeItem(IS_CONNECTED_KEY);
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('@pako_user');
      await AsyncStorage.removeItem('@pako_is_connected');
      
      console.log('✅ Données obsolètes supprimées');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      throw error;
    }
  }

  // Fonction utilitaire pour forcer une reconnexion propre
  static async forceCleanReconnection(): Promise<boolean> {
    try {
      await this.cleanObsoleteData();
      console.log('🔄 Reconnexion propre requise - données nettoyées');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage pour reconnexion:', error);
      return false;
    }
  }
}
