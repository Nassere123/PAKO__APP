import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StationsService } from './stations.service';
import { Station, StationStatus } from './entities/station.entity';

@ApiTags('Stations')
@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les stations' })
  @ApiResponse({ status: 200, description: 'Liste des stations', type: [Station] })
  findAll() {
    return this.stationsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Récupérer les stations actives' })
  @ApiResponse({ status: 200, description: 'Liste des stations actives', type: [Station] })
  findActive() {
    return this.stationsService.findActive();
  }

  @Get('city/:city')
  @ApiOperation({ summary: 'Récupérer les stations par ville' })
  @ApiResponse({ status: 200, description: 'Liste des stations de la ville', type: [Station] })
  findByCity(@Param('city') city: string) {
    return this.stationsService.findByCity(city);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une station par ID' })
  @ApiResponse({ status: 200, description: 'Station trouvée', type: Station })
  findOne(@Param('id') id: string) {
    return this.stationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle station' })
  @ApiResponse({ status: 201, description: 'Station créée', type: Station })
  create(@Body() createStationDto: Partial<Station>) {
    return this.stationsService.create(createStationDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une station' })
  @ApiResponse({ status: 200, description: 'Station mise à jour', type: Station })
  update(@Param('id') id: string, @Body() updateStationDto: Partial<Station>) {
    return this.stationsService.update(id, updateStationDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une station' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour', type: Station })
  updateStatus(@Param('id') id: string, @Body('status') status: StationStatus) {
    return this.stationsService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une station' })
  @ApiResponse({ status: 200, description: 'Station supprimée' })
  remove(@Param('id') id: string) {
    return this.stationsService.remove(id);
  }
}
