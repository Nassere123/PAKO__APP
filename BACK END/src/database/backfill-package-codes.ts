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

const generatePackageCode = (orderNumber: string | null, packageId: string, index: number): string => {
  const sanitizedOrder =
    (orderNumber || 'PKG')
      .replace(/[^A-Z0-9]/gi, '')
      .toUpperCase()
      .slice(0, 10) || 'PKG';
  const shortId = packageId?.split('-')[0]?.toUpperCase() ?? 'PKG';
  const timestamp = Date.now().toString().slice(-6);
  const suffix = (index + 1).toString().padStart(3, '0');

  return `${sanitizedOrder}-${shortId}-${timestamp}-${suffix}`.slice(0, 50);
};

async function backfillPackageCodes() {
  console.log('🚀 Backfill des codes colis manquants...\n');

  let app;
  try {
    app = await NestFactory.createApplicationContext(AppModule);
    const connectionPoolService = app.get(ConnectionPoolService);

    console.log('✅ Connexion à la base de données établie');

    const missingCodesResult = await connectionPoolService.query(`
      SELECT 
        p.id,
        p."packageCode",
        o."orderNumber"
      FROM packages p
      LEFT JOIN orders o ON o.id = p."orderId"
      WHERE p."packageCode" IS NULL
         OR p."packageCode" = ''
    `);

    const rows = toRows(missingCodesResult);
    console.log(`   ➤ ${rows.length} colis sans code détectés`);

    if (rows.length === 0) {
      console.log('   ℹ️  Aucun code à générer');
      await app.close();
      return;
    }

    for (let index = 0; index < rows.length; index += 1) {
      const pkg = rows[index];
      const newCode = generatePackageCode(pkg.orderNumber, pkg.id, index);

      await connectionPoolService.query(
        `
        UPDATE packages
        SET "packageCode" = $1,
            "updatedAt" = NOW()
        WHERE id = $2
      `,
        [newCode, pkg.id],
      );

      console.log(`   ✅ Code généré pour le colis ${pkg.id}: ${newCode}`);
    }

    console.log('\n🎉 Backfill terminé avec succès !');
    await app.close();
  } catch (error) {
    console.error('❌ Erreur lors du backfill des codes colis:', error);
    if (app) {
      await app.close();
    }
    process.exit(1);
  }
}

if (require.main === module) {
  backfillPackageCodes();
}

export { backfillPackageCodes };


