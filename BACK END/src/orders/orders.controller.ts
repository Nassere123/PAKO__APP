import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Commandes')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les commandes' })
  @ApiResponse({ status: 200, description: 'Liste des commandes', type: [Order] })
  findAll() {
    return this.ordersService.findAll();
  }

  @Post('start-order-process')
  @ApiOperation({ summary: 'Démarrer le processus de commande' })
  @ApiResponse({ status: 200, description: 'Processus de commande démarré' })
  startOrderProcess(@Body() body: { customerId: string; customerName?: string }) {
    return this.ordersService.startOrderProcess(body.customerId, body.customerName);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une commande par ID' })
  @ApiResponse({ status: 200, description: 'Commande trouvée', type: Order })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle commande' })
  @ApiResponse({ status: 201, description: 'Commande créée', type: Order })
  create(@Body() createOrderDto: Partial<Order>) {
    return this.ordersService.create(createOrderDto);
  }

  @Post('with-packages')
  @ApiOperation({ summary: 'Créer une nouvelle commande avec des colis' })
  @ApiResponse({ status: 201, description: 'Commande créée avec colis', type: Order })
  createOrderWithPackages(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrderWithPackages(createOrderDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une commande' })
  @ApiResponse({ status: 200, description: 'Commande mise à jour', type: Order })
  update(@Param('id') id: string, @Body() updateOrderDto: Partial<Order>) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une commande' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour', type: Order })
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une commande' })
  @ApiResponse({ status: 200, description: 'Commande supprimée' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
