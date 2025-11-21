-- Script SQL pour mettre à jour l'enum packages_status_enum
-- À exécuter avec un compte administrateur PostgreSQL

-- Vérifier les valeurs actuelles de l'enum
SELECT unnest(enum_range(NULL::packages_status_enum)) AS current_values;

-- Ajouter les valeurs manquantes à l'enum si elles n'existent pas
DO $$
BEGIN
    -- Ajouter 'ready_for_delivery' si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'ready_for_delivery' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'packages_status_enum')
    ) THEN
        ALTER TYPE packages_status_enum ADD VALUE 'ready_for_delivery';
        RAISE NOTICE 'Valeur ready_for_delivery ajoutee a l''enum';
    ELSE
        RAISE NOTICE 'Valeur ready_for_delivery existe deja';
    END IF;

    -- Ajouter 'assigned' si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'assigned' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'packages_status_enum')
    ) THEN
        ALTER TYPE packages_status_enum ADD VALUE 'assigned';
        RAISE NOTICE 'Valeur assigned ajoutee a l''enum';
    ELSE
        RAISE NOTICE 'Valeur assigned existe deja';
    END IF;

    -- Ajouter 'in_delivery' si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'in_delivery' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'packages_status_enum')
    ) THEN
        ALTER TYPE packages_status_enum ADD VALUE 'in_delivery';
        RAISE NOTICE 'Valeur in_delivery ajoutee a l''enum';
    ELSE
        RAISE NOTICE 'Valeur in_delivery existe deja';
    END IF;

    -- Ajouter 'verified' si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'verified' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'packages_status_enum')
    ) THEN
        ALTER TYPE packages_status_enum ADD VALUE 'verified';
        RAISE NOTICE 'Valeur verified ajoutee a l''enum';
    ELSE
        RAISE NOTICE 'Valeur verified existe deja';
    END IF;

    -- Ajouter 'received' si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'received' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'packages_status_enum')
    ) THEN
        ALTER TYPE packages_status_enum ADD VALUE 'received';
        RAISE NOTICE 'Valeur received ajoutee a l''enum';
    ELSE
        RAISE NOTICE 'Valeur received existe deja';
    END IF;

    -- Ajouter 'delivered' si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'delivered' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'packages_status_enum')
    ) THEN
        ALTER TYPE packages_status_enum ADD VALUE 'delivered';
        RAISE NOTICE 'Valeur delivered ajoutee a l''enum';
    ELSE
        RAISE NOTICE 'Valeur delivered existe deja';
    END IF;

    -- Ajouter 'cancelled' si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'cancelled' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'packages_status_enum')
    ) THEN
        ALTER TYPE packages_status_enum ADD VALUE 'cancelled';
        RAISE NOTICE 'Valeur cancelled ajoutee a l''enum';
    ELSE
        RAISE NOTICE 'Valeur cancelled existe deja';
    END IF;
END $$;

