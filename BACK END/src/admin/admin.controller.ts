import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Administration')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Récupérer les statistiques du tableau de bord' })
  @ApiResponse({ status: 200, description: 'Statistiques du tableau de bord' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('recent-orders')
  @ApiOperation({ summary: 'Récupérer les commandes récentes' })
  @ApiResponse({ status: 200, description: 'Liste des commandes récentes' })
  getRecentOrders(@Query('limit') limit?: number) {
    return this.adminService.getRecentOrders(limit);
  }

  @Get('top-delivery-persons')
  @ApiOperation({ summary: 'Récupérer les meilleurs livreurs' })
  @ApiResponse({ status: 200, description: 'Liste des meilleurs livreurs' })
  getTopDeliveryPersons(@Query('limit') limit?: number) {
    return this.adminService.getTopDeliveryPersons(limit);
  }
}