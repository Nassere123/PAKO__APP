-- Script SQL pour migrer les livreurs de users vers drivers
-- À exécuter avec un compte administrateur PostgreSQL

-- 1. Rendre les colonnes obsolètes nullable (car on n'en a plus besoin avec la nouvelle structure)
ALTER TABLE drivers ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE drivers ALTER COLUMN "vehicleType" DROP NOT NULL;
ALTER TABLE drivers ALTER COLUMN "vehicleBrand" DROP NOT NULL;
ALTER TABLE drivers ALTER COLUMN "vehicleModel" DROP NOT NULL;
ALTER TABLE drivers ALTER COLUMN "plateNumber" DROP NOT NULL;
ALTER TABLE drivers ALTER COLUMN "vehicleColor" DROP NOT NULL;
ALTER TABLE drivers ALTER COLUMN "maxLoadCapacity" DROP NOT NULL;

-- 2. Ajouter les nouvelles colonnes à la table drivers si elles n'existent pas
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(100);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS "lastName" VARCHAR(100);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS "isOnline" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS "lastLogoutAt" TIMESTAMP;

-- 3. Créer un index unique sur phone
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_drivers_phone_unique" 
ON drivers (phone) WHERE phone IS NOT NULL;

-- 4. Migrer les données de users vers drivers
-- Pour chaque livreur dans users, créer une entrée dans drivers
INSERT INTO drivers (
  "firstName", "lastName", phone, email, password,
  "licenseNumber", status, "isOnline", "isActive",
  "vehicleType", "vehicleBrand", "vehicleModel", "plateNumber", "vehicleColor", "maxLoadCapacity",
  "createdAt", "updatedAt"
)
SELECT 
  u."firstName",
  u."lastName",
  u.phone,
  u.email,
  u.password,
  'LIC-' || SUBSTRING(u.phone, LENGTH(u.phone) - 7) AS "licenseNumber",
  'offline' AS status,
  false AS "isOnline",
  true AS "isActive",
  'motorcycle' AS "vehicleType",
  'Non spécifié' AS "vehicleBrand",
  'Non spécifié' AS "vehicleModel",
  'PLATE-' || SUBSTRING(u.phone, LENGTH(u.phone) - 7) AS "plateNumber",
  'Non spécifié' AS "vehicleColor",
  50.00 AS "maxLoadCapacity",
  u."createdAt",
  u."updatedAt"
FROM users u
WHERE u."userType" = 'driver'
AND NOT EXISTS (
  SELECT 1 FROM drivers d WHERE d.phone = u.phone
);

-- 5. Mettre à jour les références dans orders pour pointer vers drivers au lieu de users
-- Si orders a un driverId qui référence users, on doit le mettre à jour
-- Note: Cette étape peut être ignorée si orders référence déjà drivers directement

-- Option 1: Marquer les livreurs comme migrés dans users (recommandé pour préserver les références)
-- On change leur userType pour éviter qu'ils soient traités comme des livreurs
UPDATE users SET "userType" = 'customer' WHERE "userType" = 'driver';

-- Option 2: Si vous voulez vraiment supprimer les livreurs de users (nécessite de mettre à jour orders d'abord)
-- Étape 1: Mettre à jour orders pour référencer drivers au lieu de users
-- UPDATE orders o
-- SET "driverId" = d.id
-- FROM drivers d
-- WHERE o."driverId" = (SELECT id FROM users WHERE phone = d.phone AND "userType" = 'driver')
-- AND EXISTS (SELECT 1 FROM users u WHERE u.id = o."driverId" AND u."userType" = 'driver');
-- 
-- Étape 2: Supprimer la contrainte de clé étrangère si elle existe
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS "FK_e5de51ca888d8b1f5ac25799dd1";
-- 
-- Étape 3: Supprimer les livreurs de users
-- DELETE FROM users WHERE "userType" = 'driver';

-- Vérification
SELECT COUNT(*) as "Livreurs migrés dans drivers" FROM drivers WHERE phone IS NOT NULL;
SELECT COUNT(*) as "Livreurs restants dans users (userType=driver)" FROM users WHERE "userType" = 'driver';
SELECT COUNT(*) as "Anciens livreurs marqués comme customers" FROM users WHERE "userType" = 'customer' AND id IN (SELECT id FROM users WHERE phone IN (SELECT phone FROM drivers));

