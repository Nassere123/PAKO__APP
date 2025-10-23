import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '../app.module';
import { ConnectionPoolService } from './connection-pool.service';

async function testDatabaseConnection() {
  console.log('🔍 Test de connexion à la base de données PostgreSQL...\n');

  try {
    // Créer l'application NestJS
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // Récupérer le service de pool de connexions
    const connectionPoolService = app.get(ConnectionPoolService);
    
    console.log('✅ Application NestJS initialisée');
    
    // Test de connexion basique
    console.log('🔗 Test de connexion basique...');
    const isHealthy = await connectionPoolService.isConnectionHealthy();
    console.log(`   Santé de la connexion: ${isHealthy ? '✅ OK' : '❌ Échec'}`);
    
    // Test de requête simple
    console.log('📊 Test de requête simple...');
    const result = await connectionPoolService.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log(`   Heure actuelle: ${result.rows[0].current_time}`);
    console.log(`   Version PostgreSQL: ${result.rows[0].postgres_version}`);
    
    // Test des statistiques du pool
    console.log('📈 Statistiques du pool de connexions...');
    const poolStats = await connectionPoolService.getPoolStats();
    console.log(`   Connexions totales: ${poolStats.totalCount}`);
    console.log(`   Connexions actives: ${poolStats.activeCount}`);
    console.log(`   Connexions inactives: ${poolStats.idleCount}`);
    console.log(`   Connexions en attente: ${poolStats.waitingCount}`);
    console.log(`   Connexions max: ${poolStats.maxConnections}`);
    console.log(`   Connexions min: ${poolStats.minConnections}`);
    
    // Test de création de table
    console.log('🗄️ Test de création de table...');
    await connectionPoolService.query(`
      CREATE TABLE IF NOT EXISTS test_connection (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('   ✅ Table test_connection créée');
    
    // Test d'insertion
    console.log('📝 Test d\'insertion...');
    const insertResult = await connectionPoolService.query(
      'INSERT INTO test_connection (message) VALUES ($1) RETURNING *',
      ['Test de connexion réussi']
    );
    console.log(`   ✅ Données insérées: ID ${insertResult.rows[0].id}`);
    
    // Test de sélection
    console.log('🔍 Test de sélection...');
    const selectResult = await connectionPoolService.query(
      'SELECT * FROM test_connection ORDER BY created_at DESC LIMIT 1'
    );
    console.log(`   ✅ Données récupérées: ${selectResult.rows[0].message}`);
    
    // Test de transaction
    console.log('🔄 Test de transaction...');
    await connectionPoolService.transaction(async (client) => {
      await client.query('INSERT INTO test_connection (message) VALUES ($1)', ['Transaction test']);
      await client.query('INSERT INTO test_connection (message) VALUES ($1)', ['Transaction test 2']);
    });
    console.log('   ✅ Transaction exécutée avec succès');
    
    // Nettoyage
    console.log('🧹 Nettoyage...');
    await connectionPoolService.query('DROP TABLE IF EXISTS test_connection');
    console.log('   ✅ Table de test supprimée');
    
    console.log('\n Tous les tests de connexion ont réussi !');
    console.log('✅ Votre backend est prêt à utiliser PostgreSQL avec le pool de connexions');
    
    await app.close();
    
  } catch (error) {
    console.error('❌ Erreur lors du test de connexion:', error);
    console.error('\n🔧 Vérifiez que:');
    console.error('   1. PostgreSQL est démarré');
    console.error('   2. La base de données "pako_db" existe');
    console.error('   3. L\'utilisateur "pako_user" a les bonnes permissions');
    console.error('   4. Les paramètres dans .env sont corrects');
    process.exit(1);
  }
}

// Exécuter le test si ce fichier est appelé directement
if (require.main === module) {
  testDatabaseConnection();
}

export { testDatabaseConnection };
