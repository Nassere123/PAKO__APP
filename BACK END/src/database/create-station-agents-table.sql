-- Créer la table station_agents
CREATE TABLE IF NOT EXISTS station_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "firstName" VARCHAR(100) NOT NULL,
  "lastName" VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  "stationId" VARCHAR(100) NOT NULL,
  "stationName" VARCHAR(255) NOT NULL,
  "isOnline" BOOLEAN NOT NULL DEFAULT false,
  "lastLoginAt" TIMESTAMP,
  "lastLogoutAt" TIMESTAMP,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMP
);

-- Créer les index pour station_agents
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_station_agents_phone" ON station_agents (phone) WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "IDX_station_agents_stationId" ON station_agents ("stationId");
CREATE INDEX IF NOT EXISTS "IDX_station_agents_isOnline" ON station_agents ("isOnline");
CREATE INDEX IF NOT EXISTS "IDX_station_agents_isActive" ON station_agents ("isActive");

-- Mettre à jour la table drivers si elle existe déjà avec l'ancienne structure
-- Ajouter les nouvelles colonnes si elles n'existent pas
DO $$
BEGIN
  -- Ajouter firstName si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'firstName') THEN
    ALTER TABLE drivers ADD COLUMN "firstName" VARCHAR(100);
  END IF;
  
  -- Ajouter lastName si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'lastName') THEN
    ALTER TABLE drivers ADD COLUMN "lastName" VARCHAR(100);
  END IF;
  
  -- Ajouter phone si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'phone') THEN
    ALTER TABLE drivers ADD COLUMN phone VARCHAR(20) UNIQUE;
  END IF;
  
  -- Ajouter email si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'email') THEN
    ALTER TABLE drivers ADD COLUMN email VARCHAR(255);
  END IF;
  
  -- Ajouter password si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'password') THEN
    ALTER TABLE drivers ADD COLUMN password VARCHAR(255);
  END IF;
  
  -- Ajouter isOnline si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'isOnline') THEN
    ALTER TABLE drivers ADD COLUMN "isOnline" BOOLEAN NOT NULL DEFAULT false;
  END IF;
  
  -- Ajouter lastLoginAt si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'lastLoginAt') THEN
    ALTER TABLE drivers ADD COLUMN "lastLoginAt" TIMESTAMP;
  END IF;
  
  -- Ajouter lastLogoutAt si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'drivers' AND column_name = 'lastLogoutAt') THEN
    ALTER TABLE drivers ADD COLUMN "lastLogoutAt" TIMESTAMP;
  END IF;
END $$;

-- Créer les index pour drivers si nécessaire
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_drivers_phone" ON drivers (phone) WHERE "deletedAt" IS NULL AND phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_drivers_isOnline" ON drivers ("isOnline");
CREATE INDEX IF NOT EXISTS "IDX_drivers_available" ON drivers ("isOnline", "isActive") WHERE "isOnline" = true AND "isActive" = true;

