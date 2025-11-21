-- Script SQL pour ajouter les colonnes manquantes a la table packages
-- A executer avec un compte administrateur PostgreSQL

-- Ajouter assignedDriverId si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'packages' AND column_name = 'assignedDriverId'
    ) THEN
        ALTER TABLE packages ADD COLUMN "assignedDriverId" UUID;
        RAISE NOTICE 'Colonne assignedDriverId ajoutee';
    ELSE
        RAISE NOTICE 'Colonne assignedDriverId existe deja';
    END IF;
END $$;

-- Ajouter assignedDriverName si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'packages' AND column_name = 'assignedDriverName'
    ) THEN
        ALTER TABLE packages ADD COLUMN "assignedDriverName" VARCHAR(255);
        RAISE NOTICE 'Colonne assignedDriverName ajoutee';
    ELSE
        RAISE NOTICE 'Colonne assignedDriverName existe deja';
    END IF;
END $$;

-- Ajouter assignedAt si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'packages' AND column_name = 'assignedAt'
    ) THEN
        ALTER TABLE packages ADD COLUMN "assignedAt" TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Colonne assignedAt ajoutee';
    ELSE
        RAISE NOTICE 'Colonne assignedAt existe deja';
    END IF;
END $$;

-- Ajouter packageCode si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'packages' AND column_name = 'packageCode'
    ) THEN
        ALTER TABLE packages ADD COLUMN "packageCode" VARCHAR(50);
        RAISE NOTICE 'Colonne packageCode ajoutee';
    ELSE
        RAISE NOTICE 'Colonne packageCode existe deja';
    END IF;
END $$;

-- Ajouter la contrainte de cle etrangere pour assignedDriverId si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'FK_packages_assignedDriver'
    ) THEN
        ALTER TABLE packages 
        ADD CONSTRAINT "FK_packages_assignedDriver" 
        FOREIGN KEY ("assignedDriverId") REFERENCES drivers(id) ON DELETE SET NULL;
        RAISE NOTICE 'Contrainte FK_packages_assignedDriver ajoutee';
    ELSE
        RAISE NOTICE 'Contrainte FK_packages_assignedDriver existe deja';
    END IF;
END $$;

-- Creer un index sur assignedDriverId pour ameliorer les performances
CREATE INDEX IF NOT EXISTS "IDX_packages_assignedDriverId" 
ON packages ("assignedDriverId") 
WHERE "assignedDriverId" IS NOT NULL;

-- Ajouter une contrainte UNIQUE sur packageCode si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'UQ_packages_packageCode'
    ) THEN
        CREATE UNIQUE INDEX IF NOT EXISTS "UQ_packages_packageCode" 
        ON packages ("packageCode") 
        WHERE "packageCode" IS NOT NULL;
        RAISE NOTICE 'Index unique sur packageCode cree';
    ELSE
        RAISE NOTICE 'Index unique sur packageCode existe deja';
    END IF;
END $$;
