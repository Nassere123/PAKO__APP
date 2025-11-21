-- Ajouter la valeur 'station_agent' à l'enum users_usertype_enum
ALTER TYPE users_usertype_enum ADD VALUE IF NOT EXISTS 'station_agent';

