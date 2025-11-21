import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AuthUser, Credentials, UserRole } from '../types/auth';
import { authService } from '../lib/api/services';
import { Alert } from 'react-native';
import BottomToast from '../components/BottomToast';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastTitle, setToastTitle] = useState('');

  const signIn = useCallback(async ({ role, phone, password }: Credentials) => {
    setLoading(true);
    try {
      // Normaliser le numéro de téléphone
      const normalizedPhone = phone?.trim() || '';
      
      // Validation stricte des champs
      if (!normalizedPhone) {
        const error = new Error('Veuillez entrer votre numéro de téléphone');
        Alert.alert('Champ requis', error.message);
        throw error;
      }

      if (!password || password.trim().length === 0) {
        const error = new Error('Veuillez entrer votre mot de passe');
        Alert.alert('Champ requis', error.message);
        throw error;
      }

      // Validation du format du numéro de téléphone (doit commencer par +225 et avoir 10 chiffres après)
      const phoneRegex = /^\+225\d{10}$/;
      if (!phoneRegex.test(normalizedPhone)) {
        const error = new Error('Le numéro de téléphone doit contenir 10 chiffres');
        Alert.alert('Format invalide', error.message);
        throw error;
      }

      // Appel API pour se connecter selon le rôle
      let authUser: AuthUser;
      
      if (role === 'driver') {
        // Connexion d'un livreur (table drivers)
        const response = await authService.loginDriver(normalizedPhone, password);
        authUser = {
          id: response.driver.id,
          phone: response.driver.phone,
          fullName: `${response.driver.firstName} ${response.driver.lastName}`.trim(),
          role: 'driver',
        };
      } else {
        // Connexion d'un agent de gare (table users avec userType = station_agent)
      const response = await authService.loginWorker(normalizedPhone, password);

      // Vérifier que le type d'utilisateur correspond au rôle sélectionné
      const userType = response.user.userType;
        const expectedUserType = 'station_agent';
      
        // Vérifier que l'utilisateur a le bon type (station_agent pour agent)
      if (userType !== expectedUserType && userType !== 'admin') {
          throw new Error(`Ce compte n'est pas un compte agent de gare. Veuillez vous connecter avec le bon espace.`);
      }

      // Créer l'objet utilisateur
        authUser = {
        id: response.user.id,
        phone: response.user.phone,
        fullName: `${response.user.firstName} ${response.user.lastName}`.trim(),
          role: 'agent',
      };
      }

      // Mettre à jour l'utilisateur et désactiver le loading de manière synchrone
      // Sur le web, il est important de mettre à jour les deux états en même temps
      console.log('🔄 Mise à jour de l\'utilisateur:', authUser);
      
      // Mettre à jour les deux états de manière synchrone
      setUser(authUser);
      setLoading(false);
      
      console.log('✅ Utilisateur connecté et loading désactivé');
    } catch (error: any) {
      // Gestion spécifique des erreurs selon le type
      let errorMessage = error?.message || error?.error || 'Erreur de connexion. Vérifiez vos identifiants.';
      let alertTitle = 'Erreur de connexion';
      let shouldLogError = true; // Par défaut, on log l'erreur
      
      // Si c'est une erreur de mauvais espace (livreur/agent), ne pas logger dans la console
      if (errorMessage?.includes('n\'est pas un compte') && errorMessage?.includes('Veuillez vous connecter avec le bon espace')) {
        shouldLogError = false; // Ne pas afficher dans la console
        alertTitle = 'Espace incorrect';
      }
      // Si c'est une erreur réseau (connexion au serveur)
      else if (error?.status === 0 || errorMessage?.includes('se connecter au serveur') || errorMessage?.includes('n\'est pas accessible') || errorMessage?.includes('Impossible de se connecter')) {
        // Le message d'erreur du http-client contient déjà les instructions détaillées
        // On le garde tel quel pour éviter la duplication
        if (!errorMessage?.includes('Impossible de se connecter') && !errorMessage?.includes('Timeout')) {
          errorMessage = 'Le serveur backend n\'est pas accessible.\n\nVérifiez que:\n• Le serveur est DÉMARRÉ (npm run start:dev dans le dossier BACK END)\n• Le serveur écoute sur le port 3000\n• Votre appareil/émulateur peut accéder au serveur';
        }
        alertTitle = 'Serveur inaccessible';
        
        // Afficher l'URL dans la console pour le débogage (seulement en développement)
        if (__DEV__) {
          console.error('🔍 Diagnostic de connexion:');
          console.error(`   URL configurée: ${error?.url || 'Non disponible'}`);
          console.error(`   Message d\'erreur: ${errorMessage}`);
        }
      }
      // Si le compte n'existe pas (404 - NotFoundException)
      else if (error?.status === 404 || errorMessage?.includes('Compte inexistant')) {
        errorMessage = 'Compte inexistant, veuillez contacter l\'admin';
        alertTitle = 'Compte introuvable';
      }
      // Si le compte n'utilise pas l'authentification par mot de passe
      else if (error?.status === 401 && errorMessage?.includes('n\'utilise pas l\'authentification par mot de passe')) {
        errorMessage = 'Ce compte n\'est pas configuré pour la connexion par mot de passe.\n\nVeuillez contacter l\'administrateur pour activer votre compte travailleur.';
        alertTitle = 'Compte non configuré';
      }
      // Si le numéro ou mot de passe est incorrect (401 - UnauthorizedException)
      else if (error?.status === 401 && (errorMessage?.includes('Numéro ou mot de passe incorrect') || errorMessage?.includes('Mot de passe incorrect'))) {
        errorMessage = 'Numéro ou mot de passe incorrect';
        alertTitle = 'Erreur d\'authentification';
        
        // Afficher le pop-up animé du bas pour les erreurs d'authentification
        setToastTitle(alertTitle);
        setToastMessage(errorMessage);
        setToastVisible(true);
        
        // Logger l'erreur seulement si nécessaire (pas pour les erreurs de mauvais espace)
        if (shouldLogError && __DEV__) {
          console.error('Erreur de connexion:', error);
        }
        
        return;
      }
      // Autres erreurs 401 (compte inactif, etc.)
      else if (error?.status === 401) {
        alertTitle = 'Erreur d\'authentification';
      }
      
      // Logger l'erreur seulement si nécessaire (pas pour les erreurs de mauvais espace)
      if (shouldLogError && __DEV__) {
        console.error('Erreur de connexion:', error);
      }
      
      // Afficher l'alerte utilisateur (Alert.alert pour les autres erreurs)
      Alert.alert(alertTitle, errorMessage);
      
      // Ne pas re-throw l'erreur pour éviter qu'elle apparaisse dans la console React Native
      // On retourne silencieusement après avoir affiché l'alerte
      setLoading(false);
      return;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (user?.id) {
        // Appeler le service de déconnexion approprié selon le rôle
        if (user.role === 'driver') {
          // Pour les livreurs, utiliser logoutDriver qui met à jour isOnline dans la table drivers
          await authService.logoutDriver(user.id);
        } else {
          // Pour les agents de gare, utiliser logout qui met à jour isOnline dans la table station_agents
          await authService.logout(user.id);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Continuer la déconnexion locale même en cas d'erreur réseau
    } finally {
      // Toujours déconnecter l'utilisateur localement
      setUser(null);
    }
  }, [user]);

  const value = useMemo(
    () => ({ user, loading, signIn, signOut }),
    [user, loading, signIn, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <BottomToast
        visible={toastVisible}
        title={toastTitle}
        message={toastMessage}
        onClose={() => setToastVisible(false)}
        duration={4000}
        type="error"
      />
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
