-- Script SQL pour ajouter 'delivered' à l'enum packages_status_enum
-- ⚠️ À exécuter avec un compte administrateur PostgreSQL (postgres)
-- Exécutez ce script dans pgAdmin, DBeaver, ou via psql avec un compte admin
-- 
-- IMPORTANT: Exécutez chaque commande ALTER TYPE dans une transaction séparée
-- (Ne pas les mettre dans un DO $$ car ALTER TYPE ne peut pas être dans un bloc transactionnel)

-- 1. Vérifier les valeurs actuelles de l'enum
SELECT unnest(enum_range(NULL::packages_status_enum)) AS current_values;

-- 2. Ajouter 'delivered' à l'enum
-- Exécutez cette commande seule dans une transaction
ALTER TYPE packages_status_enum ADD VALUE 'delivered';

-- 3. Vérifier les valeurs finales de l'enum
SELECT unnest(enum_range(NULL::packages_status_enum)) AS final_values;

