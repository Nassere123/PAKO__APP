import React from 'react';
import { Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// @ts-ignore - Module @expo/vector-icons installé mais types non disponibles
import { Ionicons } from '@expo/vector-icons';
import AgentHomeScreen from '../screens/agent/AgentHomeScreen';
import AgentOrdersScreen from '../screens/agent/AgentOrdersScreen';
import AgentParcelsScreen from '../screens/agent/AgentParcelsScreen';
import AgentParcelListScreen from '../screens/agent/AgentParcelListScreen';
import AgentProfileScreen from '../screens/agent/AgentProfileScreen';
import { AgentTabParamList, AgentParcelsStackParamList } from '../types/navigation';
import { COLORS } from '../constants/colors';
import { SIZES } from '../constants/sizes';

const HOME_ICON = require('../../assets/home-tab.png');
const PROFILE_ICON = require('../../assets/profile-tab.png');

const Tab = createBottomTabNavigator<AgentTabParamList>();
const ParcelsStack = createNativeStackNavigator<AgentParcelsStackParamList>();
const HomeStack = createNativeStackNavigator();

const AgentHomeStack: React.FC = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="AgentHomeMain" component={AgentHomeScreen} />
      <HomeStack.Screen name="AgentOrders" component={AgentOrdersScreen} />
    </HomeStack.Navigator>
  );
};

const AgentParcelsStack: React.FC = () => {
  return (
    <ParcelsStack.Navigator screenOptions={{ headerShown: false }}>
      <ParcelsStack.Screen name="AgentParcelsHome" component={AgentParcelsScreen} />
      <ParcelsStack.Screen name="AgentParcelList" component={AgentParcelListScreen} />
    </ParcelsStack.Navigator>
  );
};

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
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'AgentParcels') {
            return (
              <Image
                source={require('../../assets/boxes.png')}
                style={{
                  width: size,
                  height: size,
                  tintColor: color,
                  opacity: focused ? 1 : 0.6,
                }}
                resizeMode="contain"
              />
            );
          }

          if (route.name === 'AgentHome' || route.name === 'AgentProfile') {
            const iconSource = route.name === 'AgentHome' ? HOME_ICON : PROFILE_ICON;
            return (
              <Image
                source={iconSource}
                style={{
                  width: size + 6,
                  height: size + 6,
                  tintColor: color,
                  opacity: focused ? 1 : 0.7,
                }}
                resizeMode="contain"
              />
            );
          }

          return <Ionicons name="home-outline" size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: SIZES.font.xs,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="AgentHome"
        component={AgentHomeStack}
        options={{ tabBarLabel: 'Accueil' }}
      />
      <Tab.Screen
        name="AgentParcels"
        component={AgentParcelsStack}
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
