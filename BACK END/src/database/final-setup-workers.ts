import { AppDataSource } from './data-source';
import * as bcrypt from 'bcryptjs';

/**
 * Script final pour créer les utilisateurs de test
 * Essaie d'ajouter la colonne password, puis crée les utilisateurs
 * 
 * Usage: ts-node src/database/final-setup-workers.ts
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
    userType: 'driver',
    email: 'kone.aicha@pako.ci',
  },
  {
    firstName: 'Ouattara',
    lastName: 'Bruno',
    phone: '+2250502345678',
    password: 'Agent123!',
    userType: 'driver',
    email: 'ouattara.bruno@pako.ci',
  },
];

async function finalSetupWorkers() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await AppDataSource.initialize();
    console.log('✅ Connecté à la base de données');

    const queryRunner = AppDataSource.createQueryRunner();

    // Étape 1 : Vérifier si la colonne password existe
    console.log('\n📝 Vérification de la colonne password...\n');
    
    let columnExists = false;
    try {
      const columnCheck = await queryRunner.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password'
      `);
      columnExists = columnCheck.length > 0;
      
      if (columnExists) {
        console.log('✅ La colonne password existe déjà.\n');
      } else {
        console.log('📝 La colonne password n\'existe pas. Tentative d\'ajout...');
        try {
          await queryRunner.query(`
            ALTER TABLE users 
            ADD COLUMN password VARCHAR(255) NULL
          `);
          console.log('✅ Colonne password ajoutée avec succès!\n');
          columnExists = true;
        } catch (error: any) {
          if (error.code === '42501') {
            console.log('⚠️  Permissions insuffisantes pour ajouter la colonne.');
            console.log('💡 Le script va continuer en supposant que la colonne sera ajoutée manuellement.\n');
          } else {
            throw error;
          }
        }
      }
    } catch (error: any) {
      console.log('⚠️  Erreur lors de la vérification:', error.message);
      console.log('💡 Le script va continuer...\n');
    }

    // Étape 2 : Créer les utilisateurs
    console.log('📝 Création des utilisateurs de test...\n');

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const worker of testWorkers) {
      try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await queryRunner.query(
          `SELECT id, phone FROM users WHERE phone = $1`,
          [worker.phone]
        );

        if (existingUser.length > 0) {
          console.log(`⚠️  Utilisateur ${worker.firstName} ${worker.lastName} (${worker.phone}) existe déjà. Ignoré.`);
          skipCount++;
          continue;
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(worker.password, 10);

        // Insérer l'utilisateur
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
        
        successCount++;
      } catch (error: any) {
        if (error.message && error.message.includes('password')) {
          console.log(`❌ ${worker.firstName} ${worker.lastName}: La colonne password n'existe pas encore.`);
          console.log('💡 Veuillez exécuter: ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL;\n');
          errorCount++;
        } else {
          console.log(`❌ Erreur pour ${worker.firstName} ${worker.lastName}:`, error.message);
          errorCount++;
        }
      }
    }

    await queryRunner.release();

    // Résumé
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Résumé:');
    console.log(`   ✅ Créés: ${successCount}`);
    console.log(`   ⚠️  Ignorés (existent déjà): ${skipCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (successCount > 0) {
      console.log('📋 Identifiants des utilisateurs créés:');
      testWorkers.forEach((worker, index) => {
        const role = worker.userType === 'driver' ? 'Livreur' : 'Agent';
        console.log(`${index + 1}. ${role}: ${worker.firstName} ${worker.lastName}`);
        console.log(`   📞 Téléphone: ${worker.phone}`);
        console.log(`   🔑 Mot de passe: ${worker.password}`);
        console.log('');
      });
    }

    if (errorCount > 0 && !columnExists) {
      console.log('💡 Pour résoudre les erreurs, exécutez cette commande SQL en tant qu\'administrateur:');
      console.log('   ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL;');
      console.log('   Puis réexécutez ce script.\n');
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Déconnecté de la base de données');
    }
  }
}

// Exécuter le script
finalSetupWorkers()
  .then(() => {
    console.log('✨ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });

