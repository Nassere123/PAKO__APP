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
  PackageRatingScreen
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
