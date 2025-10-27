# PAKO - Plateforme de Livraison de Colis

Application complète de livraison de colis développée avec React Native (frontend) et NestJS (backend).

## 📁 Structure du Projet

```
APP PAKO/
├── pako-client/          # Application mobile React Native
├── BACK END/             # API NestJS
├── PAKO ADMIN/           # Interface d'administration
├── PAKO PRO/             # Application pour livreurs
└── docs/                 # Documentation
```

## 🚀 Technologies Utilisées

### Frontend (pako-client)
- **React Native** avec Expo
- **TypeScript** pour le typage
- **React Navigation** pour la navigation
- **AsyncStorage** pour le stockage local
- **Axios** pour les appels API

### Backend (BACK END)
- **NestJS** framework Node.js
- **TypeORM** pour l'ORM
- **PostgreSQL** base de données
- **JWT** pour l'authentification
- **Swagger** pour la documentation API

## 📱 Fonctionnalités

### Application Client (pako-client)
- ✅ Authentification par OTP
- ✅ Enregistrement de colis
- ✅ Suivi de livraison
- ✅ Géolocalisation
- ✅ Interface multi-étapes

### API Backend (BACK END)
- ✅ Authentification JWT
- ✅ Gestion des utilisateurs
- ✅ Gestion des commandes
- ✅ Gestion des colis
- ✅ API RESTful complète

## 🛠 Installation et Démarrage

### Prérequis
- Node.js (v18+)
- PostgreSQL
- Expo CLI
- Git

### Backend
```bash
cd "BACK END"
npm install
npm run start:dev
```

### Frontend
```bash
cd pako-client
npm install
npm start
```

## 📊 Base de Données

Le projet utilise PostgreSQL avec les tables suivantes :
- `users` - Utilisateurs
- `orders` - Commandes
- `packages` - Colis
- `stations` - Stations de livraison

## 🔧 Configuration

### Variables d'environnement
Créez un fichier `.env` dans le dossier `BACK END` :
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=2050
DB_DATABASE=pako_db
JWT_SECRET=your-secret-key
```

### Configuration API

**Important** : Modifiez `pako-client/constants/api.js` avec votre adresse IP Wi-Fi :

```javascript
const getBaseURL = () => {
  if (__DEV__) {
    return 'http://192.168.1.5:3000'; // ← Remplacez par VOTRE IP
  }
  return 'https://api.pako.com';
};
```

**Comment trouver votre IP :**
- Windows : `ipconfig` → Adresse IPv4 de la carte Wi-Fi
- Mac/Linux : `ifconfig` → inet de la carte Wi-Fi

## ⚠️ Résolution des Problèmes de Connexion

Si vous rencontrez l'erreur **"Network Error"** lors du login :

1. **Vérifiez que le backend est démarré** :
   ```bash
   cd "BACK END"
   npm run start:dev
   ```

2. **Vérifiez l'adresse IP** dans `pako-client/constants/api.js`

3. **Assurez-vous d'être sur le même réseau Wi-Fi** que votre machine

4. **Pour plus de détails**, consultez le fichier `pako-client/TROUBLESHOOTING.md`

## 📝 Documentation API

Une fois le backend démarré, la documentation Swagger est disponible sur :
`http://localhost:3000/api`

## 🚀 Déploiement

### Backend
```bash
cd "BACK END"
npm run build
npm run start:prod
```

### Frontend
```bash
cd pako-client
expo build:android
expo build:ios
```

## 👥 Équipe de Développement

- **Nassere Yacouba** - Développeur Full Stack

## 📄 Licence

Ce projet est sous licence MIT.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou support, contactez l'équipe de développement.
