import { AppDataSource } from './data-source';

/**
 * Script pour ajouter la valeur 'station_agent' à l'enum PostgreSQL
 * 
 * Usage: ts-node src/database/add-station-agent-enum.ts
 */

async function addStationAgentEnum() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await AppDataSource.initialize();
    console.log('✅ Connecté à la base de données');

    const queryRunner = AppDataSource.createQueryRunner();

    console.log('\n📝 Ajout de la valeur "station_agent" à l\'enum users_usertype_enum...\n');
    
    try {
      // Ajouter la valeur à l'enum PostgreSQL
      await queryRunner.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'station_agent' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'users_usertype_enum')
          ) THEN
            ALTER TYPE users_usertype_enum ADD VALUE 'station_agent';
          END IF;
        END $$;
      `);
      
      console.log('✅ La valeur "station_agent" a été ajoutée à l\'enum users_usertype_enum!\n');
    } catch (error: any) {
      console.log('⚠️  Erreur lors de l\'ajout de la valeur:', error.message);
      // Essayer une autre méthode
      try {
        await queryRunner.query(`ALTER TYPE users_usertype_enum ADD VALUE IF NOT EXISTS 'station_agent'`);
        console.log('✅ La valeur "station_agent" a été ajoutée (méthode alternative)!\n');
      } catch (error2: any) {
        console.log('❌ Impossible d\'ajouter la valeur. Erreur:', error2.message);
        console.log('💡 Vous pouvez exécuter manuellement dans PostgreSQL:');
        console.log('   ALTER TYPE users_usertype_enum ADD VALUE \'station_agent\';');
      }
    }

    await queryRunner.release();
    await AppDataSource.destroy();
    console.log('🔌 Déconnecté de la base de données');
    console.log('✨ Script terminé avec succès');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

addStationAgentEnum();

