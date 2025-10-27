-- Script pour ajouter une colonne customerName à la table orders
-- pour stocker le nom de l'utilisateur qui a passé la commande

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS "customerName" VARCHAR(255);

-- Ajouter un commentaire pour documentation
COMMENT ON COLUMN orders."customerName" IS 'Nom complet du client qui a passé la commande';
