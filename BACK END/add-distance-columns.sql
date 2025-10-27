-- Script pour ajouter les colonnes de distance et de coordonnées de la gare
-- à la table orders

-- Ajouter les colonnes si elles n'existent pas déjà
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS "deliveryLatitude" DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS "deliveryLongitude" DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS "stationLatitude" DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS "stationLongitude" DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS "distanceKm" DECIMAL(10,2);

-- Ajouter un commentaire pour documentation
COMMENT ON COLUMN orders."deliveryLatitude" IS 'Latitude du lieu de livraison';
COMMENT ON COLUMN orders."deliveryLongitude" IS 'Longitude du lieu de livraison';
COMMENT ON COLUMN orders."stationLatitude" IS 'Latitude de la gare de destination';
COMMENT ON COLUMN orders."stationLongitude" IS 'Longitude de la gare de destination';
COMMENT ON COLUMN orders."distanceKm" IS 'Distance en kilomètres entre la gare et le lieu de livraison';
