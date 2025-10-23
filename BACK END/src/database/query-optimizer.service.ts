import { Injectable, Logger } from '@nestjs/common';
import { ConnectionPoolService } from './connection-pool.service';

export interface QueryStats {
  query: string;
  executionTime: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export interface OptimizedQueryResult<T = any> {
  data: T;
  executionTime: number;
  queryStats: QueryStats;
}

@Injectable()
export class QueryOptimizerService {
  private readonly logger = new Logger(QueryOptimizerService.name);
  private queryStats: QueryStats[] = [];
  private readonly maxStatsHistory = 1000;

  constructor(private connectionPoolService: ConnectionPoolService) {}

  async executeQuery<T = any>(
    query: string,
    params?: any[],
    options?: {
      timeout?: number;
      retries?: number;
      logQuery?: boolean;
    }
  ): Promise<OptimizedQueryResult<T>> {
    const startTime = Date.now();
    const { timeout = 30000, retries = 3, logQuery = false } = options || {};
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        if (logQuery) {
          this.logger.debug(`Exécution de la requête (tentative ${attempt}): ${query.substring(0, 100)}...`);
        }
        
        const result = await this.connectionPoolService.query(query, params);
        const executionTime = Date.now() - startTime;
        
        const queryStat: QueryStats = {
          query: query.substring(0, 200), // Limiter la taille pour le stockage
          executionTime,
          timestamp: new Date(),
          success: true,
        };
        
        this.addQueryStat(queryStat);
        
        if (executionTime > 1000) {
          this.logger.warn(`Requête lente détectée (${executionTime}ms): ${query.substring(0, 100)}...`);
        }
        
        return {
          data: result.rows || result,
          executionTime,
          queryStats: queryStat,
        };
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Tentative ${attempt} échouée pour la requête: ${error.message}`);
        
        if (attempt < retries) {
          // Attendre avant de réessayer (backoff exponentiel)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      }
    }
    
    const executionTime = Date.now() - startTime;
    const queryStat: QueryStats = {
      query: query.substring(0, 200),
      executionTime,
      timestamp: new Date(),
      success: false,
      error: lastError?.message,
    };
    
    this.addQueryStat(queryStat);
    this.logger.error(`Échec de la requête après ${retries} tentatives: ${lastError?.message}`);
    
    throw lastError;
  }

  async executeTransaction<T>(
    callback: (client: any) => Promise<T>,
    options?: {
      timeout?: number;
      retries?: number;
    }
  ): Promise<OptimizedQueryResult<T>> {
    const startTime = Date.now();
    const { timeout = 30000, retries = 3 } = options || {};
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await this.connectionPoolService.transaction(callback);
        const executionTime = Date.now() - startTime;
        
        return {
          data: result,
          executionTime,
          queryStats: {
            query: 'TRANSACTION',
            executionTime,
            timestamp: new Date(),
            success: true,
          },
        };
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Tentative ${attempt} de transaction échouée: ${error.message}`);
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      }
    }
    
    const executionTime = Date.now() - startTime;
    this.logger.error(`Échec de la transaction après ${retries} tentatives: ${lastError?.message}`);
    
    throw lastError;
  }

  async executeBatchQueries<T = any>(
    queries: Array<{ query: string; params?: any[] }>,
    options?: {
      parallel?: boolean;
      timeout?: number;
    }
  ): Promise<OptimizedQueryResult<T[]>> {
    const startTime = Date.now();
    const { parallel = false, timeout = 60000 } = options || {};
    
    try {
      let results: T[];
      
      if (parallel) {
        // Exécution en parallèle
        const promises = queries.map(({ query, params }) =>
          this.executeQuery<T>(query, params, { timeout: timeout / queries.length })
        );
        const queryResults = await Promise.all(promises);
        results = queryResults.map(result => result.data);
      } else {
        // Exécution séquentielle
        results = [];
        for (const { query, params } of queries) {
          const result = await this.executeQuery<T>(query, params, { timeout: timeout / queries.length });
          results.push(result.data);
        }
      }
      
      const executionTime = Date.now() - startTime;
      
      return {
        data: results,
        executionTime,
        queryStats: {
          query: `BATCH_QUERIES_${queries.length}`,
          executionTime,
          timestamp: new Date(),
          success: true,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error(`Échec de l'exécution en lot: ${error.message}`);
      
      throw error;
    }
  }

  private addQueryStat(stat: QueryStats) {
    this.queryStats.push(stat);
    
    // Garder seulement les dernières statistiques
    if (this.queryStats.length > this.maxStatsHistory) {
      this.queryStats = this.queryStats.slice(-this.maxStatsHistory);
    }
  }

  getQueryStats(): QueryStats[] {
    return [...this.queryStats];
  }

  getSlowQueries(threshold: number = 1000): QueryStats[] {
    return this.queryStats.filter(stat => stat.executionTime > threshold);
  }

  getFailedQueries(): QueryStats[] {
    return this.queryStats.filter(stat => !stat.success);
  }

  getAverageExecutionTime(): number {
    if (this.queryStats.length === 0) return 0;
    
    const totalTime = this.queryStats.reduce((sum, stat) => sum + stat.executionTime, 0);
    return totalTime / this.queryStats.length;
  }

  getQueryPerformanceReport(): {
    totalQueries: number;
    successfulQueries: number;
    failedQueries: number;
    averageExecutionTime: number;
    slowQueries: number;
    slowestQuery?: QueryStats;
    fastestQuery?: QueryStats;
  } {
    const totalQueries = this.queryStats.length;
    const successfulQueries = this.queryStats.filter(stat => stat.success).length;
    const failedQueries = totalQueries - successfulQueries;
    const averageExecutionTime = this.getAverageExecutionTime();
    const slowQueries = this.getSlowQueries().length;
    
    const sortedByTime = [...this.queryStats].sort((a, b) => b.executionTime - a.executionTime);
    const slowestQuery = sortedByTime[0];
    const fastestQuery = sortedByTime[sortedByTime.length - 1];
    
    return {
      totalQueries,
      successfulQueries,
      failedQueries,
      averageExecutionTime,
      slowQueries,
      slowestQuery,
      fastestQuery,
    };
  }
}
