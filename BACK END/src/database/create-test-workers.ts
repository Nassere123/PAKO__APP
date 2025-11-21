import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserType, UserStatus } from '../users/entities/user.entity';
import { AppDataSource } from './data-source';

/**
 * Script pour créer des utilisateurs de test (livreurs et agents)
 * 
 * Usage: ts-node src/database/create-test-workers.ts
 */

const testWorkers = [
  // Livreurs
  {
    firstName: 'Kouadio',
    lastName: 'Pascal',
    phone: '+2250701234567',
    password: 'Livreur123!',
    userType: UserType.DRIVER,
    email: 'kouadio.pascal@pako.ci',
  },
  {
    firstName: 'Bakayoko',
    lastName: 'Ismaël',
    phone: '+2250702345678',
    password: 'Livreur123!',
    userType: UserType.DRIVER,
    email: 'bakayoko.ismael@pako.ci',
  },
  {
    firstName: 'Koné',
    lastName: 'Moussa',
    phone: '+2250703456789',
    password: 'Livreur123!',
    userType: UserType.DRIVER,
    email: 'kone.moussa@pako.ci',
  },
  // Agents de gare
  {
    firstName: 'Koné',
    lastName: 'Aïcha',
    phone: '+2250801234567',
    password: 'Agent123!',
    userType: UserType.STATION_AGENT,
    email: 'kone.aicha@pako.ci',
  },
  {
    firstName: 'Ouattara',
    lastName: 'Bruno',
    phone: '+2250802345678',
    password: 'Agent123!',
    userType: UserType.STATION_AGENT,
    email: 'ouattara.bruno@pako.ci',
  },
];

async function createTestWorkers() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await AppDataSource.initialize();
    console.log('✅ Connecté à la base de données');

    const queryRunner = AppDataSource.createQueryRunner();

    // Ajouter la colonne password si elle n'existe pas
    console.log('\n📝 Vérification de la colonne password...\n');
    try {
      const columnExists = await queryRunner.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password'
      `);

      if (columnExists.length === 0) {
        console.log('📝 Ajout de la colonne password...');
        await queryRunner.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS password VARCHAR(255) NULL
        `);
        console.log('✅ Colonne password ajoutée!\n');
      } else {
        console.log('✅ La colonne password existe déjà.\n');
      }
    } catch (error: any) {
      console.log('⚠️  Impossible d\'ajouter la colonne automatiquement:', error.message);
      console.log('💡 Veuillez exécuter manuellement: ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL;\n');
    }

    await queryRunner.release();

    const userRepository = AppDataSource.getRepository(User);

    console.log('📝 Création des utilisateurs de test...\n');

    for (const worker of testWorkers) {
      // Vérifier si l'utilisateur existe déjà (sans inclure password dans la requête)
      const existingUser = await userRepository
        .createQueryBuilder('user')
        .where('user.phone = :phone', { phone: worker.phone })
        .select(['user.id', 'user.phone', 'user.firstName', 'user.lastName'])
        .getOne();

      if (existingUser) {
        // Vérifier si l'utilisateur existe mais n'a pas de mot de passe
        const fullUser = await userRepository.findOne({
          where: { phone: worker.phone },
          select: ['id', 'phone', 'firstName', 'lastName', 'password', 'status']
        });

        if (fullUser && !fullUser.password) {
          // Mettre à jour l'utilisateur existant avec le mot de passe
          const hashedPassword = await bcrypt.hash(worker.password, 10);
          await userRepository.update(fullUser.id, {
            password: hashedPassword,
            status: UserStatus.ACTIVE,
            isVerified: true,
            userType: worker.userType,
          });
          console.log(`✅ Utilisateur ${worker.firstName} ${worker.lastName} (${worker.phone}) mis à jour avec mot de passe.`);
          console.log(`   Mot de passe: ${worker.password}`);
          console.log('');
          continue;
        } else if (fullUser && fullUser.password) {
          // Vérifier si le userType doit être mis à jour
          const currentUser = await userRepository.findOne({
            where: { phone: worker.phone },
            select: ['id', 'userType']
          });
          
          if (currentUser && currentUser.userType !== worker.userType) {
            await userRepository.update(currentUser.id, {
              userType: worker.userType,
            });
            const roleName = worker.userType === UserType.DRIVER ? 'Livreur' : worker.userType === UserType.STATION_AGENT ? 'Agent de gare' : 'Travailleur';
            console.log(`✅ Utilisateur ${worker.firstName} ${worker.lastName} (${worker.phone}) mis à jour: type changé en ${roleName}`);
            console.log('');
          } else {
            console.log(`⚠️  Utilisateur ${worker.firstName} ${worker.lastName} (${worker.phone}) existe déjà avec mot de passe. Ignoré.`);
          }
          continue;
        }
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(worker.password, 10);

      // Créer l'utilisateur
      const newUser = userRepository.create({
        firstName: worker.firstName,
        lastName: worker.lastName,
        phone: worker.phone,
        email: worker.email,
        password: hashedPassword,
        userType: worker.userType,
        status: UserStatus.ACTIVE,
        isVerified: true,
        isOnline: false,
      });

      await userRepository.save(newUser);

      const roleName = worker.userType === UserType.DRIVER ? 'Livreur' : worker.userType === UserType.STATION_AGENT ? 'Agent de gare' : 'Travailleur';
      console.log(`✅ ${roleName} créé:`);
      console.log(`   Nom: ${worker.firstName} ${worker.lastName}`);
      console.log(`   Téléphone: ${worker.phone}`);
      console.log(`   Mot de passe: ${worker.password}`);
      console.log(`   Email: ${worker.email || 'N/A'}`);
      console.log('');
    }

    console.log('✅ Tous les utilisateurs de test ont été créés avec succès!\n');
    console.log('📋 Récapitulatif des identifiants:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testWorkers.forEach((worker, index) => {
      const role = worker.userType === UserType.DRIVER ? 'Livreur' : worker.userType === UserType.STATION_AGENT ? 'Agent de gare' : 'Travailleur';
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
createTestWorkers()
  .then(() => {
    console.log('✨ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });

