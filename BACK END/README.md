# PAKO Backend - API de Livraison Optimisée

Backend API pour l'application PAKO, service de livraison rapide et fiable avec optimisations avancées de base de données.

## 🚀 Technologies Utilisées

- **NestJS** - Framework Node.js progressif
- **PostgreSQL** - Base de données relationnelle avec optimisations
- **TypeORM** - ORM pour TypeScript et JavaScript
- **pg-pool** - Pool de connexions PostgreSQL avancé
- **JWT** - Authentification par tokens
- **Swagger** - Documentation API interactive
- **bcryptjs** - Hachage des mots de passe
- **@nestjs/schedule** - Tâches programmées pour le monitoring

## 📋 Fonctionnalités

### 🔐 Authentification
- Envoi de codes de vérification SMS
- Vérification des codes
- Inscription et connexion des utilisateurs
- Gestion des tokens JWT

### 👥 Gestion des Utilisateurs
- Création et gestion des comptes utilisateurs
- Profils utilisateurs complets
- Types d'utilisateurs : Client, Chauffeur, Admin

### 📦 Gestion des Commandes
- Création de commandes
- Suivi des commandes en temps réel
- Gestion des statuts
- Calcul automatique des prix

### 🚚 Gestion des Chauffeurs
- Enregistrement des chauffeurs
- Gestion des véhicules
- Suivi de localisation
- Système de notation

### 📍 Gestion des Stations
- Stations de prise et livraison
- Gestion des horaires
- Capacités de stockage

### 🔔 Notifications
- SMS de vérification
- Notifications push
- Emails de confirmation

### 💳 Paiements
- Intégration Wave
- Intégration Orange Money
- Vérification des transactions

### 📊 Administration
- Tableau de bord admin
- Statistiques en temps réel
- Gestion des utilisateurs et commandes

### 🗄️ Optimisations Base de Données
- **Pool de connexions avancé** - Gestion optimisée des connexions PostgreSQL
- **Monitoring en temps réel** - Surveillance des performances et santé de la DB
- **Optimisation des requêtes** - Cache, index, et requêtes optimisées
- **Migrations automatisées** - Schéma optimisé avec index et contraintes
- **Vues matérialisées** - Statistiques pré-calculées pour de meilleures performances
- **Fonctions PostgreSQL** - Calculs complexes optimisés côté base
- **Alertes automatiques** - Détection proactive des problèmes de performance

## 🛠️ Installation

### Prérequis
- Node.js (v18+)
- PostgreSQL (v12+)
- npm ou yarn

### Configuration

1. **Cloner le projet**
```bash
git clone <repository-url>
cd BACK\ END
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer la base de données**
```bash
# Créer la base de données PostgreSQL
createdb pako_db

# Créer l'utilisateur
psql -c "CREATE USER pako_user WITH PASSWORD 'pako_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE pako_db TO pako_user;"
```

4. **Configurer les variables d'environnement**
```bash
cp env.example .env
# Éditer le fichier .env avec vos configurations
```

5. **Démarrer l'application**
```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

## 📚 API Documentation

Une fois l'application démarrée, la documentation Swagger est disponible à :
- **URL** : http://localhost:3000/api
- **Interface interactive** pour tester les endpoints

## 🗄️ Structure de la Base de Données

### Tables Principales

- **users** - Utilisateurs du système
- **drivers** - Chauffeurs et leurs véhicules
- **orders** - Commandes de livraison
- **packages** - Colis individuels
- **stations** - Stations de prise/livraison

### Relations

- Un utilisateur peut avoir plusieurs commandes
- Une commande peut avoir plusieurs colis
- Un chauffeur peut traiter plusieurs commandes
- Les stations sont liées aux adresses de prise/livraison

## 🔧 Scripts Disponibles

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start:prod

# Tests
npm run test
npm run test:e2e

# Base de données
npm run db:generate    # Générer une migration
npm run db:run        # Exécuter les migrations
npm run db:revert     # Annuler la dernière migration
npm run db:seed       # Peupler la base avec des données de test
```

## 🌐 Endpoints Principaux

### Authentification
- `POST /auth/send-verification-code` - Envoyer code SMS
- `POST /auth/verify-code` - Vérifier code SMS
- `POST /auth/register` - S'inscrire
- `POST /auth/login` - Se connecter

### Utilisateurs
- `GET /users` - Liste des utilisateurs
- `GET /users/:id` - Détails d'un utilisateur
- `PATCH /users/:id` - Modifier un utilisateur

### Commandes
- `GET /orders` - Liste des commandes
- `POST /orders` - Créer une commande
- `GET /orders/:id` - Détails d'une commande
- `PATCH /orders/:id/status` - Mettre à jour le statut

### Chauffeurs
- `GET /drivers` - Liste des chauffeurs
- `GET /drivers/available` - Chauffeurs disponibles
- `POST /drivers` - Enregistrer un chauffeur
- `PATCH /drivers/:id/location` - Mettre à jour la localisation

### Colis
- `GET /packages` - Liste des colis
- `GET /packages/track/:code` - Suivre un colis
- `POST /packages` - Créer un colis

### Administration
- `GET /admin/dashboard` - Statistiques du tableau de bord
- `GET /admin/recent-orders` - Commandes récentes
- `GET /admin/top-drivers` - Meilleurs chauffeurs

### Base de Données & Monitoring
- `GET /database/health` - Santé de la base de données
- `GET /database/pool/stats` - Statistiques du pool de connexions
- `GET /database/performance` - Métriques de performance
- `GET /database/queries/stats` - Statistiques des requêtes
- `GET /database/queries/slow` - Requêtes lentes
- `GET /database/queries/failed` - Requêtes échouées
- `GET /database/monitoring/metrics` - Métriques de monitoring
- `GET /database/monitoring/performance-report` - Rapport de performance
- `GET /database/monitoring/database-stats` - Statistiques détaillées

## 🔒 Sécurité

- Authentification JWT
- Hachage des mots de passe avec bcrypt
- Validation des données d'entrée
- CORS configuré
- Variables d'environnement pour les secrets

## 📱 Intégrations

### SMS
- Envoi de codes de vérification
- Notifications de statut

### Paiements
- Wave (mobile money)
- Orange Money

### Notifications
- Push notifications
- Emails de confirmation

## 🚀 Déploiement

### Variables d'Environnement Requises

```env
# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=pako_user
DB_PASSWORD=pako_password
DB_NAME=pako_db

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# APIs externes
SMS_API_KEY=your-sms-key
WAVE_API_KEY=your-wave-key
ORANGE_MONEY_API_KEY=your-orange-key
```

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur le repository
- Contacter l'équipe de développement

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

---

**PAKO** - Livraison rapide et fiable 🚚
