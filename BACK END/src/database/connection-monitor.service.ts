import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConnectionPoolService } from './connection-pool.service';

export interface ConnectionMetrics {
  timestamp: Date;
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
  maxConnections: number;
  minConnections: number;
  isHealthy: boolean;
  responseTime: number;
}

@Injectable()
export class ConnectionMonitorService implements OnModuleInit {
  private readonly logger = new Logger(ConnectionMonitorService.name);
  private metrics: ConnectionMetrics[] = [];
  private readonly maxMetricsHistory = 100; // Garder les 100 dernières métriques

  constructor(private connectionPoolService: ConnectionPoolService) {}

  async onModuleInit() {
    this.logger.log('Service de monitoring des connexions initialisé');
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async collectMetrics() {
    try {
      const startTime = Date.now();
      const isHealthy = await this.connectionPoolService.isConnectionHealthy();
      const responseTime = Date.now() - startTime;
      
      const stats = await this.connectionPoolService.getPoolStats();
      
      const metric: ConnectionMetrics = {
        timestamp: new Date(),
        totalConnections: stats.totalCount,
        activeConnections: stats.activeCount,
        idleConnections: stats.idleCount,
        waitingConnections: stats.waitingCount,
        maxConnections: stats.maxConnections,
        minConnections: stats.minConnections,
        isHealthy,
        responseTime,
      };

      this.metrics.push(metric);
      
      // Garder seulement les dernières métriques
      if (this.metrics.length > this.maxMetricsHistory) {
        this.metrics = this.metrics.slice(-this.maxMetricsHistory);
      }

      // Log des métriques si nécessaire
      if (!isHealthy || stats.waitingCount > 5) {
        this.logger.warn('Problème détecté dans le pool de connexions:', {
          isHealthy,
          waitingConnections: stats.waitingCount,
          activeConnections: stats.activeCount,
          totalConnections: stats.totalCount,
        });
      }
    } catch (error) {
      this.logger.error('Erreur lors de la collecte des métriques:', error);
    }
  }

  getMetrics(): ConnectionMetrics[] {
    return [...this.metrics];
  }

  getLatestMetrics(): ConnectionMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0;
    
    const totalTime = this.metrics.reduce((sum, metric) => sum + metric.responseTime, 0);
    return totalTime / this.metrics.length;
  }

  getHealthStatus(): {
    isHealthy: boolean;
    averageResponseTime: number;
    connectionUtilization: number;
    recommendations: string[];
  } {
    const latest = this.getLatestMetrics();
    if (!latest) {
      return {
        isHealthy: false,
        averageResponseTime: 0,
        connectionUtilization: 0,
        recommendations: ['Aucune donnée disponible'],
      };
    }

    const averageResponseTime = this.getAverageResponseTime();
    const connectionUtilization = (latest.activeConnections / latest.maxConnections) * 100;
    
    const recommendations: string[] = [];
    
    if (!latest.isHealthy) {
      recommendations.push('Vérifier la connectivité à la base de données');
    }
    
    if (averageResponseTime > 1000) {
      recommendations.push('Temps de réponse élevé - optimiser les requêtes');
    }
    
    if (connectionUtilization > 80) {
      recommendations.push('Utilisation élevée des connexions - considérer augmenter le pool');
    }
    
    if (latest.waitingConnections > 5) {
      recommendations.push('Trop de connexions en attente - augmenter la taille du pool');
    }

    return {
      isHealthy: latest.isHealthy,
      averageResponseTime,
      connectionUtilization,
      recommendations,
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async logHourlyReport() {
    const healthStatus = this.getHealthStatus();
    const latest = this.getLatestMetrics();
    
    this.logger.log('Rapport horaire du pool de connexions:', {
      isHealthy: healthStatus.isHealthy,
      averageResponseTime: healthStatus.averageResponseTime,
      connectionUtilization: healthStatus.connectionUtilization,
      currentConnections: latest ? {
        total: latest.totalConnections,
        active: latest.activeConnections,
        idle: latest.idleConnections,
        waiting: latest.waitingConnections,
      } : null,
      recommendations: healthStatus.recommendations,
    });
  }
}
