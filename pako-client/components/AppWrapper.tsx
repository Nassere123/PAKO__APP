import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import SplashScreen from '../screens/SplashScreen';
import AppNavigator from '../navigation';
import { useAuth, ProfilePhotoProvider, ThemeProvider } from '../hooks';
import { startupNetworkTest, showNetworkTroubleshooting } from '../utils/quickNetworkTest';
import '../i18n'; // Initialiser i18n

const AppWrapper: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const { isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Chargement des ressources de l'application avec test réseau
    const loadAppResources = async () => {
      try {
        console.log('🚀 Démarrage de l\'application PAKO...');
        
        // ÉTAPE 1: Test de connectivité réseau immédiat
        console.log('🔍 Test de connectivité réseau...');
        const networkOk = await startupNetworkTest();
        
        if (!networkOk) {
          console.log('⚠️ Problème réseau détecté');
          showNetworkTroubleshooting();
          console.log('📱 L\'application va quand même démarrer');
        }
        
        // ÉTAPE 2: Chargement des autres ressources
        console.log('📦 Chargement des ressources...');
        // - Données utilisateur (géré par useAuth)
        // - Configuration API (déjà chargée)
        // - Images/cache
        // - Base de données locale
        
        // Simulation d'un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Marquer l'application comme prête
        console.log('✅ Application PAKO prête');
        setIsAppReady(true);
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement des ressources:', error);
        // Même en cas d'erreur, on affiche l'app
        setIsAppReady(true);
      }
    };

    loadAppResources();
  }, []);

  // Attendre que l'authentification et les ressources soient chargées
  useEffect(() => {
    if (isAppReady && !authLoading) {
      setIsLoading(false);
    }
  }, [isAppReady, authLoading]);

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  // Afficher l'écran de démarrage tant que l'app n'est pas prête ou en cours de chargement
  if (!isAppReady || isLoading) {
    return (
      <View style={styles.container}>
        <SplashScreen onFinish={handleSplashFinish} />
      </View>
    );
  }

  // Afficher l'application principale
  return (
    <ThemeProvider>
      <ProfilePhotoProvider>
        <AppNavigator />
      </ProfilePhotoProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppWrapper;
