# Configuration de l'authentification pour PAKO PRO

## Résumé des modifications

### Backend

1. **Entité User** : Ajout du champ `password` (nullable)
2. **DTOs créés** :
   - `CreateWorkerDto` : Pour créer des travailleurs avec mot de passe
   - `LoginWorkerDto` : Pour la connexion avec phone + password
3. **Endpoints API** :
   - `POST /auth/create-worker` : Créer un travailleur (admin uniquement)
   - `POST /auth/login-worker` : Connexion d'un travailleur avec mot de passe
4. **Service AuthService** :
   - `createWorker()` : Crée un travailleur avec mot de passe hashé
   - `loginWorker()` : Authentifie un travailleur avec phone + password

### Frontend (PAKO PRO)

1. **AuthContext** : Mis à jour pour utiliser l'API réelle
2. **authService** : Ajout de la méthode `loginWorker()`
3. **Authentification** : Utilise maintenant phone + password au lieu de données mockées

## Installation

### 1. Ajouter la colonne password à la base de données

Exécutez le script SQL :

```bash
psql -U pako_user -d pako_db -f add-password-column.sql
```

Ou directement dans psql :

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NULL;
```

### 2. Créer des utilisateurs de test

```bash
cd BACK END
ts-node src/database/create-test-workers.ts
```

### 3. Tester la connexion

Dans PAKO PRO, utilisez les identifiants créés :

**Livreur :**
- Téléphone: `+2250701234567`
- Mot de passe: `Livreur123!`

**Agent :**
- Téléphone: `+2250501234567`
- Mot de passe: `Agent123!`

## Utilisation

### Créer un travailleur via API (Admin)

```bash
curl -X POST http://localhost:3000/auth/create-worker \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Kouassi",
    "phone": "+2250709999999",
    "password": "MotDePasse123!",
    "userType": "driver",
    "email": "jean.kouassi@pako.ci"
  }'
```

### Connexion d'un travailleur

```bash
curl -X POST http://localhost:3000/auth/login-worker \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+2250701234567",
    "password": "Livreur123!"
  }'
```

## Notes importantes

- Les mots de passe sont hashés avec bcrypt (10 rounds)
- Seuls les travailleurs (livreurs et agents) ont des mots de passe
- Les clients continuent d'utiliser l'authentification par OTP
- Le token JWT est automatiquement sauvegardé dans AsyncStorage après connexion

