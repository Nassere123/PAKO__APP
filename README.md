# PAKO Client

Application mobile développée avec React Native et Expo pour la plateforme PAKO.

## 📁 Structure du projet

```
pako-client/
├── components/          # Composants réutilisables
│   ├── Button.js       # Bouton personnalisé
│   ├── Input.js        # Champ de saisie personnalisé
│   ├── Card.js         # Carte de contenu
│   └── index.js        # Export des composants
├── hooks/              # Hooks personnalisés
│   ├── useApi.js       # Hook pour les appels API
│   ├── useAuth.js      # Hook pour l'authentification
│   ├── useStorage.js   # Hook pour le stockage local
│   └── index.js        # Export des hooks
├── lib/                # Bibliothèques et utilitaires
│   ├── api.js          # Configuration API (Axios)
│   ├── validation.js   # Fonctions de validation
│   ├── storage.js      # Utilitaires de stockage
│   └── index.js        # Export des libs
├── screens/            # Écrans de l'application
│   ├── HomeScreen.js   # Écran d'accueil
│   ├── LoginScreen.js  # Écran de connexion
│   ├── ProfileScreen.js # Écran de profil
│   └── index.js        # Export des écrans
├── navigation/         # Configuration de navigation
│   └── index.js        # Navigation principale
├── services/           # Services métier
│   ├── authService.js  # Service d'authentification
│   ├── userService.js  # Service utilisateur
│   └── index.js        # Export des services
├── utils/              # Fonctions utilitaires
│   ├── helpers.js      # Fonctions d'aide
│   ├── formatters.js   # Formatage de données
│   └── index.js        # Export des utils
├── constants/          # Constantes de l'application
│   ├── colors.js       # Palette de couleurs
│   ├── sizes.js        # Tailles et espacements
│   ├── api.js          # Configuration API
│   └── index.js        # Export des constantes
├── types/              # Définitions de types
│   ├── user.js         # Types utilisateur
│   ├── api.js          # Types API
│   └── index.js        # Export des types
├── styles/             # Styles globaux (à créer)
├── assets/             # Images et ressources
├── App.js              # Point d'entrée principal
├── app.json            # Configuration Expo
└── package.json        # Dépendances du projet
```

## 🚀 Installation et démarrage

1. **Installer les dépendances :**
   ```bash
   npm install
   ```

2. **Démarrer l'application :**
   ```bash
   npm start
   ```

3. **Commandes disponibles :**
   - `npm run android` - Lancer sur Android
   - `npm run ios` - Lancer sur iOS
   - `npm run web` - Lancer dans le navigateur

## 📱 Fonctionnalités

- ✅ Navigation entre écrans
- ✅ Authentification utilisateur
- ✅ Stockage local des données
- ✅ Appels API avec gestion d'erreurs
- ✅ Composants réutilisables
- ✅ Hooks personnalisés
- ✅ Structure modulaire

## 🛠 Technologies utilisées

- **React Native** - Framework mobile
- **Expo** - Plateforme de développement
- **React Navigation** - Navigation entre écrans
- **Axios** - Client HTTP
- **AsyncStorage** - Stockage local

## 📝 Développement

Le projet suit une architecture modulaire avec :
- Séparation des responsabilités
- Composants réutilisables
- Hooks personnalisés pour la logique métier
- Services pour les appels API
- Constantes centralisées

## 🔧 Configuration

Modifiez les fichiers dans `constants/` pour adapter :
- URLs d'API
- Couleurs de l'application
- Tailles et espacements
