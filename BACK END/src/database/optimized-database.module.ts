import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ConnectionPoolService } from './connection-pool.service';
import { ConnectionMonitorService } from './connection-monitor.service';

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
        synchronize: configService.get('NODE_ENV') === 'development',
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
          
          // Configuration des logs
          log: configService.get('NODE_ENV') === 'development' ? 
            (message: string) => console.log(`[DB] ${message}`) : undefined,
        },
        
        // Configuration des migrations
        migrationsTableName: 'typeorm_migrations',
        migrationsTransactionMode: 'each',
        
        // Configuration du cache
        cache: {
          type: 'redis',
          options: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
            password: configService.get('REDIS_PASSWORD'),
          },
          duration: configService.get('CACHE_DURATION', 300000), // 5 minutes
        },
        
        // Configuration des relations
        relationLoadStrategy: 'join',
        
        // Configuration des requêtes
        maxQueryExecutionTime: configService.get('DB_MAX_QUERY_TIME', 5000),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ConnectionPoolService, ConnectionMonitorService],
  exports: [ConnectionPoolService, ConnectionMonitorService],
})
export class OptimizedDatabaseModule {}
