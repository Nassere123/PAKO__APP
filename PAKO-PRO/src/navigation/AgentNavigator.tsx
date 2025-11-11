import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AgentHomeScreen from '../screens/agent/AgentHomeScreen';
import AgentParcelsScreen from '../screens/agent/AgentParcelsScreen';
import AgentProfileScreen from '../screens/agent/AgentProfileScreen';
import { AgentTabParamList } from '../types/navigation';
import { COLORS } from '../constants/colors';
import { SIZES } from '../constants/sizes';

const Tab = createBottomTabNavigator<AgentTabParamList>();

const AgentNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          height: 64,
          paddingBottom: SIZES.spacing.sm,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'home-outline';

          if (route.name === 'AgentHome') {
            iconName = 'home-variant-outline';
          } else if (route.name === 'AgentParcels') {
            iconName = 'package-variant-closed';
          } else if (route.name === 'AgentProfile') {
            iconName = 'account-circle-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: SIZES.font.xs,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="AgentHome"
        component={AgentHomeScreen}
        options={{ tabBarLabel: 'Accueil' }}
      />
      <Tab.Screen
        name="AgentParcels"
        component={AgentParcelsScreen}
        options={{ tabBarLabel: 'Colis' }}
      />
      <Tab.Screen
        name="AgentProfile"
        component={AgentProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

export default AgentNavigator;
