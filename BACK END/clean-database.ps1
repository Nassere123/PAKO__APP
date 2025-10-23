# Script PowerShell pour nettoyer la base de données
$env:PGPASSWORD = "2050"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d pako_db -c "
-- Supprimer toutes les contraintes de clés étrangères
ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS FK_18dc786cf29d6ef99980ba6ae63;
ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS FK_bea96cf083974bf3592fb8ed177;

-- Supprimer toutes les tables
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS delivery_persons CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS stations CASCADE;

-- Supprimer les types énumérés
DROP TYPE IF EXISTS packages_type_enum CASCADE;
DROP TYPE IF EXISTS packages_status_enum CASCADE;
DROP TYPE IF EXISTS orders_status_enum CASCADE;
DROP TYPE IF EXISTS orders_paymentstatus_enum CASCADE;
DROP TYPE IF EXISTS users_usertype_enum CASCADE;
DROP TYPE IF EXISTS users_status_enum CASCADE;
DROP TYPE IF EXISTS stations_type_enum CASCADE;
DROP TYPE IF EXISTS stations_status_enum CASCADE;
DROP TYPE IF EXISTS delivery_persons_status_enum CASCADE;
DROP TYPE IF EXISTS delivery_persons_vehicletype_enum CASCADE;

-- Supprimer la table de métadonnées TypeORM
DROP TABLE IF EXISTS typeorm_metadata CASCADE;

SELECT 'Base de données nettoyée avec succès !' as message;
"
