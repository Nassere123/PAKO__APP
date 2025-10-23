-- Script de configuration PostgreSQL pour PAKO
-- Exécuter ce script en tant qu'utilisateur postgres

-- Créer l'utilisateur pako_user
CREATE USER pako_user WITH PASSWORD 'pako_password';

-- Créer la base de données pako_db
CREATE DATABASE pako_db OWNER pako_user;

-- Se connecter à la base pako_db
\c pako_db

-- Donner tous les privilèges à l'utilisateur
GRANT ALL PRIVILEGES ON DATABASE pako_db TO pako_user;
GRANT ALL ON SCHEMA public TO pako_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pako_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pako_user;

-- Configurer les privilèges par défaut
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pako_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pako_user;

-- Créer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Afficher les informations de connexion
SELECT 'Configuration PostgreSQL terminée !' as message;
SELECT 'Base de données: pako_db' as database;
SELECT 'Utilisateur: pako_user' as username;
SELECT 'Mot de passe: pako_password' as password;
