import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConnectionPoolService } from './connection-pool.service';

async function recreateDriversTable() {
  console.log('🚀 Recréation de la table drivers avec la nouvelle structure...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const connectionPoolService = app.get(ConnectionPoolService);
    
    console.log('✅ Connexion à la base de données établie');
    
    // Sauvegarder les données existantes si nécessaire
    console.log('📦 Vérification des données existantes...');
    const existingData = await connectionPoolService.query(`
      SELECT * FROM drivers
    `);
    const driversData = Array.isArray(existingData) ? existingData : (existingData.rows || []);
    console.log(`   ℹ️  ${driversData.length} enregistrement(s) existant(s) dans drivers`);
    
    // Supprimer la table si elle existe
    console.log('🗑️  Suppression de l\'ancienne table drivers...');
    await connectionPoolService.query(`DROP TABLE IF EXISTS drivers CASCADE`);
    console.log('   ✅ Ancienne table supprimée');
    
    // Recréer la table avec la nouvelle structure
    console.log('📦 Création de la nouvelle table drivers...');
    await connectionPoolService.query(`
      CREATE TABLE drivers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "firstName" VARCHAR(100) NOT NULL,
        "lastName" VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        "licenseNumber" VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'offline',
        "isOnline" BOOLEAN NOT NULL DEFAULT false,
        "lastLoginAt" TIMESTAMP,
        "lastLogoutAt" TIMESTAMP,
        "currentLatitude" DECIMAL(10,8),
        "currentLongitude" DECIMAL(11,8),
        rating DECIMAL(3,2) NOT NULL DEFAULT 0,
        "totalRatings" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "deletedAt" TIMESTAMP
      )
    `);
    console.log('   ✅ Nouvelle table drivers créée');
    
    // Créer les index
    console.log('📊 Création des index...');
    const indexes = [
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_drivers_phone" ON drivers (phone) WHERE "deletedAt" IS NULL',
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_drivers_licenseNumber" ON drivers ("licenseNumber") WHERE "deletedAt" IS NULL',
      'CREATE INDEX IF NOT EXISTS "IDX_drivers_status" ON drivers (status)',
      'CREATE INDEX IF NOT EXISTS "IDX_drivers_isOnline" ON drivers ("isOnline")',
      'CREATE INDEX IF NOT EXISTS "IDX_drivers_available" ON drivers ("isOnline", "isActive") WHERE "isOnline" = true AND "isActive" = true',
    ];
    
    for (const indexQuery of indexes) {
      await connectionPoolService.query(indexQuery);
    }
    console.log('   ✅ Tous les index créés');
    
    console.log('\n🎉 Table drivers recréée avec succès !');
    console.log('✅ La table a maintenant la nouvelle structure avec firstName, lastName, phone, email, password, isOnline, etc.');
    
    await app.close();
    
  } catch (error) {
    console.error('❌ Erreur lors de la recréation:', error);
    process.exit(1);
  }
}

// Exécuter si ce fichier est appelé directement
if (require.main === module) {
  recreateDriversTable();
}

export { recreateDriversTable };

