# 🗄️ Configuration de la Base de Données PostgreSQL

## 📋 **Étapes pour configurer PostgreSQL**

### **1. Installer PostgreSQL (si pas déjà fait)**
- Télécharger depuis : https://www.postgresql.org/download/
- Installer avec l'utilisateur `postgres` et un mot de passe

### **2. Exécuter le script de configuration**

#### **Option A : Via psql (Recommandé)**
```bash
# Se connecter à PostgreSQL
psql -U postgres

# Exécuter le script
\i setup-postgresql.sql
```

#### **Option B : Via pgAdmin**
1. Ouvrir pgAdmin
2. Se connecter au serveur PostgreSQL
3. Exécuter le contenu du fichier `setup-postgresql.sql`

#### **Option C : Via ligne de commande**
```bash
psql -U postgres -f setup-postgresql.sql
```

### **3. Vérifier la configuration**
```sql
-- Se connecter avec l'utilisateur pako_user
psql -U pako_user -d pako_db

-- Vérifier les extensions
SELECT * FROM pg_extension;

-- Vérifier les privilèges
\dp
```

### **4. Tester la connexion depuis le backend**
```bash
# Tester la connexion
npm run db:test

# Initialiser la base de données
npm run db:init

# Ajouter des données de test
npm run db:seed
```

## 🔧 **Configuration Alternative**

Si vous préférez utiliser l'utilisateur `postgres` par défaut :

1. **Modifier le fichier `.env` :**
```env
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe_postgres
```

2. **Créer seulement la base de données :**
```sql
CREATE DATABASE pako_db;
```

## 🚨 **Dépannage**

### **Erreur d'authentification**
- Vérifiez que l'utilisateur existe
- Vérifiez le mot de passe
- Vérifiez que PostgreSQL est démarré

### **Erreur de permissions**
- Exécutez le script en tant qu'utilisateur `postgres`
- Vérifiez que l'utilisateur a les bonnes permissions

### **Erreur de connexion**
- Vérifiez que PostgreSQL écoute sur le port 5432
- Vérifiez les paramètres dans le fichier `.env`

## 📊 **Scripts Disponibles**

```bash
# Tester la connexion
npm run db:test

# Initialiser la base de données
npm run db:init

# Ajouter des données de test
npm run db:seed

# Configuration complète
npm run db:setup
```

## ✅ **Vérification Finale**

Une fois configuré, vous devriez pouvoir :
1. ✅ Se connecter à la base `pako_db`
2. ✅ Créer des tables
3. ✅ Insérer des données
4. ✅ Utiliser les extensions PostgreSQL
5. ✅ Accéder aux endpoints de monitoring
