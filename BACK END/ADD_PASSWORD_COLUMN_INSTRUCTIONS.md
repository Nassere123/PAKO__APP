# Instructions pour ajouter la colonne password

## Problème
L'utilisateur `pako_user` n'a pas les permissions pour modifier la structure de la table `users`. Il faut utiliser un compte administrateur PostgreSQL.

## Solution

### Option 1 : Via pgAdmin ou un client PostgreSQL

1. Connectez-vous à PostgreSQL avec un compte administrateur (généralement `postgres`)
2. Exécutez cette commande SQL :

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NULL;
```

### Option 2 : Via la ligne de commande (si psql est installé)

```bash
# Se connecter en tant qu'administrateur PostgreSQL
psql -U postgres -d pako_db

# Puis exécuter :
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NULL;
\q
```

### Option 3 : Donner les permissions à pako_user

Si vous préférez que `pako_user` puisse modifier la table :

```sql
-- Se connecter en tant qu'administrateur
psql -U postgres -d pako_db

-- Donner les permissions
ALTER TABLE users OWNER TO pako_user;
-- OU
GRANT ALL PRIVILEGES ON TABLE users TO pako_user;
```

## Après avoir ajouté la colonne

Une fois la colonne ajoutée, vous pouvez exécuter le script de création d'utilisateurs :

```bash
cd BACK END
npx ts-node src/database/create-test-workers.ts
```

