# 📦 Imports de référence pour Pako Client

## 🚀 React Navigation

```typescript
// Navigation principale
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StackScreenProps } from '@react-navigation/stack';

// Types de navigation
import { RootStackParamList } from '../types/navigation';
```

## ⚛️ React et React Native

```typescript
// React core
import React, { useState, useEffect, useRef } from 'react';

// React Native components
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';

// React Native Maps
import MapView, { Marker, Polyline } from 'react-native-maps';
```

## 🎨 Composants personnalisés

```typescript
// Tous les composants
import { 
  Button, 
  Input, 
  Card, 
  PhoneInput, 
  Checkbox, 
  TrackingMap, 
  AppWrapper, 
  AnimatedModal 
} from '../components';

// Ou import individuel
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import PhoneInput from '../components/PhoneInput';
import Checkbox from '../components/Checkbox';
import TrackingMap from '../components/TrackingMap';
import AppWrapper from '../components/AppWrapper';
import AnimatedModal from '../components/AnimatedModal';
```

## 🔧 Hooks personnalisés

```typescript
// Tous les hooks
import { useApi, useAuth, useStorage } from '../hooks';

// Ou import individuel
import { useAuth } from '../hooks/useAuth';
import useApi from '../hooks/useApi';
import useStorage from '../hooks/useStorage';
```

## 🛠️ Services

```typescript
// Tous les services
import * as authService from '../services/authService';
import * as userService from '../services/userService';
import * as userStorage from '../services/userStorage';

// Ou depuis l'index
import { 
  login, 
  register, 
  logout, 
  getUserProfile, 
  updateUserProfile 
} from '../services';
```

## 📊 Constantes et types

```typescript
// Constantes
import { COLORS, SIZES } from '../constants';

// Types
import { 
  RootStackParamList,
  AuthCredentials,
  RegisterData,
  User,
  Package,
  AuthScreenProps,
  HomeScreenProps,
  ProfileScreenProps,
  PhoneVerificationScreenProps,
  EvaluationScreenProps
} from '../types';
```

## 🗄️ Storage

```typescript
// AsyncStorage pour le stockage local
import AsyncStorage from '@react-native-async-storage/async-storage';
```

## 📱 Expo (si utilisé)

```typescript
// Splash Screen
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
```

## 🌍 Utilitaires

```typescript
// Utilitaires de formatage et helpers
import { formatDate, formatCurrency, validateEmail } from '../utils';

// Validation
import { validatePhone, validateEmail, validatePassword } from '../lib/validation';
```

## 📋 Exemple complet d'imports pour un écran

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Button, Input, Card } from '../components';
import { useAuth } from '../hooks';
import { COLORS, SIZES } from '../constants';
import { RootStackParamList, AuthCredentials } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ScreenProps = StackScreenProps<RootStackParamList, 'ScreenName'>;
```

## 🔄 Packages installés

Les packages suivants sont installés dans votre projet :

- `@react-navigation/native` - Navigation principale
- `@react-navigation/stack` - Navigation par pile
- `@react-navigation/native-stack` - Navigation native stack
- `@react-native-async-storage/async-storage` - Stockage local
- `react-native-maps` - Cartes intégrées
- `react-native-gesture-handler` - Gestion des gestes
- `react-native-screens` - Optimisation des écrans
- `react-native-safe-area-context` - Zone sécurisée
- `expo` - Framework Expo
- `axios` - Requêtes HTTP
- `typescript` - Support TypeScript

## 📝 Notes importantes

1. **Navigation** : Utilisez `@react-navigation/stack` pour une navigation personnalisée
2. **Types** : Toujours importer les types appropriés pour TypeScript
3. **Composants** : Importez depuis `../components` pour la cohérence
4. **Hooks** : Utilisez `useAuth` pour l'authentification
5. **Storage** : Utilisez `AsyncStorage` pour le stockage local
6. **Constantes** : Importez `COLORS` et `SIZES` pour la cohérence visuelle
