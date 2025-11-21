import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConnectionPoolService } from './connection-pool.service';

async function updatePackagesTable() {
  console.log('🚀 Mise à jour de la table packages...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const connectionPoolService = app.get(ConnectionPoolService);

    console.log('✅ Connexion à la base de données établie\n');

    // Vérifier si les colonnes existent déjà
    const checkColumn = async (columnName: string): Promise<boolean> => {
      const result = await connectionPoolService.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'packages' AND column_name = $1`,
        [columnName]
      );
      const rows = Array.isArray(result) ? result : (result.rows || []);
      return rows.length > 0;
    };

    // Ajouter assignedDriverId si elle n'existe pas
    const hasAssignedDriverId = await checkColumn('assignedDriverId');
    if (!hasAssignedDriverId) {
      console.log('📦 Ajout de la colonne assignedDriverId...');
      try {
        await connectionPoolService.query(`
          ALTER TABLE packages 
          ADD COLUMN "assignedDriverId" UUID
        `);
        console.log('   ✅ Colonne assignedDriverId ajoutée');
        
        // Essayer d'ajouter la contrainte de clé étrangère (peut échouer si pas les permissions)
        try {
          await connectionPoolService.query(`
            ALTER TABLE packages 
            ADD CONSTRAINT "FK_packages_assignedDriver" 
            FOREIGN KEY ("assignedDriverId") REFERENCES drivers(id) ON DELETE SET NULL
          `);
          console.log('   ✅ Contrainte de clé étrangère ajoutée');
        } catch (fkError) {
          console.log('   ⚠️  Impossible d\'ajouter la contrainte de clé étrangère (permissions insuffisantes)');
          console.log('   ℹ️  La colonne a été ajoutée, mais la contrainte doit être ajoutée manuellement par un administrateur');
        }
      } catch (error) {
        console.error('   ❌ Erreur lors de l\'ajout de la colonne:', error.message);
        throw error;
      }
    } else {
      console.log('   ℹ️  Colonne assignedDriverId existe déjà');
    }

    // Ajouter assignedDriverName si elle n'existe pas
    const hasAssignedDriverName = await checkColumn('assignedDriverName');
    if (!hasAssignedDriverName) {
      console.log('📦 Ajout de la colonne assignedDriverName...');
      await connectionPoolService.query(`
        ALTER TABLE packages 
        ADD COLUMN "assignedDriverName" VARCHAR(255)
      `);
      console.log('   ✅ Colonne assignedDriverName ajoutée');
    } else {
      console.log('   ℹ️  Colonne assignedDriverName existe déjà');
    }

    // Ajouter assignedAt si elle n'existe pas
    const hasAssignedAt = await checkColumn('assignedAt');
    if (!hasAssignedAt) {
      console.log('📦 Ajout de la colonne assignedAt...');
      await connectionPoolService.query(`
        ALTER TABLE packages 
        ADD COLUMN "assignedAt" TIMESTAMP WITH TIME ZONE
      `);
      console.log('   ✅ Colonne assignedAt ajoutée');
    } else {
      console.log('   ℹ️  Colonne assignedAt existe déjà');
    }

    // Vérifier et ajouter packageCode si elle n'existe pas (au cas où)
    const hasPackageCode = await checkColumn('packageCode');
    if (!hasPackageCode) {
      console.log('📦 Ajout de la colonne packageCode...');
      await connectionPoolService.query(`
        ALTER TABLE packages 
        ADD COLUMN "packageCode" VARCHAR(50) UNIQUE
      `);
      console.log('   ✅ Colonne packageCode ajoutée');
    } else {
      console.log('   ℹ️  Colonne packageCode existe déjà');
    }

    // Créer un index sur assignedDriverId pour améliorer les performances
    console.log('\n📊 Création des index...');
    try {
      await connectionPoolService.query(`
        CREATE INDEX IF NOT EXISTS "IDX_packages_assignedDriverId" 
        ON packages ("assignedDriverId") 
        WHERE "assignedDriverId" IS NOT NULL
      `);
      console.log('   ✅ Index sur assignedDriverId créé');
    } catch (error) {
      console.log('   ℹ️  Index sur assignedDriverId existe déjà ou erreur:', error.message);
    }

    console.log('\n🎉 Mise à jour de la table packages terminée avec succès !');
    console.log('✅ Toutes les colonnes nécessaires sont présentes');

    await app.close();

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    process.exit(1);
  }
}

// Exécuter si ce fichier est appelé directement
if (require.main === module) {
  updatePackagesTable();
}

export { updatePackagesTable };

