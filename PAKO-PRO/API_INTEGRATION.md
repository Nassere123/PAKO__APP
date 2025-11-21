# Intégration API - PAKO PRO

Ce document explique comment connecter l'application PAKO PRO au backend.

## Configuration

### 1. Configuration de l'URL de l'API

L'URL de l'API est configurée dans `src/lib/api/config.ts`. Par défaut :
- **Développement** : `http://localhost:3000`
- **Production** : À configurer selon votre environnement

Pour changer l'URL, modifiez le fichier `src/lib/api/config.ts` :

```typescript
export const API_CONFIG = {
  baseURL: 'http://votre-url-api:3000',
  timeout: 30000,
};
```

**Note pour Android** : Si vous testez sur un émulateur Android, utilisez `http://10.0.2.2:3000` au lieu de `localhost`.

**Note pour iOS** : Utilisez l'IP locale de votre machine (ex: `http://192.168.1.100:3000`).

### 2. Installation des dépendances

Assurez-vous d'avoir installé les dépendances nécessaires :

```bash
npm install @react-native-async-storage/async-storage expo-constants
```

## Structure des services API

Les services API sont organisés dans `src/lib/api/` :

- `config.ts` : Configuration de base de l'API
- `http-client.ts` : Client HTTP avec gestion des tokens JWT (utilise AsyncStorage)
- `services/` : Services spécifiques pour chaque ressource
  - `auth.service.ts` : Authentification
  - `delivery-persons.service.ts` : Gestion des livreurs
  - `orders.service.ts` : Gestion des commandes
  - `stations.service.ts` : Gestion des gares

## Utilisation

### Exemple : Authentification

```typescript
import { authService } from '@/lib/api/services';

// Envoyer un code OTP
const sendOtp = async (phone: string) => {
  try {
    const response = await authService.sendOtp({ phone });
    console.log('OTP envoyé:', response);
  } catch (error) {
    console.error('Erreur:', error);
  }
};

// Connexion
const login = async (phone: string, otpCode: string) => {
  try {
    const response = await authService.login({ phone, otpCode });
    // Le token est automatiquement sauvegardé dans AsyncStorage
    console.log('Utilisateur connecté:', response.user);
  } catch (error) {
    console.error('Erreur de connexion:', error);
  }
};
```

### Exemple : Mettre à jour la localisation d'un livreur

```typescript
import { deliveryPersonsService } from '@/lib/api/services';

const updateLocation = async (driverId: string, latitude: number, longitude: number) => {
  try {
    const updated = await deliveryPersonsService.updateLocation(driverId, {
      latitude,
      longitude,
    });
    console.log('Localisation mise à jour:', updated);
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

### Exemple : Récupérer les commandes

```typescript
import { ordersService } from '@/lib/api/services';

const fetchOrders = async (userId: string) => {
  try {
    const orders = await ordersService.findByUserId(userId);
    console.log('Commandes:', orders);
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

## Gestion des erreurs

Le client HTTP gère automatiquement les erreurs et les transforme en objets `ApiError` :

```typescript
try {
  const data = await ordersService.findAll();
} catch (error: ApiError) {
  console.error(error.message); // Message d'erreur
  console.error(error.status);   // Code HTTP
  console.error(error.errors);   // Erreurs de validation (si applicable)
}
```

## Authentification JWT

Le token JWT est automatiquement :
- Ajouté aux en-têtes de chaque requête si présent dans `AsyncStorage`
- Sauvegardé après une connexion réussie
- Supprimé lors de la déconnexion

Pour utiliser un token personnalisé :

```typescript
import { httpClient } from '@/lib/api/http-client';

await httpClient.setToken('votre-token-jwt');
```

## Prochaines étapes

1. ✅ Configuration API et services créés
2. ⏳ Mettre à jour AuthContext pour utiliser l'API réelle
3. ⏳ Remplacer les services mockés (driverService, orderService, deliveryService)
4. ⏳ Intégrer les appels API dans les écrans

## Notes importantes

- **AsyncStorage** : Utilisé pour stocker le token JWT de manière persistante
- **Timeout** : Les requêtes expirent après 30 secondes par défaut
- **CORS** : Assurez-vous que votre backend autorise les requêtes depuis votre application mobile

