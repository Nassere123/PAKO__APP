import { Injectable, Logger } from '@nestjs/common';
import { ConnectionPoolService } from './connection-pool.service';
import { ConnectionMonitorService } from './connection-monitor.service';

export interface DatabaseHealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  connectionPool: {
    isHealthy: boolean;
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    waitingConnections: number;
    utilization: number;
  };
  performance: {
    averageResponseTime: number;
    lastResponseTime: number;
  };
  recommendations: string[];
}

@Injectable()
export class DatabaseHealthCheckService {
  private readonly logger = new Logger(DatabaseHealthCheckService.name);

  constructor(
    private connectionPoolService: ConnectionPoolService,
    private connectionMonitorService: ConnectionMonitorService,
  ) {}

  async getHealthStatus(): Promise<DatabaseHealthStatus> {
    try {
      const startTime = Date.now();
      const isHealthy = await this.connectionPoolService.isConnectionHealthy();
      const responseTime = Date.now() - startTime;
      
      const poolStats = await this.connectionPoolService.getPoolStats();
      const healthStatus = this.connectionMonitorService.getHealthStatus();
      const latestMetrics = this.connectionMonitorService.getLatestMetrics();
      
      const utilization = (poolStats.activeCount / poolStats.maxConnections) * 100;
      
      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      const recommendations: string[] = [];
      
      if (!isHealthy) {
        status = 'unhealthy';
        recommendations.push('La base de données n\'est pas accessible');
      } else if (utilization > 80) {
        status = 'degraded';
        recommendations.push('Utilisation élevée des connexions');
      }
      
      if (responseTime > 1000) {
        status = status === 'healthy' ? 'degraded' : status;
        recommendations.push('Temps de réponse élevé');
      }
      
      if (poolStats.waitingCount > 5) {
        status = status === 'healthy' ? 'degraded' : status;
        recommendations.push('Trop de connexions en attente');
      }
      
      // Ajouter les recommandations du monitor
      recommendations.push(...healthStatus.recommendations);
      
      return {
        status,
        timestamp: new Date(),
        connectionPool: {
          isHealthy,
          totalConnections: poolStats.totalCount,
          activeConnections: poolStats.activeCount,
          idleConnections: poolStats.idleCount,
          waitingConnections: poolStats.waitingCount,
          utilization,
        },
        performance: {
          averageResponseTime: healthStatus.averageResponseTime,
          lastResponseTime: responseTime,
        },
        recommendations: [...new Set(recommendations)], // Supprimer les doublons
      };
    } catch (error) {
      this.logger.error('Erreur lors de la vérification de santé:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        connectionPool: {
          isHealthy: false,
          totalConnections: 0,
          activeConnections: 0,
          idleConnections: 0,
          waitingConnections: 0,
          utilization: 0,
        },
        performance: {
          averageResponseTime: 0,
          lastResponseTime: 0,
        },
        recommendations: ['Erreur lors de la vérification de santé'],
      };
    }
  }

  async getDetailedMetrics() {
    const metrics = this.connectionMonitorService.getMetrics();
    const healthStatus = this.connectionMonitorService.getHealthStatus();
    
    return {
      metrics,
      healthStatus,
      poolStats: await this.connectionPoolService.getPoolStats(),
    };
  }

  async performConnectionTest(): Promise<{
    success: boolean;
    responseTime: number;
    error?: string;
  }> {
    try {
      const startTime = Date.now();
      await this.connectionPoolService.query('SELECT 1');
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        responseTime,
      };
    } catch (error) {
      return {
        success: false,
        responseTime: 0,
        error: error.message,
      };
    }
  }
}
