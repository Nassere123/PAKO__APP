import { useState, useEffect } from 'react';
import { UserStorageService, AuthService } from '../services';
import { User as ApiUser } from '../types/common';
import { User as LocalUser } from '../services/userStorage';

interface UseAuthReturn {
  user: LocalUser | null;
  isConnected: boolean;
  isLoading: boolean;
  login: (userData: {
    id?: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<LocalUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Charger les informations utilisateur au démarrage
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const [connected, userData] = await Promise.all([
        UserStorageService.isUserConnected(),
        UserStorageService.getUser(),
      ]);

      if (connected && userData) {
        // Essayer de récupérer les données fraîches depuis la base de données
        try {
          const dbUserResult = await AuthService.getUserFromDatabase(userData.id);
          if (dbUserResult.success && dbUserResult.user) {
            // Convertir les données de l'API vers le format local
            const localUser: LocalUser = {
              id: dbUserResult.user.id,
              firstName: dbUserResult.user.firstName,
              lastName: dbUserResult.user.lastName,
              phone: dbUserResult.user.phone,
              email: dbUserResult.user.email,
              address: typeof dbUserResult.user.address === 'string' ? dbUserResult.user.address : undefined,
              isConnected: true,
              loginDate: new Date().toISOString(),
            };
            
            // Mettre à jour les données locales avec celles de la base de données
            await UserStorageService.updateUser(localUser);
            setUser(localUser);
          } else {
            setUser(userData);
          }
        } catch (error) {
          console.log('Impossible de récupérer les données depuis la BD, utilisation des données locales:', error);
          // Continuer avec les données locales même en cas d'erreur
          setUser(userData);
        }
      } else {
        setUser(null);
      }

      setIsConnected(connected);
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      setIsConnected(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: {
    id?: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  }): Promise<void> => {
    try {
      // Créer l'utilisateur local avec les données fournies
      const localUserData: LocalUser = {
        id: userData.id || Date.now().toString(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        email: userData.email,
        isConnected: true,
        loginDate: new Date().toISOString(),
      };
      
      const newUser = await UserStorageService.createUser(localUserData);
      setUser(newUser);
      setIsConnected(true);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await UserStorageService.logout();
      setUser(null);
      setIsConnected(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<LocalUser>): Promise<void> => {
    try {
      await UserStorageService.updateUser(updates);
      if (user) {
        setUser({ ...user, ...updates });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    await loadUserData();
  };

  return {
    user,
    isConnected,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUser,
  };
};