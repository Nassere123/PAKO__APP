import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ConnectionPoolService } from './connection-pool.service';

async function debugMissions() {
  let app;
  try {
    app = await NestFactory.createApplicationContext(AppModule);
    const connectionPoolService = app.get(ConnectionPoolService);

    const result = await connectionPoolService.query(`
      SELECT id, "missionNumber", status, "packageId", "deliveryPersonId", "createdAt", "assignedAt"
      FROM missions
      ORDER BY "createdAt" DESC
      LIMIT 20
    `);

    console.log('missions =>', result.rows ?? result);

    await app.close();
  } catch (error) {
    console.error('Erreur debug missions:', error);
    if (app) {
      await app.close();
    }
  }
}

debugMissions();


