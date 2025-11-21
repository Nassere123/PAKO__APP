# Installation des dépendances pour l'intégration API

## Dépendances requises

Pour que l'intégration API fonctionne, vous devez installer les dépendances suivantes :

```bash
npm install @react-native-async-storage/async-storage
```

**Note** : `expo-constants` est déjà inclus dans Expo, donc pas besoin de l'installer séparément.

## Vérification de l'installation

Après l'installation, vérifiez que les dépendances sont bien présentes dans `package.json` :

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "^1.x.x"
  }
}
```

## Configuration

1. **URL de l'API** : Modifiez `src/lib/api/config.ts` pour définir l'URL de votre backend
2. **Android Emulator** : Utilisez `http://10.0.2.2:3000`
3. **iOS Simulator** : Utilisez `http://localhost:3000`
4. **Appareil physique** : Utilisez l'IP de votre machine (ex: `http://192.168.1.100:3000`)

## Prochaines étapes

Une fois les dépendances installées, vous pouvez :
1. Mettre à jour `AuthContext` pour utiliser `authService`
2. Remplacer les services mockés par les appels API réels
3. Tester la connexion avec votre backend

