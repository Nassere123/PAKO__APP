import { useState, useEffect } from 'react';
import { UserStorageService, AuthService } from '../services';
import { User as ApiUser } from '../types/common';
import { User as LocalUser } from '../services/userStorage';

interface UseAuthReturn {
  user: LocalUser | null;
  isConnected: boolean;
  isLoading: boolean;
  login: (userData: {
    id: string; // ID OBLIGATOIRE - UUID PostgreSQL requis
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    token?: string;
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
      console.log('🔄 Chargement des données utilisateur...');

      // Vérification simple de la validité des données utilisateur
      console.log('🔍 Vérification des données utilisateur...');

      const [connected, userData, hasToken] = await Promise.all([
        UserStorageService.isUserConnected(),
        UserStorageService.getUser(),
        AuthService.hasValidToken(),
      ]);
      
      // Si userData est null à cause d'un ID invalide, les données ont déjà été nettoyées
      // Mettre à jour connected en conséquence
      const actuallyConnected = connected && userData !== null;

      console.log('📊 État de la session:', { connected: actuallyConnected, hasUserData: !!userData, hasToken });

      if (actuallyConnected && userData) {
        // Vérifier si l'utilisateur a un token valide pour une session complète
        if (hasToken) {
          console.log('🔑 Session complète détectée (utilisateur + token)');
          
          // Essayer de récupérer les données fraîches depuis la base de données
          try {
            const dbUserResult = await AuthService.getUserFromDatabase(userData.id);
            if (dbUserResult.success && dbUserResult.user) {
              console.log('📱 Données utilisateur synchronisées avec la BD');
              
              // Convertir les données de l'API vers le format local
              const localUser: LocalUser = {
                id: dbUserResult.user.id,
                firstName: dbUserResult.user.firstName,
                lastName: dbUserResult.user.lastName,
                phone: dbUserResult.user.phone,
                email: dbUserResult.user.email,
                address: typeof dbUserResult.user.address === 'string' ? dbUserResult.user.address : undefined,
                isConnected: true,
                loginDate: userData.loginDate || new Date().toISOString(),
              };
              
              // Mettre à jour les données locales avec celles de la base de données
              await UserStorageService.updateUser(localUser);
              setUser(localUser);
            } else {
              console.log('📱 Utilisation des données locales');
              setUser(userData);
            }
          } catch (error) {
            console.log('⚠️  Impossible de synchroniser avec la BD, utilisation des données locales:', error);
            // Continuer avec les données locales même en cas d'erreur réseau
            setUser(userData);
          }
        } else {
          console.log('🔑 Session incomplète (pas de token), maintien de la session utilisateur');
          // Même sans token, on maintient l'utilisateur connecté pour une expérience fluide
          // Le token sera récupéré lors de la prochaine action qui en a besoin
          setUser(userData);
        }
        setIsConnected(true);
        console.log(`✅ Session restaurée pour: ${userData.firstName} ${userData.lastName}`);
      } else {
        console.log('❌ Aucune session utilisateur trouvée');
        setUser(null);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données utilisateur:', error);
      setIsConnected(false);
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('🏁 Chargement des données utilisateur terminé');
    }
  };

  const login = async (userData: {
    id: string; // ID OBLIGATOIRE - doit être un UUID PostgreSQL
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    token?: string;
  }): Promise<void> => {
    try {
      console.log('🔐 Début de la connexion...');
      console.log('🔍 Validation UUID PostgreSQL...');
      
      // VALIDATION STRICTE: L'ID DOIT être un UUID PostgreSQL valide
      if (!userData.id) {
        throw new Error('❌ ERREUR CRITIQUE: ID utilisateur manquant - doit venir de PostgreSQL');
      }

      // Vérifier que c'est un UUID valide (format PostgreSQL)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userData.id)) {
        console.log('❌ ID reçu:', userData.id);
        console.log('❌ Format attendu: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
        throw new Error(`❌ ERREUR CRITIQUE: ID "${userData.id}" n'est pas un UUID PostgreSQL valide`);
      }

      console.log('✅ UUID PostgreSQL valide:', userData.id);
      console.log('👤 Utilisateur:', userData.firstName, userData.lastName);

      // Nettoyer les données des anciens comptes avant de se connecter
      console.log('🧹 Nettoyage des données des anciens comptes...');
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const allKeys = await AsyncStorage.getAllKeys();
        const oldOrderKeys = allKeys.filter(key => 
          key.startsWith('@pako_orders_') && !key.endsWith(userData.id)
        );
        if (oldOrderKeys.length > 0) {
          await AsyncStorage.multiRemove(oldOrderKeys);
          console.log('🗑️ Anciennes commandes supprimées:', oldOrderKeys.length);
        }
      } catch (error) {
        console.log('⚠️ Erreur nettoyage anciennes commandes:', error);
      }

      // Créer l'utilisateur local avec l'UUID PostgreSQL UNIQUEMENT
      const localUserData: LocalUser = {
        id: userData.id, // UUID PostgreSQL OBLIGATOIRE
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        email: userData.email,
        isConnected: true,
        loginDate: new Date().toISOString(),
      };
      
      // Sauvegarder le token si fourni
      if (userData.token) {
        await AuthService.saveToken(userData.token);
        console.log('🔑 Token sauvegardé');
      }
      
      const newUser = await UserStorageService.createUser({
        id: localUserData.id,
        firstName: localUserData.firstName,
        lastName: localUserData.lastName,
        phone: localUserData.phone,
        email: localUserData.email,
      });
      setUser(newUser);
      setIsConnected(true);
      
      console.log('✅ Connexion réussie pour:', `${userData.firstName} ${userData.lastName}`);
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('\n🚪 ===== DÉBUT DÉCONNEXION HOOK =====');
      
      // ÉTAPE 1: Récupérer et valider l'ID utilisateur
      const userId = user?.id;
      console.log('🆔 User ID récupéré du state:', userId);
      console.log('👤 Utilisateur actuel:', user ? `${user.firstName} ${user.lastName}` : 'Aucun');
      
      if (!userId) {
        console.log('⚠️ Pas d\'ID utilisateur - impossible de notifier le backend');
      } else {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isValidUUID = uuidRegex.test(userId);
        console.log('🔍 UUID valide:', isValidUUID);
        
        if (!isValidUUID) {
          console.log('❌ UUID invalide détecté, nettoyage forcé requis');
        }
      }
      
      // ÉTAPE 2: Nettoyer le stockage local (UserStorageService)
      console.log('\n🧹 Nettoyage UserStorageService...');
      await UserStorageService.logout();
      console.log('✅ UserStorageService nettoyé');
      
      // ÉTAPE 3: Nettoyer l'authentification et notifier le backend (AuthService)
      console.log('\n📡 Appel AuthService.logout avec UUID:', userId);
      await AuthService.logout(userId);
      console.log('✅ AuthService.logout terminé');
      
      // ÉTAPE 4: Mettre à jour l'état local
      console.log('\n🔄 Mise à jour état local...');
      setUser(null);
      setIsConnected(false);
      console.log('✅ État local mis à jour');
      
      console.log('\n✅ DÉCONNEXION HOOK TERMINÉE');
      console.log('=====================================\n');
      
    } catch (error) {
      console.error('\n❌ ERREUR DANS HOOK LOGOUT:', error);
      console.error('Stack trace:', error);
      
      // Même en cas d'erreur, on nettoie l'état local
      console.log('🧹 Nettoyage d\'urgence de l\'état local...');
      setUser(null);
      setIsConnected(false);
      console.log('✅ État local nettoyé en urgence');
      
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