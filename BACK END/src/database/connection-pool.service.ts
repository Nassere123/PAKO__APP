import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, PoolConfig } from 'pg';

export interface ConnectionPoolStats {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
  activeCount: number;
  maxConnections: number;
  minConnections: number;
}

@Injectable()
export class ConnectionPoolService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConnectionPoolService.name);
  private pool: Pool;
  private isHealthy = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initializePool();
  }

  async onModuleDestroy() {
    await this.closePool();
  }

  private async initializePool() {
    const poolConfig: PoolConfig = {
      host: this.configService.get('DB_HOST', 'localhost'),
      port: this.configService.get('DB_PORT', 5432),
      database: this.configService.get('DB_NAME', 'pako_db'),
      user: this.configService.get('DB_USERNAME', 'pako_user'),
      password: this.configService.get('DB_PASSWORD', 'pako_password'),
      
      // Configuration du pool
      max: this.configService.get('DB_POOL_MAX', 20), // Maximum de connexions
      min: this.configService.get('DB_POOL_MIN', 5),  // Minimum de connexions
      idleTimeoutMillis: this.configService.get('DB_POOL_IDLE_TIMEOUT', 30000), // 30s
      connectionTimeoutMillis: this.configService.get('DB_POOL_CONNECTION_TIMEOUT', 10000), // 10s
      
      // Configuration SSL
      ssl: this.configService.get('DB_SSL', 'false') === 'true' ? {
        rejectUnauthorized: false
      } : false,
      
      // Configuration des requêtes
      statement_timeout: this.configService.get('DB_STATEMENT_TIMEOUT', 30000), // 30s
      query_timeout: this.configService.get('DB_QUERY_TIMEOUT', 30000), // 30s
      
      // Configuration des logs
      log: this.configService.get('NODE_ENV') === 'development' ? 
        (message: string) => this.logger.debug(message) : undefined,
    };

    this.pool = new Pool(poolConfig);

    // Gestion des événements du pool
    this.pool.on('connect', (client: PoolClient) => {
      this.logger.debug('Nouvelle connexion établie');
    });

    this.pool.on('error', (err: Error, client: PoolClient) => {
      this.logger.error('Erreur dans le pool de connexions:', err);
      this.isHealthy = false;
    });

    this.pool.on('remove', (client: PoolClient) => {
      this.logger.debug('Connexion supprimée du pool');
    });

    // Test de connexion initial
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.isHealthy = true;
      this.logger.log('Pool de connexions PostgreSQL initialisé avec succès');
    } catch (error) {
      this.logger.error('Erreur lors de l\'initialisation du pool:', error);
      this.isHealthy = false;
    }
  }

  async getClient(): Promise<PoolClient> {
    if (!this.isHealthy) {
      throw new Error('Pool de connexions non disponible');
    }
    return this.pool.connect();
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getPoolStats(): Promise<ConnectionPoolStats> {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      activeCount: this.pool.totalCount - this.pool.idleCount,
      maxConnections: this.pool.options.max || 20,
      minConnections: this.pool.options.min || 5,
    };
  }

  async isConnectionHealthy(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('Vérification de santé de la connexion échouée:', error);
      return false;
    }
  }

  async closePool(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('Pool de connexions fermé');
    }
  }

  getPool(): Pool {
    return this.pool;
  }
}
