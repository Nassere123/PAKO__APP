import { AppDataSource } from './data-source';

/**
 * Script pour ajouter la colonne password à la table users
 * 
 * Usage: ts-node src/database/add-password-column.ts
 */

async function addPasswordColumn() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await AppDataSource.initialize();
    console.log('✅ Connecté à la base de données');

    const queryRunner = AppDataSource.createQueryRunner();

    console.log('\n📝 Ajout de la colonne password...\n');

    // Vérifier si la colonne existe déjà
    const columnExists = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password'
    `);

    if (columnExists.length > 0) {
      console.log('⚠️  La colonne password existe déjà. Ignoré.');
    } else {
      // Ajouter la colonne
      await queryRunner.query(`
        ALTER TABLE users 
        ADD COLUMN password VARCHAR(255) NULL
      `);

      // Ajouter un commentaire
      await queryRunner.query(`
        COMMENT ON COLUMN users.password IS 'Mot de passe hashé (pour les travailleurs uniquement)'
      `);

      console.log('✅ Colonne password ajoutée avec succès!');
    }

    await queryRunner.release();

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Déconnecté de la base de données');
    }
  }
}

// Exécuter le script
addPasswordColumn()
  .then(() => {
    console.log('✨ Script terminé avec succès\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });

