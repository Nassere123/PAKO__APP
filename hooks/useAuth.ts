import { useState, useEffect } from 'react';
import { UserStorageService, User } from '../services';

interface UseAuthReturn {
  user: User | null;
  isConnected: boolean;
  isLoading: boolean;
  login: (userData: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
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

      setIsConnected(connected);
      setUser(connected ? userData : null);
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      setIsConnected(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  }): Promise<void> => {
    try {
      const newUser = await UserStorageService.createUser(userData);
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

  const updateUser = async (updates: Partial<User>): Promise<void> => {
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