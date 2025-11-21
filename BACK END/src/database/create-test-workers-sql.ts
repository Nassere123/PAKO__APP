import { AppDataSource } from './data-source';
import * as bcrypt from 'bcryptjs';

/**
 * Script pour créer des utilisateurs de test en utilisant des requêtes SQL brutes
 * Ce script évite les problèmes de permissions TypeORM
 * 
 * Usage: ts-node src/database/create-test-workers-sql.ts
 */

const testWorkers = [
  // Livreurs
  {
    firstName: 'Kouadio',
    lastName: 'Pascal',
    phone: '+2250701234567',
    password: 'Livreur123!',
    userType: 'driver',
    email: 'kouadio.pascal@pako.ci',
  },
  {
    firstName: 'Bakayoko',
    lastName: 'Ismaël',
    phone: '+2250702345678',
    password: 'Livreur123!',
    userType: 'driver',
    email: 'bakayoko.ismael@pako.ci',
  },
  {
    firstName: 'Koné',
    lastName: 'Moussa',
    phone: '+2250703456789',
    password: 'Livreur123!',
    userType: 'driver',
    email: 'kone.moussa@pako.ci',
  },
  // Agents de gare
  {
    firstName: 'Koné',
    lastName: 'Aïcha',
    phone: '+2250501234567',
    password: 'Agent123!',
    userType: 'driver', // À changer si vous avez un type STATION_AGENT
    email: 'kone.aicha@pako.ci',
  },
  {
    firstName: 'Ouattara',
    lastName: 'Bruno',
    phone: '+2250502345678',
    password: 'Agent123!',
    userType: 'driver', // À changer si vous avez un type STATION_AGENT
    email: 'ouattara.bruno@pako.ci',
  },
];

async function createTestWorkersSQL() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await AppDataSource.initialize();
    console.log('✅ Connecté à la base de données');

    const queryRunner = AppDataSource.createQueryRunner();

    // Vérifier si la colonne password existe
    console.log('\n📝 Vérification de la colonne password...\n');
    const columnCheck = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password'
    `);

    if (columnCheck.length === 0) {
      console.log('⚠️  La colonne password n\'existe pas encore.');
      console.log('💡 Veuillez d\'abord exécuter cette commande SQL en tant qu\'administrateur PostgreSQL:');
      console.log('   ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL;\n');
      console.log('   Puis réexécutez ce script.\n');
      await queryRunner.release();
      await AppDataSource.destroy();
      process.exit(1);
    }

    console.log('✅ La colonne password existe.\n');

    console.log('📝 Création des utilisateurs de test...\n');

    for (const worker of testWorkers) {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await queryRunner.query(
        `SELECT id, phone FROM users WHERE phone = $1`,
        [worker.phone]
      );

      if (existingUser.length > 0) {
        console.log(`⚠️  Utilisateur ${worker.firstName} ${worker.lastName} (${worker.phone}) existe déjà. Ignoré.`);
        continue;
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(worker.password, 10);

      // Insérer l'utilisateur avec SQL brut
      const result = await queryRunner.query(
        `INSERT INTO users (id, "firstName", "lastName", phone, email, password, "userType", status, "isVerified", "isOnline", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'active', true, false, NOW(), NOW())
         RETURNING id, "firstName", "lastName", phone`,
        [
          worker.firstName,
          worker.lastName,
          worker.phone,
          worker.email,
          hashedPassword,
          worker.userType,
        ]
      );

      const newUser = result[0];

      console.log(`✅ ${worker.userType === 'driver' ? 'Livreur' : 'Agent'} créé:`);
      console.log(`   ID: ${newUser.id}`);
      console.log(`   Nom: ${worker.firstName} ${worker.lastName}`);
      console.log(`   Téléphone: ${worker.phone}`);
      console.log(`   Mot de passe: ${worker.password}`);
      console.log(`   Email: ${worker.email || 'N/A'}`);
      console.log('');
    }

    await queryRunner.release();

    console.log('✅ Tous les utilisateurs de test ont été créés avec succès!\n');
    console.log('📋 Récapitulatif des identifiants:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testWorkers.forEach((worker, index) => {
      const role = worker.userType === 'driver' ? 'Livreur' : 'Agent';
      console.log(`${index + 1}. ${role}: ${worker.firstName} ${worker.lastName}`);
      console.log(`   📞 Téléphone: ${worker.phone}`);
      console.log(`   🔑 Mot de passe: ${worker.password}`);
      console.log('');
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Déconnecté de la base de données');
    }
  }
}

// Exécuter le script
createTestWorkersSQL()
  .then(() => {
    console.log('✨ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });

