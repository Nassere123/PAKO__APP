# Instructions pour ajouter votre image du livreur PAKO

## 📁 Étape 1 : Préparer votre image

1. **Formats acceptés** : PNG, JPG, JPEG
2. **Taille recommandée** : 500x500 pixels minimum
3. **Nom du fichier** : `delivery-person.png` (ou .jpg)
4. **Qualité** : Image haute résolution pour un rendu optimal

## 📂 Étape 2 : Placer l'image dans le projet

1. Créez un dossier `assets` à la racine du projet (s'il n'existe pas)
2. Placez votre image dans : `assets/delivery-person.png`

Structure du projet :
```
pako-client/
├── assets/
│   ├── delivery-person.png  ← Votre image ici
│   ├── icon.png
│   └── splash-icon.png
├── screens/
├── components/
└── ...
```

## 🔧 Étape 3 : Modifier le code

### 3.1 Importer l'image dans WelcomeScreen.tsx

Ajoutez cette ligne en haut du fichier `screens/WelcomeScreen.tsx` :

```typescript
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image, // ← Ajoutez cette ligne
} from 'react-native';
import { COLORS } from '../constants';
import { WelcomeScreenProps } from '../types';
```

### 3.2 Remplacer le placeholder par votre image

Dans le fichier `screens/WelcomeScreen.tsx`, remplacez cette section :

```typescript
{/* Image placeholder - Remplacez par votre image */}
<View style={styles.imageSection}>
  <View style={styles.imageContainer}>
    {/* Ici vous ajouterez votre image du livreur PAKO */}
    <Text style={styles.placeholderText}>Image du livreur PAKO</Text>
  </View>
</View>
```

Par :

```typescript
{/* Image du livreur PAKO */}
<View style={styles.imageSection}>
  <Image 
    source={require('../assets/delivery-person.png')}
    style={styles.deliveryImage}
    resizeMode="contain"
  />
</View>
```

### 3.3 Ajouter le style pour l'image

Dans la section `styles` du fichier `screens/WelcomeScreen.tsx`, ajoutez :

```typescript
deliveryImage: {
  width: 250,
  height: 250,
},
```

Et supprimez ou commentez ces styles qui ne sont plus nécessaires :
```typescript
// imageContainer: { ... },  ← Commentez ou supprimez
// placeholderText: { ... },  ← Commentez ou supprimez
```

## ✅ Étape 4 : Tester

1. Sauvegardez tous les fichiers
2. Lancez l'application : `npm start`
3. Vérifiez que votre image s'affiche correctement

## 🎨 Conseils pour l'image

- **Style cartoon** : Évitez les photos réalistes, préférez les illustrations
- **Couleurs vives** : Orange PAKO, jaune pour le scooter
- **Fond transparent** : PNG avec transparence pour un meilleur rendu
- **Orientation** : Livreur face à droite ou de face
- **Détails** : Logo PAKO visible, scooter jaune, colis

## 🔄 Alternative : Image en ligne

Si vous préférez utiliser une URL d'image :

```typescript
<Image 
  source={{ uri: 'https://votre-url.com/delivery-person.png' }}
  style={styles.deliveryImage}
  resizeMode="contain"
/>
```

## ❓ Problèmes courants

1. **Image ne s'affiche pas** : Vérifiez le chemin du fichier
2. **Image floue** : Augmentez la résolution de l'image
3. **Image déformée** : Ajustez `resizeMode` (`contain`, `cover`, `stretch`)
4. **Trop grande/petite** : Modifiez les dimensions dans `styles.deliveryImage`

## 📱 Résultat attendu

Votre écran d'accueil devrait maintenant afficher :
1. **PAKO** (logo orange en haut)
2. **Message de salutation** (centré)
3. **Votre image du livreur** (au centre)
4. **Boutons d'action** (en bas)
