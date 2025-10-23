-- Script pour adapter la table users au système d'authentification OTP
-- Suppression du mot de passe et ajout des champs OTP

-- Supprimer la colonne password (si elle existe)
ALTER TABLE users DROP COLUMN IF EXISTS password;

-- Renommer les colonnes existantes pour le système OTP
ALTER TABLE users RENAME COLUMN verificationCode TO otpCode;
ALTER TABLE users RENAME COLUMN verificationCodeExpires TO otpExpires;

-- Ajouter les nouvelles colonnes pour le système OTP
ALTER TABLE users ADD COLUMN IF NOT EXISTS otpAttempts INTEGER DEFAULT 3;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lastOtpAttempt TIMESTAMP;

-- Mettre à jour les contraintes
ALTER TABLE users ALTER COLUMN otpCode TYPE VARCHAR(6);
ALTER TABLE users ALTER COLUMN otpExpires TYPE TIMESTAMP;

-- Ajouter des index pour optimiser les requêtes OTP
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_otp_code ON users(otpCode) WHERE otpCode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(isVerified);

-- Afficher la structure mise à jour
SELECT 'Table users mise à jour pour le système OTP' as message;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
