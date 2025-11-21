import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConnectionPoolService } from './connection-pool.service';

async function createStationAgentsTable() {
  console.log('🚀 Création de la table station_agents...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const connectionPoolService = app.get(ConnectionPoolService);
    
    console.log('✅ Connexion à la base de données établie');
    
    // Créer la table station_agents
    console.log('📦 Création de la table station_agents...');
    await connectionPoolService.query(`
      CREATE TABLE IF NOT EXISTS station_agents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "firstName" VARCHAR(100) NOT NULL,
        "lastName" VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        "stationId" VARCHAR(100) NOT NULL,
        "stationName" VARCHAR(255) NOT NULL,
        "isOnline" BOOLEAN NOT NULL DEFAULT false,
        "lastLoginAt" TIMESTAMP,
        "lastLogoutAt" TIMESTAMP,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "deletedAt" TIMESTAMP
      )
    `);
    console.log('   ✅ Table station_agents créée');
    
    // Créer les index
    console.log('📊 Création des index...');
    const indexes = [
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_station_agents_phone" ON station_agents (phone) WHERE "deletedAt" IS NULL',
      'CREATE INDEX IF NOT EXISTS "IDX_station_agents_stationId" ON station_agents ("stationId")',
      'CREATE INDEX IF NOT EXISTS "IDX_station_agents_isOnline" ON station_agents ("isOnline")',
      'CREATE INDEX IF NOT EXISTS "IDX_station_agents_isActive" ON station_agents ("isActive")',
    ];
    
    for (const indexQuery of indexes) {
      await connectionPoolService.query(indexQuery);
    }
    console.log('   ✅ Tous les index créés');
    
    console.log('\n🎉 Table station_agents créée avec succès !');
    
    await app.close();
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table:', error);
    process.exit(1);
  }
}

// Exécuter si ce fichier est appelé directement
if (require.main === module) {
  createStationAgentsTable();
}

export { createStationAgentsTable };

