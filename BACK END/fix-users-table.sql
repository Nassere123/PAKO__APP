-- Script pour corriger la table users avec les bons noms de colonnes

-- Renommer les colonnes existantes
ALTER TABLE users RENAME COLUMN "verificationCode" TO "otpCode";
ALTER TABLE users RENAME COLUMN "verificationCodeExpires" TO "otpExpires";

-- Modifier les types de colonnes
ALTER TABLE users ALTER COLUMN "otpCode" TYPE VARCHAR(6);
ALTER TABLE users ALTER COLUMN "otpExpires" TYPE TIMESTAMP;

-- Créer les index pour optimiser les requêtes OTP
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_otp_code ON users("otpCode") WHERE "otpCode" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users("isVerified");

-- Afficher la structure finale
SELECT 'Table users mise à jour avec succès' as message;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
