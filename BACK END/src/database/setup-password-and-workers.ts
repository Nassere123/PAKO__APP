import { AppDataSource } from './data-source';
import * as bcrypt from 'bcryptjs';

/**
 * Script combiné pour ajouter la colonne password et créer les utilisateurs de test
 * 
 * Usage: ts-node src/database/setup-password-and-workers.ts
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

async function setupPasswordAndWorkers() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await AppDataSource.initialize();
    console.log('✅ Connecté à la base de données');

    const queryRunner = AppDataSource.createQueryRunner();

    // Étape 1 : Vérifier et ajouter la colonne password
    console.log('\n📝 Étape 1 : Vérification de la colonne password...\n');
    
    let columnExists = false;
    try {
      const columnCheck = await queryRunner.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password'
      `);
      columnExists = columnCheck.length > 0;
    } catch (error) {
      console.log('⚠️  Erreur lors de la vérification de la colonne:', (error as Error).message);
    }

    if (!columnExists) {
      console.log('📝 Tentative d\'ajout de la colonne password...');
      try {
        await queryRunner.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS password VARCHAR(255) NULL
        `);
        console.log('✅ Colonne password ajoutée avec succès!\n');
        columnExists = true;
      } catch (error: any) {
        if (error.code === '42501') {
          console.log('⚠️  Permissions insuffisantes pour ajouter la colonne automatiquement.');
          console.log('💡 La colonne sera ajoutée lors de la première synchronisation TypeORM');
          console.log('   ou vous pouvez l\'ajouter manuellement avec:');
          console.log('   ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL;\n');
        } else {
          console.log('⚠️  Erreur lors de l\'ajout de la colonne:', error.message);
          console.log('💡 Vérifiez que la colonne existe avant de continuer.\n');
        }
      }
    } else {
      console.log('✅ La colonne password existe déjà.\n');
    }

    // Vérifier à nouveau si la colonne existe maintenant
    if (!columnExists) {
      try {
        const finalCheck = await queryRunner.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'password'
        `);
        columnExists = finalCheck.length > 0;
      } catch (error) {
        // Ignorer l'erreur
      }
    }

    if (!columnExists) {
      console.log('❌ La colonne password n\'existe pas et ne peut pas être créée automatiquement.');
      console.log('💡 Veuillez exécuter manuellement:');
      console.log('   ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL;');
      console.log('   Puis réexécutez ce script.\n');
      await queryRunner.release();
      await AppDataSource.destroy();
      process.exit(1);
    }

    // Étape 2 : Créer les utilisateurs
    console.log('📝 Étape 2 : Création des utilisateurs de test...\n');

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

      try {
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
      } catch (error: any) {
        if (error.message.includes('password')) {
          console.log(`❌ Erreur pour ${worker.firstName} ${worker.lastName}: La colonne password n'existe pas encore.`);
          console.log('💡 Veuillez ajouter la colonne manuellement puis réexécutez ce script.\n');
        } else {
          console.log(`❌ Erreur lors de la création de ${worker.firstName} ${worker.lastName}:`, error.message);
        }
      }
    }

    await queryRunner.release();

    console.log('✅ Script terminé!\n');
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
setupPasswordAndWorkers()
  .then(() => {
    console.log('✨ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });

