import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConnectionPoolService } from './connection-pool.service';
import * as bcrypt from 'bcryptjs';

async function migrateStationAgents() {
  console.log('🚀 Migration des agents de gare de users vers station_agents...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const connectionPoolService = app.get(ConnectionPoolService);
    
    console.log('✅ Connexion à la base de données établie');
    
    // 1. Récupérer tous les agents de gare de la table users
    console.log('📋 Récupération des agents de gare depuis la table users...');
    const result = await connectionPoolService.query(`
      SELECT id, "firstName", "lastName", phone, email, password, "createdAt", "updatedAt"
      FROM users
      WHERE "userType" = 'station_agent'
    `);
    
    // Gérer le résultat selon le format retourné
    const stationAgents = Array.isArray(result) ? result : (result.rows || []);
    
    console.log(`   ✅ ${stationAgents.length} agent(s) de gare trouvé(s)`);
    
    if (stationAgents.length === 0) {
      console.log('   ℹ️  Aucun agent de gare à migrer');
      await app.close();
      return;
    }
    
    // 2. Pour chaque agent, créer une entrée dans station_agents
    console.log('📦 Migration des agents vers station_agents...');
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const agent of stationAgents) {
      try {
        // Vérifier si l'agent existe déjà dans station_agents
        const existingResult = await connectionPoolService.query(`
          SELECT id FROM station_agents WHERE phone = $1
        `, [agent.phone]);
        
        const existingAgent = Array.isArray(existingResult) ? existingResult : (existingResult.rows || []);
        
        if (existingAgent.length > 0) {
          console.log(`   ⚠️  Agent ${agent.phone} existe déjà dans station_agents, ignoré`);
          continue;
        }
        
        // Déterminer le stationId et stationName (par défaut si non spécifié)
        // Vous pouvez adapter cette logique selon vos besoins
        const stationId = 'STATION-001'; // À adapter selon votre logique
        const stationName = "Gare d'Adjamé"; // À adapter selon votre logique
        
        // Insérer dans station_agents
        await connectionPoolService.query(`
          INSERT INTO station_agents (
            "firstName", "lastName", phone, email, password,
            "stationId", "stationName", "isOnline", "isActive",
            "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          agent.firstName,
          agent.lastName,
          agent.phone,
          agent.email || null,
          agent.password, // Le mot de passe est déjà hashé
          stationId,
          stationName,
          false, // isOnline par défaut
          true,  // isActive par défaut
          agent.createdAt || new Date(),
          agent.updatedAt || new Date(),
        ]);
        
        console.log(`   ✅ Agent ${agent.firstName} ${agent.lastName} (${agent.phone}) migré`);
        migratedCount++;
      } catch (error) {
        console.error(`   ❌ Erreur lors de la migration de l'agent ${agent.phone}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Résumé de la migration:`);
    console.log(`   ✅ ${migratedCount} agent(s) migré(s) avec succès`);
    if (errorCount > 0) {
      console.log(`   ❌ ${errorCount} erreur(s)`);
    }
    
    // 3. Supprimer les agents de gare de la table users
    if (migratedCount > 0) {
      console.log('\n🗑️  Suppression des agents de gare de la table users...');
      const deleteResult = await connectionPoolService.query(`
        DELETE FROM users WHERE "userType" = 'station_agent'
      `);
      console.log(`   ✅ ${deleteResult.rowCount || migratedCount} agent(s) supprimé(s) de la table users`);
    }
    
    console.log('\n🎉 Migration terminée avec succès !');
    console.log('✅ La table users est maintenant réservée aux clients uniquement');
    console.log('✅ La table station_agents contient tous les agents de gare');
    
    await app.close();
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter si ce fichier est appelé directement
if (require.main === module) {
  migrateStationAgents();
}

export { migrateStationAgents };

