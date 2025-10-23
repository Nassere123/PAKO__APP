import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConnectionPoolService } from './connection-pool.service';
import { ConnectionMonitorService } from './connection-monitor.service';
import { DatabaseHealthCheckService } from './health-check.service';
import { QueryOptimizerService } from './query-optimizer.service';
import { DatabaseMonitoringService } from './database-monitoring.service';

@ApiTags('Base de Données')
@Controller('database')
export class DatabaseController {
  constructor(
    private connectionPoolService: ConnectionPoolService,
    private connectionMonitorService: ConnectionMonitorService,
    private databaseHealthCheckService: DatabaseHealthCheckService,
    private queryOptimizerService: QueryOptimizerService,
    private databaseMonitoringService: DatabaseMonitoringService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Vérifier la santé de la base de données' })
  @ApiResponse({ status: 200, description: 'Statut de santé de la base de données' })
  async getHealthStatus() {
    return this.databaseHealthCheckService.getHealthStatus();
  }

  @Get('pool/stats')
  @ApiOperation({ summary: 'Récupérer les statistiques du pool de connexions' })
  @ApiResponse({ status: 200, description: 'Statistiques du pool de connexions' })
  async getPoolStats() {
    return this.connectionPoolService.getPoolStats();
  }

  @Get('pool/metrics')
  @ApiOperation({ summary: 'Récupérer les métriques détaillées' })
  @ApiResponse({ status: 200, description: 'Métriques détaillées du pool' })
  async getDetailedMetrics() {
    return this.databaseHealthCheckService.getDetailedMetrics();
  }

  @Get('pool/metrics/history')
  @ApiOperation({ summary: 'Récupérer l\'historique des métriques' })
  @ApiResponse({ status: 200, description: 'Historique des métriques' })
  async getMetricsHistory() {
    return this.connectionMonitorService.getMetrics();
  }

  @Get('pool/metrics/latest')
  @ApiOperation({ summary: 'Récupérer les dernières métriques' })
  @ApiResponse({ status: 200, description: 'Dernières métriques' })
  async getLatestMetrics() {
    return this.connectionMonitorService.getLatestMetrics();
  }

  @Post('test-connection')
  @ApiOperation({ summary: 'Tester la connexion à la base de données' })
  @ApiResponse({ status: 200, description: 'Résultat du test de connexion' })
  async testConnection() {
    return this.databaseHealthCheckService.performConnectionTest();
  }

  @Get('performance')
  @ApiOperation({ summary: 'Récupérer les métriques de performance' })
  @ApiResponse({ status: 200, description: 'Métriques de performance' })
  async getPerformanceMetrics() {
    const healthStatus = this.connectionMonitorService.getHealthStatus();
    const latestMetrics = this.connectionMonitorService.getLatestMetrics();
    
    return {
      averageResponseTime: healthStatus.averageResponseTime,
      connectionUtilization: healthStatus.connectionUtilization,
      isHealthy: healthStatus.isHealthy,
      recommendations: healthStatus.recommendations,
      currentMetrics: latestMetrics,
    };
  }

  @Get('queries/stats')
  @ApiOperation({ summary: 'Récupérer les statistiques des requêtes' })
  @ApiResponse({ status: 200, description: 'Statistiques des requêtes' })
  async getQueryStats() {
    return this.queryOptimizerService.getQueryStats();
  }

  @Get('queries/performance')
  @ApiOperation({ summary: 'Rapport de performance des requêtes' })
  @ApiResponse({ status: 200, description: 'Rapport de performance' })
  async getQueryPerformanceReport() {
    return this.queryOptimizerService.getQueryPerformanceReport();
  }

  @Get('queries/slow')
  @ApiOperation({ summary: 'Récupérer les requêtes lentes' })
  @ApiResponse({ status: 200, description: 'Liste des requêtes lentes' })
  async getSlowQueries() {
    return this.queryOptimizerService.getSlowQueries();
  }

  @Get('queries/failed')
  @ApiOperation({ summary: 'Récupérer les requêtes échouées' })
  @ApiResponse({ status: 200, description: 'Liste des requêtes échouées' })
  async getFailedQueries() {
    return this.queryOptimizerService.getFailedQueries();
  }

  @Get('monitoring/metrics')
  @ApiOperation({ summary: 'Récupérer les métriques de monitoring' })
  @ApiResponse({ status: 200, description: 'Métriques de monitoring' })
  async getMonitoringMetrics() {
    return this.databaseMonitoringService.getMetrics();
  }

  @Get('monitoring/performance-report')
  @ApiOperation({ summary: 'Rapport de performance complet' })
  @ApiResponse({ status: 200, description: 'Rapport de performance' })
  async getPerformanceReport() {
    return this.databaseMonitoringService.getPerformanceReport();
  }

  @Get('monitoring/database-stats')
  @ApiOperation({ summary: 'Statistiques détaillées de la base de données' })
  @ApiResponse({ status: 200, description: 'Statistiques de la base de données' })
  async getDatabaseStats() {
    return this.databaseMonitoringService.getDatabaseStats();
  }
}
