-- Migration pour ajouter le suivi des connexions/déconnexions
-- Date: $(date)
-- Description: Ajoute les colonnes isOnline, lastLoginAt et lastLogoutAt à la table users

-- Ajouter les nouvelles colonnes
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "isOnline" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS "lastLogoutAt" TIMESTAMP NULL;

-- Mettre à jour les utilisateurs existants (par défaut déconnectés)
UPDATE users 
SET "isOnline" = FALSE 
WHERE "isOnline" IS NULL;

-- Créer un index pour optimiser les requêtes sur le statut de connexion
CREATE INDEX IF NOT EXISTS idx_users_isonline ON users("isOnline");
CREATE INDEX IF NOT EXISTS idx_users_lastloginat ON users("lastLoginAt");

-- Afficher le statut des colonnes ajoutées
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('isOnline', 'lastLoginAt', 'lastLogoutAt')
ORDER BY ordinal_position;

-- Afficher un résumé des utilisateurs
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN "isOnline" = TRUE THEN 1 END) as connected_users,
    COUNT(CASE WHEN "isOnline" = FALSE THEN 1 END) as disconnected_users
FROM users 
WHERE status = 'active';

PRINT 'Migration terminée: Colonnes de suivi des connexions ajoutées avec succès!';
