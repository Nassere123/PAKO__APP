# 🚀 Guide d'Intégration PAKO - Processus de Commande de Colis

## 📋 **Vue d'ensemble**

Le système PAKO est maintenant configuré avec un processus complet de commande de colis qui communique entre le frontend React Native et le backend NestJS.

## 🔧 **Configuration Requise**

### **1. Base de Données PostgreSQL**

#### **Installation PostgreSQL :**
```bash
# Télécharger et installer PostgreSQL depuis :
# https://www.postgresql.org/download/windows/
```

#### **Configuration de la base de données :**
```bash
# 1. Se connecter à PostgreSQL
psql -U postgres

# 2. Exécuter le script de configuration
\i BACK END/setup-postgresql.sql

# 3. Vérifier la configuration
psql -U pako_user -d pako_db
```

### **2. Configuration Backend**

#### **Variables d'environnement :**
Créez un fichier `.env` dans le dossier `BACK END/` avec :
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=pako_user
DB_PASSWORD=pako_password
DB_NAME=pako_db
JWT_SECRET=your-super-secret-jwt-key-here-pako-2024
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000,http://localhost:19006,http://192.168.1.17:3000,http://192.168.1.17:19006
CORS_CREDENTIALS=true
```

#### **Démarrage du backend :**
```bash
cd "BACK END"
npm install
npm run start:dev
```

### **3. Configuration Frontend**

#### **Configuration de l'API :**
Le fichier `pako-client/constants/api.js` est configuré pour pointer vers `http://192.168.1.17:3000`.

#### **Démarrage du frontend :**
```bash
cd pako-client
npm install
npx expo start
```

## 🔄 **Flux de Commande Complet**

### **1. Processus Frontend → Backend**

#### **Étape 1 : L'utilisateur clique sur "Recevoir mon colis"**
- Navigation vers `MultiStepPackageRegistrationScreen`
- Formulaire multi-étapes pour saisir les informations

#### **Étape 2 : Saisie des informations**
- **Informations expéditeur :** nom, téléphone, ville, quartier
- **Informations destinataire :** nom, téléphone, adresse de livraison
- **Détails des colis :** code, description, type, instructions spéciales
- **Options de livraison :** type (standard/express), méthode de paiement

#### **Étape 3 : Validation et envoi**
- Calcul automatique du prix (base + distance + poids)
- Validation des données
- Envoi vers l'endpoint `/orders/with-packages`

### **2. Traitement Backend**

#### **Endpoint :** `POST /orders/with-packages`
```typescript
// Données reçues
{
  customerId: string,
  senderName: string,
  senderPhone: string,
  // ... autres champs
  packages: Array<{
    packageCode: string,
    description: string,
    packageType: string,
    // ... autres champs
  }>
}
```

#### **Processus de création :**
1. **Validation des données** avec class-validator
2. **Génération d'un numéro de commande unique** (format: #PAKO-YYYYMMDD-XXX)
3. **Création de la commande** dans la table `orders`
4. **Création des colis** dans la table `packages`
5. **Calcul du poids total** et mise à jour de la commande
6. **Retour de la commande complète** avec ses colis

### **3. Réponse et Suivi**

#### **Réponse de l'API :**
```typescript
{
  id: string,
  orderNumber: string,
  status: 'pending',
  totalPrice: number,
  packages: Array<{
    id: string,
    packageCode: string,
    status: 'pending',
    // ... autres champs
  }>
}
```

#### **Endpoints de suivi disponibles :**
- `GET /orders/customer/:customerId` - Commandes d'un client
- `GET /orders/:id` - Détails d'une commande
- `GET /packages/code/:packageCode` - Suivi d'un colis
- `PATCH /orders/:id/status` - Mise à jour du statut

## 🧪 **Tests d'Intégration**

### **Script de test automatique :**
```bash
# Exécuter le script de test
node test-integration.js
```

### **Tests manuels :**

#### **1. Test de création de commande :**
```bash
curl -X POST http://192.168.1.17:3000/orders/with-packages \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test-123",
    "senderName": "Jean Dupont",
    "senderPhone": "+225071234567",
    "senderCity": "Abidjan",
    "receiverName": "Marie Kouassi",
    "receiverPhone": "+225076543210",
    "deliveryAddress": "Cocody, Riviera 2",
    "destinationStation": "Gare de Cocody",
    "deliveryType": "standard",
    "paymentMethod": "cash",
    "packages": [
      {
        "packageCode": "PKG001",
        "description": "Colis test",
        "packageType": "standard"
      }
    ]
  }'
```

#### **2. Test de récupération des commandes :**
```bash
curl -X GET http://192.168.1.17:3000/orders/customer/test-123
```

## 📱 **Interface Utilisateur**

### **Écrans impliqués :**
1. **HomeScreen** - Bouton "Recevoir mon colis"
2. **MultiStepPackageRegistrationScreen** - Processus de commande
3. **PackageTrackingScreen** - Suivi des colis
4. **MyPackagesScreen** - Historique des commandes

### **Services frontend :**
- **OrderService** - Communication avec l'API des commandes
- **PackageService** - Gestion des colis
- **AuthService** - Authentification utilisateur

## 🔍 **Monitoring et Logs**

### **Logs backend :**
Le service `OrdersService.createOrderWithPackages()` affiche des logs détaillés :
```
🚀 ===== NOUVELLE COMMANDE REÇUE =====
📋 Données de la commande:
   👤 Client ID: test-123
   📦 Nombre de colis: 2
   🚚 Type de livraison: standard
   💳 Méthode de paiement: cash
   💰 Prix total: 2500 FCFA
```

### **Endpoints de monitoring :**
- `GET /api` - Documentation Swagger
- `GET /database/health` - État de la base de données
- `GET /database/stats` - Statistiques de performance

## 🚨 **Dépannage**

### **Erreurs courantes :**

#### **1. Erreur 500 - Base de données non connectée**
```bash
# Vérifier que PostgreSQL est démarré
# Vérifier les credentials dans .env
# Exécuter le script de configuration
```

#### **2. Erreur CORS**
```bash
# Vérifier que l'IP est dans CORS_ORIGIN
# Redémarrer le serveur backend
```

#### **3. Erreur de connexion frontend**
```bash
# Vérifier l'IP dans constants/api.js
# S'assurer que le backend est démarré
# Tester avec curl ou Postman
```

## ✅ **Vérification Finale**

Une fois configuré, vous devriez pouvoir :

1. ✅ **Démarrer le backend** sur `http://192.168.1.17:3000`
2. ✅ **Démarrer le frontend** avec Expo
3. ✅ **Créer une commande** via l'interface
4. ✅ **Voir la commande** dans la base de données
5. ✅ **Suivre le colis** avec le code de suivi
6. ✅ **Recevoir les notifications** de statut

## 🎯 **Prochaines Étapes**

1. **Configuration de la base de données PostgreSQL**
2. **Test de l'intégration complète**
3. **Ajout de fonctionnalités avancées** (notifications, paiements)
4. **Déploiement en production**

---

**🎉 Félicitations !** Votre système PAKO est maintenant prêt pour gérer les commandes de colis de bout en bout !
