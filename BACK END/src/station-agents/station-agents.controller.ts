import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { StationAgentsService } from './station-agents.service';
import { StationAgent } from './entities/station-agent.entity';

@ApiTags('Agents de gare')
@Controller('station-agents')
export class StationAgentsController {
  constructor(private readonly stationAgentsService: StationAgentsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les agents de gare' })
  @ApiResponse({ status: 200, description: 'Liste des agents récupérée avec succès' })
  async findAll(): Promise<StationAgent[]> {
    return this.stationAgentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un agent par ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'agent' })
  @ApiResponse({ status: 200, description: 'Agent récupéré avec succès' })
  @ApiResponse({ status: 404, description: 'Agent non trouvé' })
  async findOne(@Param('id') id: string): Promise<StationAgent> {
    return this.stationAgentsService.findOne(id);
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: 'Récupérer un agent par numéro de téléphone' })
  @ApiParam({ name: 'phone', description: 'Numéro de téléphone de l\'agent' })
  @ApiResponse({ status: 200, description: 'Agent récupéré avec succès' })
  async findByPhone(@Param('phone') phone: string): Promise<StationAgent | null> {
    return this.stationAgentsService.findByPhone(phone);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel agent de gare' })
  @ApiResponse({ status: 201, description: 'Agent créé avec succès' })
  async create(@Body() agentData: Partial<StationAgent>): Promise<StationAgent> {
    return this.stationAgentsService.create(agentData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un agent' })
  @ApiParam({ name: 'id', description: 'ID de l\'agent' })
  @ApiResponse({ status: 200, description: 'Agent mis à jour avec succès' })
  async update(
    @Param('id') id: string,
    @Body() agentData: Partial<StationAgent>,
  ): Promise<StationAgent> {
    return this.stationAgentsService.update(id, agentData);
  }

  @Put(':id/online-status')
  @ApiOperation({ summary: 'Mettre à jour le statut de connexion d\'un agent' })
  @ApiParam({ name: 'id', description: 'ID de l\'agent' })
  @ApiResponse({ status: 200, description: 'Statut de connexion mis à jour' })
  async updateOnlineStatus(
    @Param('id') id: string,
    @Body() body: { isOnline: boolean },
  ): Promise<StationAgent> {
    return this.stationAgentsService.updateOnlineStatus(id, body.isOnline);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un agent' })
  @ApiParam({ name: 'id', description: 'ID de l\'agent' })
  @ApiResponse({ status: 200, description: 'Agent supprimé avec succès' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.stationAgentsService.remove(id);
  }
}

