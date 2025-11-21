import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Order, OrderStatus } from './entities/order.entity';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('start-order-process')
  @ApiOperation({ summary: 'Démarrer le processus de commande' })
  @ApiResponse({ status: 200, description: 'Processus démarré' })
  async startOrderProcess(
    @Body('customerId') customerId: string,
    @Body('customerName') customerName?: string
  ) {
    return this.ordersService.startOrderProcess(customerId, customerName);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle commande' })
  @ApiResponse({ status: 201, description: 'Commande créée avec succès', type: Order })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrderWithPackages(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les commandes' })
  @ApiResponse({ status: 200, description: 'Liste des commandes', type: [Order] })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Récupérer toutes les commandes d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Commandes de l\'utilisateur', type: [Order] })
  findByUserId(@Param('userId') userId: string) {
    return this.ordersService.findByUserId(userId);
  }

  @Get('counts/:userId')
  @ApiOperation({ summary: 'Récupérer les compteurs de colis par statut pour un utilisateur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Compteurs de colis par statut',
    schema: {
      type: 'object',
      properties: {
        delivered: { type: 'number', description: 'Nombre de colis livrés' },
        inProgress: { type: 'number', description: 'Nombre de colis en cours' },
        cancelled: { type: 'number', description: 'Nombre de colis annulés' },
        total: { type: 'number', description: 'Nombre total de colis' }
      }
    }
  })
  async getOrderCounts(@Param('userId') userId: string) {
    return this.ordersService.getOrderCountsByStatus(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une commande par ID' })
  @ApiResponse({ status: 200, description: 'Commande trouvée', type: Order })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une commande' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour', type: Order })
  @ApiParam({ name: 'id', description: 'ID de la commande' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto
  ) {
    console.log(`\n🔄 === MISE À JOUR STATUT COMMANDE ===`);
    console.log(`📦 Commande ID: ${id}`);
    console.log(`📊 Nouveau statut demandé: ${updateStatusDto.status}`);
    
    const updatedOrder = await this.ordersService.updateStatus(id, updateStatusDto.status);
    
    console.log(`✅ Statut mis à jour avec succès`);
    console.log(`📦 Commande: ${updatedOrder.orderNumber}`);
    console.log(`📊 Statut final: ${updatedOrder.status}`);
    console.log('=======================================\n');
    
    return updatedOrder;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une commande' })
  @ApiResponse({ status: 200, description: 'Commande supprimée' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}