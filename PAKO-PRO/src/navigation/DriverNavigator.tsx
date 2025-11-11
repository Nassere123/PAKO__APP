import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import DriverDeliveriesScreen from '../screens/driver/DriverDeliveriesScreen';
import DriverDeliveryListScreen from '../screens/driver/DriverDeliveryListScreen';
import DriverProfileScreen from '../screens/driver/DriverProfileScreen';
import { DriverDeliveriesStackParamList, DriverTabParamList } from '../types/navigation';
import { COLORS } from '../constants/colors';
import { SIZES } from '../constants/sizes';

const Tab = createBottomTabNavigator<DriverTabParamList>();
const DeliveriesStack = createNativeStackNavigator<DriverDeliveriesStackParamList>();

const DriverDeliveriesNavigator: React.FC = () => (
  <DeliveriesStack.Navigator screenOptions={{ headerShown: false }}>
    <DeliveriesStack.Screen name="DriverDeliveriesHome" component={DriverDeliveriesScreen} />
    <DeliveriesStack.Screen name="DriverDeliveryList" component={DriverDeliveryListScreen} />
  </DeliveriesStack.Navigator>
);

const DriverNavigator: React.FC = () => {
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

          if (route.name === 'DriverHome') {
            iconName = 'home-variant-outline';
          } else if (route.name === 'DriverDeliveries') {
            iconName = 'truck-delivery-outline';
          } else if (route.name === 'DriverProfile') {
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
        name="DriverHome"
        component={DriverHomeScreen}
        options={{ tabBarLabel: 'Accueil' }}
      />
      <Tab.Screen
        name="DriverDeliveries"
        component={DriverDeliveriesNavigator}
        options={{ tabBarLabel: 'Livraisons' }}
      />
      <Tab.Screen
        name="DriverProfile"
        component={DriverProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

export default DriverNavigator;
