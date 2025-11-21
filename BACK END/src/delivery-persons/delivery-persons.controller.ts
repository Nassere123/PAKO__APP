import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DeliveryPersonsService } from './delivery-persons.service';
import { DeliveryPerson, DeliveryPersonStatus } from './entities/delivery-person.entity';

@ApiTags('Livreurs')
@Controller('delivery-persons')
export class DeliveryPersonsController {
  constructor(private readonly deliveryPersonsService: DeliveryPersonsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les livreurs' })
  @ApiResponse({ status: 200, description: 'Liste des livreurs récupérée avec succès' })
  async findAll(): Promise<DeliveryPerson[]> {
    return this.deliveryPersonsService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Récupérer les livreurs disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des livreurs disponibles' })
  async findAvailable(): Promise<DeliveryPerson[]> {
    return this.deliveryPersonsService.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un livreur par ID' })
  @ApiParam({ name: 'id', description: 'ID du livreur' })
  @ApiResponse({ status: 200, description: 'Livreur récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Livreur non trouvé' })
  async findOne(@Param('id') id: string): Promise<DeliveryPerson> {
    return this.deliveryPersonsService.findOne(id);
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: 'Récupérer un livreur par numéro de téléphone' })
  @ApiParam({ name: 'phone', description: 'Numéro de téléphone du livreur' })
  @ApiResponse({ status: 200, description: 'Livreur récupéré avec succès' })
  async findByPhone(@Param('phone') phone: string): Promise<DeliveryPerson | null> {
    return this.deliveryPersonsService.findByPhone(phone);
  }

  @Put(':id/online-status')
  @ApiOperation({ summary: 'Mettre à jour le statut de connexion d\'un livreur' })
  @ApiParam({ name: 'id', description: 'ID du livreur' })
  @ApiResponse({ status: 200, description: 'Statut de connexion mis à jour' })
  async updateOnlineStatus(
    @Param('id') id: string,
    @Body() body: { isOnline: boolean },
  ): Promise<DeliveryPerson> {
    return this.deliveryPersonsService.updateOnlineStatus(id, body.isOnline);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau livreur' })
  @ApiResponse({ status: 201, description: 'Livreur créé avec succès' })
  async create(@Body() deliveryPersonData: Partial<DeliveryPerson>): Promise<DeliveryPerson> {
    return this.deliveryPersonsService.create(deliveryPersonData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un livreur' })
  @ApiParam({ name: 'id', description: 'ID du livreur' })
  @ApiResponse({ status: 200, description: 'Livreur mis à jour avec succès' })
  async update(
    @Param('id') id: string,
    @Body() deliveryPersonData: Partial<DeliveryPerson>
  ): Promise<DeliveryPerson> {
    return this.deliveryPersonsService.update(id, deliveryPersonData);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un livreur' })
  @ApiParam({ name: 'id', description: 'ID du livreur' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: DeliveryPersonStatus }
  ): Promise<DeliveryPerson> {
    return this.deliveryPersonsService.updateStatus(id, body.status);
  }

  @Put(':id/location')
  @ApiOperation({ summary: 'Mettre à jour la localisation d\'un livreur' })
  @ApiParam({ name: 'id', description: 'ID du livreur' })
  @ApiResponse({ status: 200, description: 'Localisation mise à jour avec succès' })
  async updateLocation(
    @Param('id') id: string,
    @Body() body: { latitude: number; longitude: number }
  ): Promise<DeliveryPerson> {
    return this.deliveryPersonsService.updateLocation(id, body.latitude, body.longitude);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un livreur' })
  @ApiParam({ name: 'id', description: 'ID du livreur' })
  @ApiResponse({ status: 200, description: 'Livreur supprimé avec succès' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.deliveryPersonsService.remove(id);
    return { message: 'Livreur supprimé avec succès' };
  }

  // Endpoints spécifiques pour l'application livreur
  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Tableau de bord du livreur' })
  @ApiParam({ name: 'id', description: 'ID du livreur' })
  @ApiResponse({ status: 200, description: 'Tableau de bord récupéré avec succès' })
  async getDashboard(@Param('id') id: string) {
    return this.deliveryPersonsService.getDeliveryPersonDashboard(id);
  }

  @Get(':id/nearby-orders')
  @ApiOperation({ summary: 'Commandes à proximité du livreur' })
  @ApiParam({ name: 'id', description: 'ID du livreur' })
  @ApiQuery({ name: 'radius', description: 'Rayon de recherche en km', required: false })
  @ApiResponse({ status: 200, description: 'Commandes à proximité récupérées' })
  async getNearbyOrders(
    @Param('id') id: string,
    @Query('radius') radius?: number
  ) {
    return this.deliveryPersonsService.getNearbyOrders(id, radius);
  }

  @Put(':id/rating')
  @ApiOperation({ summary: 'Mettre à jour la note d\'un livreur' })
  @ApiParam({ name: 'id', description: 'ID du livreur' })
  @ApiResponse({ status: 200, description: 'Note mise à jour avec succès' })
  async updateRating(
    @Param('id') id: string,
    @Body() body: { rating: number }
  ): Promise<DeliveryPerson> {
    return this.deliveryPersonsService.updateDeliveryPersonRating(id, body.rating);
  }
}
