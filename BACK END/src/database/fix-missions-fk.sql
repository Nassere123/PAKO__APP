-- Script SQL pour corriger la contrainte de clé étrangère de missions
-- À exécuter avec un compte administrateur PostgreSQL

-- Supprimer l'ancienne contrainte si elle existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'FK_46ee457cda5c08b4e0fcdd07e9a'
        OR constraint_name = 'FK_missions_deliveryPerson'
    ) THEN
        ALTER TABLE missions DROP CONSTRAINT IF EXISTS "FK_46ee457cda5c08b4e0fcdd07e9a";
        ALTER TABLE missions DROP CONSTRAINT IF EXISTS "FK_missions_deliveryPerson";
        RAISE NOTICE 'Anciennes contraintes supprimees';
    END IF;
END $$;

-- Recréer la contrainte avec la bonne référence (drivers au lieu de delivery_persons)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'FK_missions_deliveryPerson'
    ) THEN
        ALTER TABLE missions 
        ADD CONSTRAINT "FK_missions_deliveryPerson" 
        FOREIGN KEY ("deliveryPersonId") REFERENCES drivers(id) ON DELETE SET NULL;
        RAISE NOTICE 'Contrainte FK_missions_deliveryPerson recreee avec reference vers drivers';
    ELSE
        RAISE NOTICE 'Contrainte FK_missions_deliveryPerson existe deja';
    END IF;
END $$;

