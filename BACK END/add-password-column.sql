-- Script SQL pour ajouter la colonne password à la table users
-- Exécutez ce script dans votre base de données PostgreSQL

-- Ajouter la colonne password (nullable car les clients n'ont pas de mot de passe)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password VARCHAR(255) NULL;

-- Commentaire sur la colonne
COMMENT ON COLUMN users.password IS 'Mot de passe hashé (pour les travailleurs uniquement)';

-- Index pour améliorer les performances de recherche (optionnel)
-- CREATE INDEX IF NOT EXISTS idx_users_password ON users(password) WHERE password IS NOT NULL;

