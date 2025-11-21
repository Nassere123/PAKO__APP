import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import DriverNavigator from './DriverNavigator';
import AgentNavigator from './AgentNavigator';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  // Log pour déboguer la navigation
  React.useEffect(() => {
    console.log('🔍 RootNavigator - user:', user, 'loading:', loading);
    if (user) {
      console.log('✅ Utilisateur détecté, rôle:', user.role);
    }
  }, [user, loading]);

  // Déterminer quel navigateur afficher
  const renderNavigator = () => {
    if (loading) {
      return (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }
    
    if (user) {
      console.log('🚀 Navigation vers:', user.role === 'driver' ? 'DriverNavigator' : 'AgentNavigator');
      return user.role === 'driver' ? <DriverNavigator /> : <AgentNavigator />;
    }
    
    console.log('🔐 Affichage de AuthNavigator');
    return <AuthNavigator />;
  };

  return (
    <NavigationContainer>
      {renderNavigator()}
    </NavigationContainer>
  );
};

export default RootNavigator;
