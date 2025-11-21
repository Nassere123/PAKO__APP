import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConnectionPoolService } from './connection-pool.service';

async function updateDriversTable() {
  console.log('🚀 Mise à jour de la structure de la table drivers...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const connectionPoolService = app.get(ConnectionPoolService);
    
    console.log('✅ Connexion à la base de données établie');
    
    // Vérifier et ajouter les colonnes manquantes
    console.log('📦 Mise à jour de la structure de la table drivers...');
    
    // Vérifier si les colonnes existent déjà
    const checkColumn = async (columnName: string) => {
      const result = await connectionPoolService.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'drivers' AND column_name = $1
      `, [columnName]);
      return Array.isArray(result) ? result.length > 0 : (result.rows?.length > 0);
    };
    
    // Ajouter firstName si elle n'existe pas
    if (!(await checkColumn('firstName'))) {
      try {
        await connectionPoolService.query(`
          ALTER TABLE drivers ADD COLUMN "firstName" VARCHAR(100)
        `);
        console.log('   ✅ Colonne firstName ajoutée');
      } catch (error: any) {
        console.log('   ⚠️  Colonne firstName:', error.message);
      }
    } else {
      console.log('   ✅ Colonne firstName existe déjà');
    }
    
    // Ajouter lastName si elle n'existe pas
    if (!(await checkColumn('lastName'))) {
      try {
        await connectionPoolService.query(`
          ALTER TABLE drivers ADD COLUMN "lastName" VARCHAR(100)
        `);
        console.log('   ✅ Colonne lastName ajoutée');
      } catch (error: any) {
        console.log('   ⚠️  Colonne lastName:', error.message);
      }
    } else {
      console.log('   ✅ Colonne lastName existe déjà');
    }
    
    // Ajouter phone si elle n'existe pas
    if (!(await checkColumn('phone'))) {
      try {
        await connectionPoolService.query(`
          ALTER TABLE drivers ADD COLUMN phone VARCHAR(20)
        `);
        // Créer un index unique sur phone
        await connectionPoolService.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS "IDX_drivers_phone_unique" 
          ON drivers (phone) WHERE phone IS NOT NULL AND "deletedAt" IS NULL
        `);
        console.log('   ✅ Colonne phone ajoutée avec index unique');
      } catch (error: any) {
        console.log('   ⚠️  Colonne phone:', error.message);
      }
    } else {
      console.log('   ✅ Colonne phone existe déjà');
    }
    
    // Ajouter email si elle n'existe pas
    if (!(await checkColumn('email'))) {
      try {
        await connectionPoolService.query(`
          ALTER TABLE drivers ADD COLUMN email VARCHAR(255)
        `);
        console.log('   ✅ Colonne email ajoutée');
      } catch (error: any) {
        console.log('   ⚠️  Colonne email:', error.message);
      }
    } else {
      console.log('   ✅ Colonne email existe déjà');
    }
    
    // Ajouter password si elle n'existe pas
    if (!(await checkColumn('password'))) {
      try {
        await connectionPoolService.query(`
          ALTER TABLE drivers ADD COLUMN password VARCHAR(255)
        `);
        console.log('   ✅ Colonne password ajoutée');
      } catch (error: any) {
        console.log('   ⚠️  Colonne password:', error.message);
      }
    } else {
      console.log('   ✅ Colonne password existe déjà');
    }
    
    // Ajouter isOnline si elle n'existe pas
    if (!(await checkColumn('isOnline'))) {
      try {
        await connectionPoolService.query(`
          ALTER TABLE drivers ADD COLUMN "isOnline" BOOLEAN NOT NULL DEFAULT false
        `);
        console.log('   ✅ Colonne isOnline ajoutée');
      } catch (error: any) {
        console.log('   ⚠️  Colonne isOnline:', error.message);
      }
    } else {
      console.log('   ✅ Colonne isOnline existe déjà');
    }
    
    // Ajouter lastLoginAt si elle n'existe pas
    if (!(await checkColumn('lastLoginAt'))) {
      try {
        await connectionPoolService.query(`
          ALTER TABLE drivers ADD COLUMN "lastLoginAt" TIMESTAMP
        `);
        console.log('   ✅ Colonne lastLoginAt ajoutée');
      } catch (error: any) {
        console.log('   ⚠️  Colonne lastLoginAt:', error.message);
      }
    } else {
      console.log('   ✅ Colonne lastLoginAt existe déjà');
    }
    
    // Ajouter lastLogoutAt si elle n'existe pas
    if (!(await checkColumn('lastLogoutAt'))) {
      try {
        await connectionPoolService.query(`
          ALTER TABLE drivers ADD COLUMN "lastLogoutAt" TIMESTAMP
        `);
        console.log('   ✅ Colonne lastLogoutAt ajoutée');
      } catch (error: any) {
        console.log('   ⚠️  Colonne lastLogoutAt:', error.message);
      }
    } else {
      console.log('   ✅ Colonne lastLogoutAt existe déjà');
    }
    
    // Supprimer les colonnes obsolètes si elles existent (userId, vehicleType, vehicleBrand, etc.)
    // On ne les supprime pas pour éviter de perdre des données, mais on peut les rendre nullable
    console.log('\n📊 Structure de la table drivers mise à jour');
    
    await app.close();
    console.log('\n🎉 Mise à jour terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    process.exit(1);
  }
}

// Exécuter si ce fichier est appelé directement
if (require.main === module) {
  updateDriversTable();
}

export { updateDriversTable };

