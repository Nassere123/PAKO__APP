import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  WelcomeScreen, 
  HomeScreen, 
  AuthScreen, 
  PhoneVerificationScreen, 
  ProfileScreen,
  PackageTrackingScreen,
  HistoryScreen,
  MultiStepPackageRegistrationScreen,
  EvaluationScreen,
  PaymentScreen,
  CartScreen,
  MyPackagesScreen,
  PackageListScreen,
  PackageRatingScreen,
  NotificationsScreen
} from '../screens';
import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FF6B35',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          // Optimisations pour des transitions rapides et fluides
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 200, // Réduit de 300ms à 200ms
                useNativeDriver: true,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 150, // Réduit de 250ms à 150ms
                useNativeDriver: true,
              },
            },
          },
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
          gestureEnabled: true,
          gestureResponseDistance: 50,
          gestureVelocityImpact: 0.3,
        }}
      >
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen as any} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PhoneVerification" 
          component={PhoneVerificationScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Mon Profil' }}
        />
        <Stack.Screen
          name="PackageTracking"
          component={PackageTrackingScreen}
          options={{ title: 'Suivi de colis' }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'Historique' }}
        />
        <Stack.Screen
          name="MultiStepPackageRegistration"
          component={MultiStepPackageRegistrationScreen}
          options={{ title: 'Enregistrer colis' }}
        />
        <Stack.Screen
          name="Evaluation"
          component={EvaluationScreen}
          options={{ title: 'Évaluation' }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ title: 'Paiement' }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ title: 'Panier' }}
        />
        <Stack.Screen
          name="MyPackages"
          component={MyPackagesScreen}
          options={{ title: 'Mes colis' }}
        />
        <Stack.Screen
          name="PackageList"
          component={PackageListScreen}
          options={{ title: 'Liste des colis' }}
        />
        <Stack.Screen
          name="PackageRating"
          component={PackageRatingScreen}
          options={{ title: 'Évaluer la livraison' }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
