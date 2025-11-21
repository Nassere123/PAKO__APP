# Intégration API - Pako Admin

Ce document explique comment connecter l'application Pako Admin au backend.

## Configuration

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet `PAKO ADMIN` avec le contenu suivant :

```env
VITE_API_BASE_URL=http://localhost:3000
```

**Note:** Remplacez `http://localhost:3000` par l'URL de votre backend si elle est différente.

### 2. Structure des services API

Les services API sont organisés dans `src/lib/api/` :

- `config.ts` : Configuration de base de l'API
- `http-client.ts` : Client HTTP avec gestion des tokens JWT
- `services/` : Services spécifiques pour chaque ressource
  - `auth.service.ts` : Authentification
  - `users.service.ts` : Gestion des utilisateurs
  - `delivery-persons.service.ts` : Gestion des livreurs
  - `stations.service.ts` : Gestion des gares
  - `orders.service.ts` : Gestion des commandes
  - `admin.service.ts` : Statistiques admin

## Utilisation

### Exemple : Récupérer tous les utilisateurs

```typescript
import { usersService } from '@/lib/api/services';

// Dans un composant React
const fetchUsers = async () => {
  try {
    const users = await usersService.findAll();
    console.log(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
  }
};
```

### Exemple : Authentification

```typescript
import { authService } from '@/lib/api/services';

// Connexion
const login = async (phone: string, otpCode: string) => {
  try {
    const response = await authService.login({ phone, otpCode });
    // Le token est automatiquement sauvegardé dans localStorage
    console.log('Utilisateur connecté:', response.user);
  } catch (error) {
    console.error('Erreur de connexion:', error);
  }
};
```

## Gestion des erreurs

Le client HTTP gère automatiquement les erreurs et les transforme en objets `ApiError` :

```typescript
try {
  const data = await usersService.findAll();
} catch (error: ApiError) {
  console.error(error.message); // Message d'erreur
  console.error(error.status);   // Code HTTP
  console.error(error.errors);   // Erreurs de validation (si applicable)
}
```

## Authentification JWT

Le token JWT est automatiquement :
- Ajouté aux en-têtes de chaque requête si présent dans `localStorage`
- Sauvegardé après une connexion réussie
- Supprimé lors de la déconnexion

Pour utiliser un token personnalisé :

```typescript
import { httpClient } from '@/lib/api/http-client';

httpClient.setToken('votre-token-jwt');
```

## Prochaines étapes

1. ✅ Configuration API et services créés
2. ⏳ Remplacer les données mockées dans les composants
3. ⏳ Intégrer l'authentification dans LoginPage
4. ⏳ Connecter le Dashboard aux données réelles
5. ⏳ Connecter tous les autres panneaux

