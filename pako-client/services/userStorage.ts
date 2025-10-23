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
        return JSON.parse(userString);
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
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

  // Créer un utilisateur après inscription
  static async createUser(userData: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  }): Promise<User> {
    const newUser: User = {
      id: Date.now().toString(), // ID simple basé sur le timestamp
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      email: userData.email,
      address: 'Adresse non définie',
      isConnected: true,
      loginDate: new Date().toISOString(),
    };

    await this.saveUser(newUser);
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
}
