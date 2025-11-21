import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConnectionPoolService } from './connection-pool.service';

interface QueryResultRow {
  [key: string]: any;
}

const toRows = (result: any): QueryResultRow[] => {
  if (!result) {
    return [];
  }
  if (Array.isArray(result)) {
    return result;
  }
  if (Array.isArray(result.rows)) {
    return result.rows;
  }
  return [];
};

const generateMissionNumber = () => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `MIS-${timestamp}-${random}`;
};

const mapPackageStatusToMissionStatus = (status: string): string => {
  switch (status) {
    case 'in_delivery':
      return 'in_progress';
    case 'delivered':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    case 'assigned':
    case 'verified':
    case 'ready_for_delivery':
    case 'received':
    default:
      return 'assigned';
  }
};

async function migratePackageDriverIds() {
  console.log('🚀 Migration des colis assignés vers les nouveaux livreurs...\n');

  let app;
  try {
    app = await NestFactory.createApplicationContext(AppModule);
    const connectionPoolService = app.get(ConnectionPoolService);

    console.log('✅ Connexion à la base de données établie');

    // 1) Identifier les colis dont l\'assignedDriverId pointe encore vers l\'ancienne table users
    console.log('📋 Recherche des colis assignés avec un identifiant obsolète...');
    const mismatchedQuery = `
      SELECT 
        p.id AS "packageId",
        p."packageCode",
        p."assignedDriverId" AS "oldDriverId",
        u.phone AS "driverPhone",
        d.id AS "newDriverId",
        CONCAT(d."firstName", ' ', d."lastName") AS "newDriverName"
      FROM packages p
      JOIN users u ON u.id = p."assignedDriverId"
      JOIN drivers d ON d.phone = u.phone
      WHERE p."assignedDriverId" IS NOT NULL
        AND p."assignedDriverId" <> d.id
    `;

    const mismatchedResult = await connectionPoolService.query(mismatchedQuery);
    const mismatchedRows = toRows(mismatchedResult);

    console.log(`   ➤ ${mismatchedRows.length} colis à corriger`);

    if (mismatchedRows.length > 0) {
      console.log('🛠️  Mise à jour des identifiants de livreurs sur les colis...');
      const updateQuery = `
        UPDATE packages p
        SET 
          "assignedDriverId" = d.id,
          "assignedDriverName" = CONCAT(d."firstName", ' ', d."lastName"),
          "updatedAt" = NOW()
        FROM users u
        JOIN drivers d ON d.phone = u.phone
        WHERE p."assignedDriverId" = u.id
          AND p."assignedDriverId" <> d.id
          AND p."assignedDriverId" IS NOT NULL
      `;
      const updateResult = await connectionPoolService.query(updateQuery);
      const updatedCount = updateResult?.rowCount ?? mismatchedRows.length;
      console.log(`   ✅ ${updatedCount} colis mis à jour avec les nouveaux identifiants de livreur`);
    } else {
      console.log('   ℹ️  Aucun colis à corriger');
    }

    // 2) Créer les missions manquantes pour tous les colis assignés
    console.log('\n📦 Recherche des colis assignés sans mission associée...');
    
    // Vérifier si la table missions existe et si elle a la colonne packageId
    const checkMissionsTable = await connectionPoolService.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'missions'
      ) AS table_exists,
      EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'missions' 
        AND column_name = 'packageId'
      ) AS column_exists
    `);
    const result = toRows(checkMissionsTable);
    const missionsTableExists = result[0]?.table_exists || false;
    const packageIdColumnExists = result[0]?.column_exists || false;

    let packagesWithoutMissionQuery: string;
    if (missionsTableExists && packageIdColumnExists) {
      packagesWithoutMissionQuery = `
        SELECT 
          p.id AS "packageId",
          p."packageCode",
          p."assignedDriverId" AS "driverId",
          p."assignedDriverName" AS "driverName",
          p."assignedAt",
          p.status::text AS status
        FROM packages p
        LEFT JOIN missions m ON m."packageId" = p.id
        WHERE p."assignedDriverId" IS NOT NULL
          AND m.id IS NULL
      `;
    } else {
      // Si la table missions n'existe pas ou n'a pas la colonne packageId, récupérer tous les colis assignés
      // Ne pas filtrer par statut car l'enum peut ne pas contenir toutes les valeurs
      packagesWithoutMissionQuery = `
        SELECT 
          p.id AS "packageId",
          p."packageCode",
          p."assignedDriverId" AS "driverId",
          p."assignedDriverName" AS "driverName",
          p."assignedAt",
          p.status::text AS status
        FROM packages p
        WHERE p."assignedDriverId" IS NOT NULL
      `;
    }

    const packagesResult = await connectionPoolService.query(packagesWithoutMissionQuery);
    const packagesRows = toRows(packagesResult);

    console.log(`   ➤ ${packagesRows.length} mission(s) à créer`);

    if (packagesRows.length > 0) {
      for (const pkg of packagesRows) {
        const missionNumber = generateMissionNumber();
        const missionStatus = mapPackageStatusToMissionStatus(pkg.status);
        await connectionPoolService.query(
          `
          INSERT INTO missions (
            "missionNumber",
            status,
            "packageId",
            "deliveryPersonId",
            "assignedAt",
            "createdAt",
            "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          `,
          [
            missionNumber,
            missionStatus,
            pkg.packageId,
            pkg.driverId,
            pkg.assignedAt || new Date(),
          ],
        );
        console.log(
          `   ✅ Mission ${missionNumber} créée pour le colis ${pkg.packageCode} (livreur: ${pkg.driverName ?? pkg.driverId})`,
        );
      }
    } else {
      console.log('   ℹ️  Toutes les missions sont déjà créées');
    }

    console.log('\n🎉 Migration terminée avec succès !');
    await app.close();
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    if (app) {
      await app.close();
    }
    process.exit(1);
  }
}

if (require.main === module) {
  migratePackageDriverIds();
}

export { migratePackageDriverIds };


