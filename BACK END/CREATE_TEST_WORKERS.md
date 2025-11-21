# Création d'utilisateurs de test

Ce script permet de créer des utilisateurs de test (livreurs et agents) dans la base de données.

## Utilisation

```bash
cd BACK END
ts-node src/database/create-test-workers.ts
```

## Utilisateurs créés

### Livreurs
1. **Kouadio Pascal**
   - Téléphone: `+2250701234567`
   - Mot de passe: `Livreur123!`
   - Email: `kouadio.pascal@pako.ci`

2. **Bakayoko Ismaël**
   - Téléphone: `+2250702345678`
   - Mot de passe: `Livreur123!`
   - Email: `bakayoko.ismael@pako.ci`

3. **Koné Moussa**
   - Téléphone: `+2250703456789`
   - Mot de passe: `Livreur123!`
   - Email: `kone.moussa@pako.ci`

### Agents de gare
1. **Koné Aïcha**
   - Téléphone: `+2250501234567`
   - Mot de passe: `Agent123!`
   - Email: `kone.aicha@pako.ci`

2. **Ouattara Bruno**
   - Téléphone: `+2250502345678`
   - Mot de passe: `Agent123!`
   - Email: `ouattara.bruno@pako.ci`

## Notes

- Les mots de passe sont hashés avec bcrypt avant d'être stockés
- Les utilisateurs sont créés avec le statut `ACTIVE`
- Si un utilisateur existe déjà avec le même numéro de téléphone, il sera ignoré
- Vous pouvez modifier les utilisateurs dans le fichier `src/database/create-test-workers.ts`

