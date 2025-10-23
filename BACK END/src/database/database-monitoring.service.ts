import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConnectionPoolService } from './connection-pool.service';
import { QueryOptimizerService } from './query-optimizer.service';

export interface DatabaseMetrics {
  timestamp: Date;
  connectionPool: {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    waitingConnections: number;
    utilization: number;
  };
  performance: {
    averageQueryTime: number;
    slowQueries: number;
    failedQueries: number;
    totalQueries: number;
  };
  health: {
    isHealthy: boolean;
    responseTime: number;
    lastError?: string;
  };
}

@Injectable()
export class DatabaseMonitoringService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseMonitoringService.name);
  private metrics: DatabaseMetrics[] = [];
  private readonly maxMetricsHistory = 1000;

  constructor(
    private connectionPoolService: ConnectionPoolService,
    private queryOptimizerService: QueryOptimizerService,
  ) {}

  async onModuleInit() {
    this.logger.log('Service de monitoring de base de données initialisé');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async collectMetrics() {
    try {
      const startTime = Date.now();
      
      // Vérifier la santé de la connexion
      const isHealthy = await this.connectionPoolService.isConnectionHealthy();
      const responseTime = Date.now() - startTime;
      
      // Récupérer les statistiques du pool
      const poolStats = await this.connectionPoolService.getPoolStats();
      
      // Récupérer les statistiques des requêtes
      const queryReport = this.queryOptimizerService.getQueryPerformanceReport();
      
      const metric: DatabaseMetrics = {
        timestamp: new Date(),
        connectionPool: {
          totalConnections: poolStats.totalCount,
          activeConnections: poolStats.activeCount,
          idleConnections: poolStats.idleCount,
          waitingConnections: poolStats.waitingCount,
          utilization: (poolStats.activeCount / poolStats.maxConnections) * 100,
        },
        performance: {
          averageQueryTime: queryReport.averageExecutionTime,
          slowQueries: queryReport.slowQueries,
          failedQueries: queryReport.failedQueries,
          totalQueries: queryReport.totalQueries,
        },
        health: {
          isHealthy,
          responseTime,
        },
      };

      this.metrics.push(metric);
      
      // Garder seulement les dernières métriques
      if (this.metrics.length > this.maxMetricsHistory) {
        this.metrics = this.metrics.slice(-this.maxMetricsHistory);
      }

      // Alertes automatiques
      await this.checkAlerts(metric);
      
    } catch (error) {
      this.logger.error('Erreur lors de la collecte des métriques:', error);
    }
  }

  private async checkAlerts(metric: DatabaseMetrics) {
    const alerts: string[] = [];

    // Alerte sur l'utilisation des connexions
    if (metric.connectionPool.utilization > 90) {
      alerts.push('Utilisation critique des connexions (>90%)');
    }

    // Alerte sur les requêtes lentes
    if (metric.performance.averageQueryTime > 2000) {
      alerts.push('Temps de réponse moyen élevé (>2s)');
    }

    // Alerte sur les requêtes échouées
    if (metric.performance.failedQueries > 10) {
      alerts.push('Trop de requêtes échouées (>10)');
    }

    // Alerte sur la santé de la base
    if (!metric.health.isHealthy) {
      alerts.push('Base de données non accessible');
    }

    // Alerte sur le temps de réponse
    if (metric.health.responseTime > 5000) {
      alerts.push('Temps de réponse de la base de données élevé (>5s)');
    }

    // Log des alertes
    if (alerts.length > 0) {
      this.logger.warn('Alertes de base de données:', {
        alerts,
        metrics: metric,
      });
    }
  }

  getMetrics(): DatabaseMetrics[] {
    return [...this.metrics];
  }

  getLatestMetrics(): DatabaseMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getAverageMetrics(): {
    averageUtilization: number;
    averageResponseTime: number;
    averageQueryTime: number;
    totalAlerts: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageUtilization: 0,
        averageResponseTime: 0,
        averageQueryTime: 0,
        totalAlerts: 0,
      };
    }

    const totalUtilization = this.metrics.reduce((sum, m) => sum + m.connectionPool.utilization, 0);
    const totalResponseTime = this.metrics.reduce((sum, m) => sum + m.health.responseTime, 0);
    const totalQueryTime = this.metrics.reduce((sum, m) => sum + m.performance.averageQueryTime, 0);
    const totalAlerts = this.metrics.filter(m => !m.health.isHealthy).length;

    return {
      averageUtilization: totalUtilization / this.metrics.length,
      averageResponseTime: totalResponseTime / this.metrics.length,
      averageQueryTime: totalQueryTime / this.metrics.length,
      totalAlerts,
    };
  }

  getPerformanceReport(): {
    currentMetrics: DatabaseMetrics | null;
    averageMetrics: any;
    recommendations: string[];
    healthScore: number;
  } {
    const current = this.getLatestMetrics();
    const average = this.getAverageMetrics();
    const recommendations: string[] = [];

    // Calculer le score de santé (0-100)
    let healthScore = 100;
    
    if (current) {
      if (!current.health.isHealthy) healthScore -= 50;
      if (current.connectionPool.utilization > 80) healthScore -= 20;
      if (current.performance.averageQueryTime > 1000) healthScore -= 15;
      if (current.health.responseTime > 2000) healthScore -= 15;
    }

    // Générer des recommandations
    if (average.averageUtilization > 70) {
      recommendations.push('Considérer augmenter la taille du pool de connexions');
    }
    
    if (average.averageQueryTime > 500) {
      recommendations.push('Optimiser les requêtes lentes');
    }
    
    if (average.totalAlerts > 5) {
      recommendations.push('Vérifier la stabilité de la base de données');
    }

    return {
      currentMetrics: current,
      averageMetrics: average,
      recommendations,
      healthScore: Math.max(0, healthScore),
    };
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async generatePerformanceReport() {
    const report = this.getPerformanceReport();
    
    this.logger.log('Rapport de performance de la base de données:', {
      healthScore: report.healthScore,
      currentUtilization: report.currentMetrics?.connectionPool.utilization,
      averageQueryTime: report.averageMetrics.averageQueryTime,
      recommendations: report.recommendations,
    });
  }

  async getDatabaseStats(): Promise<{
    tableStats: any[];
    indexStats: any[];
    connectionStats: any;
  }> {
    try {
      // Statistiques des tables
      const tableStats = await this.connectionPoolService.query(`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC
      `);

      // Statistiques des index
      const indexStats = await this.connectionPoolService.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched,
          idx_scan as scans
        FROM pg_stat_user_indexes
        ORDER BY idx_scan DESC
      `);

      // Statistiques des connexions
      const connectionStats = await this.connectionPoolService.query(`
        SELECT 
          state,
          COUNT(*) as count
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state
      `);

      return {
        tableStats: tableStats.rows,
        indexStats: indexStats.rows,
        connectionStats: connectionStats.rows,
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}
