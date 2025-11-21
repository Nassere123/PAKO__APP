import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConnectionPoolService } from './connection-pool.service';

async function migrateDrivers() {
  console.log('🚀 Migration des livreurs de users vers drivers...\n');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const connectionPoolService = app.get(ConnectionPoolService);
    
    console.log('✅ Connexion à la base de données établie');
    
    // 1. Récupérer tous les livreurs de la table users
    console.log('📋 Récupération des livreurs depuis la table users...');
    const result = await connectionPoolService.query(`
      SELECT id, "firstName", "lastName", phone, email, password, "createdAt", "updatedAt"
      FROM users
      WHERE "userType" = 'driver'
    `);
    
    // Gérer le résultat selon le format retourné
    const drivers = Array.isArray(result) ? result : (result.rows || []);
    
    console.log(`   ✅ ${drivers.length} livreur(s) trouvé(s)`);
    
    if (drivers.length === 0) {
      console.log('   ℹ️  Aucun livreur à migrer');
      await app.close();
      return;
    }
    
    // 2. Pour chaque livreur, créer une entrée dans drivers
    console.log('📦 Migration des livreurs vers drivers...');
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const driver of drivers) {
      try {
        // Vérifier si le livreur existe déjà dans drivers
        const existingResult = await connectionPoolService.query(`
          SELECT id FROM drivers WHERE phone = $1
        `, [driver.phone]);
        
        const existingDriver = Array.isArray(existingResult) ? existingResult : (existingResult.rows || []);
        
        if (existingDriver.length > 0) {
          console.log(`   ⚠️  Livreur ${driver.phone} existe déjà dans drivers, ignoré`);
          continue;
        }
        
        // Générer un numéro de permis par défaut si nécessaire
        const licenseNumber = `LIC-${driver.phone.substring(driver.phone.length - 8)}`;
        
        // Insérer dans drivers
        await connectionPoolService.query(`
          INSERT INTO drivers (
            "firstName", "lastName", phone, email, password,
            "licenseNumber", status, "isOnline", "isActive",
            "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          driver.firstName,
          driver.lastName,
          driver.phone,
          driver.email || null,
          driver.password, // Le mot de passe est déjà hashé
          licenseNumber,
          'offline', // status par défaut
          false,     // isOnline par défaut
          true,      // isActive par défaut
          driver.createdAt || new Date(),
          driver.updatedAt || new Date(),
        ]);
        
        console.log(`   ✅ Livreur ${driver.firstName} ${driver.lastName} (${driver.phone}) migré`);
        migratedCount++;
      } catch (error) {
        console.error(`   ❌ Erreur lors de la migration du livreur ${driver.phone}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Résumé de la migration:`);
    console.log(`   ✅ ${migratedCount} livreur(s) migré(s) avec succès`);
    if (errorCount > 0) {
      console.log(`   ❌ ${errorCount} erreur(s)`);
    }
    
    // 3. Supprimer les livreurs de la table users
    if (migratedCount > 0) {
      console.log('\n🗑️  Suppression des livreurs de la table users...');
      const deleteResult = await connectionPoolService.query(`
        DELETE FROM users WHERE "userType" = 'driver'
      `);
      console.log(`   ✅ ${deleteResult.rowCount || migratedCount} livreur(s) supprimé(s) de la table users`);
    }
    
    console.log('\n🎉 Migration terminée avec succès !');
    console.log('✅ La table users est maintenant réservée aux clients uniquement');
    console.log('✅ La table drivers contient tous les livreurs');
    
    await app.close();
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter si ce fichier est appelé directement
if (require.main === module) {
  migrateDrivers();
}

export { migrateDrivers };

