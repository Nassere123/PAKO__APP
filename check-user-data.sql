-- Script pour vérifier que tous les utilisateurs sont enregistrés en BD

-- 1. Afficher tous les utilisateurs créés
SELECT 
    "firstName" AS "Prénom",
    "lastName" AS "Nom", 
    phone AS "Téléphone",
    "isVerified" AS "Vérifié",
    "userType" AS "Type d'utilisateur",
    status AS "Statut",
    "createdAt" AS "Date de création"
FROM users 
ORDER BY "createdAt" DESC;

-- 2. Compter le nombre total d'utilisateurs
SELECT COUNT(*) AS "Nombre total d'utilisateurs" FROM users;

-- 3. Vérifier les utilisateurs récents (5 derniers)
SELECT 
    "firstName" AS "Prénom",
    "lastName" AS "Nom", 
    phone AS "Téléphone",
    "isVerified" AS "Vérifié",
    "createdAt" AS "Date de création"
FROM users 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- 4. Vérifier qu'il n'y a pas de doublons
SELECT phone, COUNT(*) as "Nombre de comptes"
FROM users 
GROUP BY phone 
HAVING COUNT(*) > 1;
