import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User, UserType, UserStatus } from '../users/entities/user.entity';

/**
 * Script qui utilise TypeORM synchronize pour créer automatiquement la colonne password
 * puis crée les utilisateurs de test
 * 
 * Usage: ts-node src/database/setup-with-sync.ts
 */

const configService = new ConfigService();

// Créer une DataSource temporaire avec synchronize activé
const tempDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'pako_user'),
  password: configService.get('DB_PASSWORD', 'pako_password'),
  database: configService.get('DB_NAME', 'pako_db'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Activer temporairement pour créer la colonne
  logging: false,
});

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
    phone: '+2250501234567',
    password: 'Agent123!',
    userType: UserType.DRIVER,
    email: 'kone.aicha@pako.ci',
  },
  {
    firstName: 'Ouattara',
    lastName: 'Bruno',
    phone: '+2250502345678',
    password: 'Agent123!',
    userType: UserType.DRIVER,
    email: 'ouattara.bruno@pako.ci',
  },
];

async function setupWithSync() {
  try {
    console.log('🔄 Connexion à la base de données avec synchronize...');
    await tempDataSource.initialize();
    console.log('✅ Connecté à la base de données');
    console.log('📝 TypeORM va synchroniser le schéma (créer la colonne password si nécessaire)...\n');

    // TypeORM va automatiquement créer la colonne password grâce à synchronize
    // Attendre un peu pour que la synchronisation se fasse
    await new Promise(resolve => setTimeout(resolve, 1000));

    const userRepository = tempDataSource.getRepository(User);

    console.log('📝 Création des utilisateurs de test...\n');

    for (const worker of testWorkers) {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await userRepository
        .createQueryBuilder('user')
        .where('user.phone = :phone', { phone: worker.phone })
        .select(['user.id', 'user.phone', 'user.firstName', 'user.lastName'])
        .getOne();

      if (existingUser) {
        console.log(`⚠️  Utilisateur ${worker.firstName} ${worker.lastName} (${worker.phone}) existe déjà. Ignoré.`);
        continue;
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

      console.log(`✅ ${worker.userType === UserType.DRIVER ? 'Livreur' : 'Agent'} créé:`);
      console.log(`   ID: ${newUser.id}`);
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
      const role = worker.userType === UserType.DRIVER ? 'Livreur' : 'Agent';
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
    if (tempDataSource.isInitialized) {
      await tempDataSource.destroy();
      console.log('🔌 Déconnecté de la base de données');
    }
  }
}

// Exécuter le script
setupWithSync()
  .then(() => {
    console.log('✨ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });

