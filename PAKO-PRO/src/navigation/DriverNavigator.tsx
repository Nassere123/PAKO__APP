import React from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// @ts-ignore - Module @expo/vector-icons installé mais types non disponibles
import { Ionicons } from '@expo/vector-icons';
import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import DriverDeliveriesScreen from '../screens/driver/DriverDeliveriesScreen';
import DriverDeliveryListScreen from '../screens/driver/DriverDeliveryListScreen';
import DriverNavigationScreen from '../screens/driver/DriverNavigationScreen';
import DriverSignatureScreen from '../screens/driver/DriverSignatureScreen';
import DriverProfileScreen from '../screens/driver/DriverProfileScreen';
import { DriverDeliveriesStackParamList, DriverTabParamList } from '../types/navigation';
import { COLORS } from '../constants/colors';
import { SIZES } from '../constants/sizes';
import { useAuth } from '../context/AuthContext';
import { driverService } from '../services/driverService';

const Tab = createBottomTabNavigator<DriverTabParamList>();
const DeliveriesStack = createNativeStackNavigator<DriverDeliveriesStackParamList>();

const DriverDeliveriesNavigator: React.FC = () => (
  <DeliveriesStack.Navigator screenOptions={{ headerShown: false }}>
    <DeliveriesStack.Screen name="DriverDeliveriesHome" component={DriverDeliveriesScreen} />
    <DeliveriesStack.Screen name="DriverDeliveryList" component={DriverDeliveryListScreen} />
    <DeliveriesStack.Screen name="DriverNavigation" component={DriverNavigationScreen} />
    <DeliveriesStack.Screen name="DriverSignature" component={DriverSignatureScreen} />
  </DeliveriesStack.Navigator>
);

const DriverOnlineStatusManager: React.FC = () => {
  const { user } = useAuth();
  const appState = React.useRef<AppStateStatus>(AppState.currentState);

  React.useEffect(() => {
    if (!user || user.role !== 'driver') {
      return;
    }

    const updateStatus = async (isOnline: boolean) => {
      try {
        await driverService.updateOnlineStatus(user.id, isOnline);
      } catch (error: any) {
        // Ne pas logger les erreurs réseau temporaires comme des erreurs critiques
        // Ces erreurs sont souvent temporaires et se résolvent automatiquement
        if (error?.status === 0 || error?.message?.includes('Erreur réseau')) {
          // Erreur réseau temporaire, ne pas logger comme erreur critique
          if (__DEV__) {
            console.warn('⚠️ Problème réseau temporaire lors de la mise à jour du statut en ligne');
          }
        } else {
          // Erreur réelle (404, 500, etc.)
          console.error('Erreur lors de la mise à jour du statut en ligne:', error);
        }
      }
    };

    // Marquer le livreur en ligne à l'ouverture de l'app
    updateStatus(true);

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (!user || user.role !== 'driver') {
        return;
      }

      const wasBackground = appState.current === 'inactive' || appState.current === 'background';
      const isBackground = nextState === 'inactive' || nextState === 'background';

      if (wasBackground && nextState === 'active') {
        updateStatus(true);
      } else if (!wasBackground && isBackground) {
        updateStatus(false);
      }

      appState.current = nextState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      updateStatus(false);
    };
  }, [user]);

  return null;
};

const DriverNavigator: React.FC = () => {
  return (
    <>
      <DriverOnlineStatusManager />
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
          let iconName: any = 'home-outline';

          if (route.name === 'DriverHome') {
            iconName = 'home-outline';
          } else if (route.name === 'DriverDeliveries') {
            iconName = 'car-outline';
          } else if (route.name === 'DriverProfile') {
            iconName = 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
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
    </>
  );
};

export default DriverNavigator;
