-- Script SQL pour vérifier et corriger la structure de la table missions
-- À exécuter avec un compte administrateur PostgreSQL

-- Vérifier si la colonne packageId existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'missions' AND column_name = 'packageId'
    ) THEN
        ALTER TABLE missions ADD COLUMN "packageId" UUID NOT NULL;
        RAISE NOTICE 'Colonne packageId ajoutee a la table missions';
        
        -- Ajouter la contrainte de clé étrangère
        ALTER TABLE missions 
        ADD CONSTRAINT "FK_missions_package" 
        FOREIGN KEY ("packageId") REFERENCES packages(id) ON DELETE CASCADE;
        RAISE NOTICE 'Contrainte FK_missions_package ajoutee';
    ELSE
        RAISE NOTICE 'Colonne packageId existe deja';
    END IF;
END $$;

