import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import SplashScreen from '../screens/SplashScreen';
import AppNavigator from '../navigation';
import { useAuth } from '../hooks';

const AppWrapper: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const { isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Simulation du chargement des ressources de l'application
    const loadAppResources = async () => {
      try {
        // Ici vous pouvez charger des ressources comme :
        // - Données utilisateur
        // - Configuration
        // - Images/cache
        // - Base de données locale
        // - Authentification
        
        // Simulation d'un délai de chargement
        await new Promise(resolve => setTimeout(resolve, 4500));
        
        // Marquer l'application comme prête
        setIsAppReady(true);
      } catch (error) {
        console.error('Erreur lors du chargement des ressources:', error);
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
  return <AppNavigator />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppWrapper;
