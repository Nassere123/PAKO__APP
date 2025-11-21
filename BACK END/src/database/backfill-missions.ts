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
  // Format: MIS-YYMMDDHHMMSS-XXXX (max 20 caractères)
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `MIS-${year}${month}${day}${hours}${minutes}${seconds}-${random}`;
};

async function backfillMissions() {
  console.log('🚀 Backfill des missions à partir des colis assignés...\n');

  let app;
  try {
    app = await NestFactory.createApplicationContext(AppModule);
    const connectionPoolService = app.get(ConnectionPoolService);

    // Vérifier si la table missions existe et a la colonne packageId
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

    let packagesResult;
    if (missionsTableExists && packageIdColumnExists) {
      // Récupérer les colis assignés sans mission
      packagesResult = await connectionPoolService.query(`
        SELECT 
          p.id AS "packageId",
          p."packageCode",
          p."assignedDriverId",
          p."assignedDriverName",
          p."assignedAt",
          p.status
        FROM packages p
        LEFT JOIN missions m ON m."packageId" = p.id
        WHERE p."assignedDriverId" IS NOT NULL
          AND m.id IS NULL
      `);
    } else {
      // Si la table missions n'existe pas ou n'a pas la colonne, récupérer tous les colis assignés
      packagesResult = await connectionPoolService.query(`
        SELECT 
          p.id AS "packageId",
          p."packageCode",
          p."assignedDriverId",
          p."assignedDriverName",
          p."assignedAt",
          p.status
        FROM packages p
        WHERE p."assignedDriverId" IS NOT NULL
      `);
    }

    const packages = toRows(packagesResult);
    console.log(`   ➤ ${packages.length} mission(s) à créer`);

    if (packages.length === 0) {
      console.log('   ℹ️  Aucune mission à créer');
      await app.close();
      return;
    }

    for (const pkg of packages) {
      // Vérifier si le livreur existe dans la table drivers
      const driverCheck = await connectionPoolService.query(
        `SELECT id FROM drivers WHERE id = $1`,
        [pkg.assignedDriverId]
      );
      const driverRows = toRows(driverCheck);
      const driverExists = driverRows.length > 0;

      if (!driverExists) {
        console.log(`   ⚠️  Livreur ${pkg.assignedDriverId} n'existe pas pour le colis ${pkg.packageCode}, mission créée sans livreur`);
      }

      const missionNumber = generateMissionNumber();
      const status =
        pkg.status === 'delivered'
          ? 'completed'
          : pkg.status === 'in_delivery'
            ? 'in_progress'
            : 'assigned';

      // Récupérer le nom du livreur si le driver existe
      let driverName = pkg.assignedDriverName || null;
      if (driverExists && !driverName) {
        const driverInfo = await connectionPoolService.query(
          `SELECT "firstName", "lastName" FROM drivers WHERE id = $1`,
          [pkg.assignedDriverId]
        );
        const driverRows = toRows(driverInfo);
        if (driverRows.length > 0) {
          driverName = `${driverRows[0].firstName} ${driverRows[0].lastName}`;
        }
      }

      await connectionPoolService.query(
        `
        INSERT INTO missions (
          "missionNumber",
          status,
          "packageId",
          "deliveryPersonId",
          "deliveryPersonName",
          "assignedAt",
          "createdAt",
          "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `,
        [
          missionNumber,
          status,
          pkg.packageId,
          driverExists ? pkg.assignedDriverId : null,
          driverName,
          pkg.assignedAt || new Date(),
        ],
      );

      console.log(`   ✅ Mission ${missionNumber} créée pour le colis ${pkg.packageCode}`);
    }

    console.log('\n🎉 Backfill des missions terminé !');
    await app.close();
  } catch (error) {
    console.error('❌ Erreur lors du backfill des missions:', error);
    if (app) {
      await app.close();
    }
    process.exit(1);
  }
}

if (require.main === module) {
  backfillMissions();
}

export { backfillMissions };


