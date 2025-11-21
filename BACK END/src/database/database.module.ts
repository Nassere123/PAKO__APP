import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ConnectionPoolService } from './connection-pool.service';
import { ConnectionMonitorService } from './connection-monitor.service';
import { DatabaseHealthCheckService } from './health-check.service';
import { QueryOptimizerService } from './query-optimizer.service';
import { OptimizedBaseService } from './optimized-base.service';
import { DatabaseMonitoringService } from './database-monitoring.service';
import { DatabaseController } from './database.controller';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'pako_user'),
        password: configService.get('DB_PASSWORD', 'pako_password'),
        database: configService.get('DB_NAME', 'pako_db'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false, // Temporairement désactivé pour éviter les conflits d'index
        logging: configService.get('NODE_ENV') === 'development',
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: false,
        
        // Configuration optimisée du pool de connexions
        extra: {
          // Configuration du pool de connexions
          max: configService.get('DB_POOL_MAX', 20),
          min: configService.get('DB_POOL_MIN', 5),
          idleTimeoutMillis: configService.get('DB_POOL_IDLE_TIMEOUT', 30000),
          connectionTimeoutMillis: configService.get('DB_POOL_CONNECTION_TIMEOUT', 10000),
          
          // Configuration SSL
          ssl: configService.get('DB_SSL', 'false') === 'true' ? {
            rejectUnauthorized: false
          } : false,
          
          // Configuration des requêtes
          statement_timeout: configService.get('DB_STATEMENT_TIMEOUT', 30000),
          query_timeout: configService.get('DB_QUERY_TIMEOUT', 30000),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [DatabaseController],
  providers: [ConnectionPoolService, ConnectionMonitorService, DatabaseHealthCheckService, QueryOptimizerService, OptimizedBaseService, DatabaseMonitoringService],
  exports: [ConnectionPoolService, ConnectionMonitorService, DatabaseHealthCheckService, QueryOptimizerService, OptimizedBaseService, DatabaseMonitoringService],
})
export class DatabaseModule {}
