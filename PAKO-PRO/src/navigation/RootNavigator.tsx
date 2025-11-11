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

  return (
    <NavigationContainer>
      {loading ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : user ? (
        user.role === 'driver' ? <DriverNavigator /> : <AgentNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
