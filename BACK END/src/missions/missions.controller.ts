import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MissionsService } from './missions.service';
import { Mission, MissionStatus } from './entities/mission.entity';

@ApiTags('Missions')
@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle mission' })
  @ApiResponse({ status: 201, description: 'Mission créée', type: Mission })
  create(@Body() createMissionDto: Partial<Mission>) {
    return this.missionsService.create(createMissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les missions' })
  @ApiResponse({ status: 200, description: 'Liste des missions', type: [Mission] })
  findAll() {
    return this.missionsService.findAll();
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Récupérer les missions d\'un livreur' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Statut de la mission',
    enum: MissionStatus,
  })
  @ApiResponse({ status: 200, description: 'Liste des missions du livreur', type: [Mission] })
  findByDriver(
    @Param('driverId') driverId: string,
    @Query('status') status?: MissionStatus,
  ) {
    const statuses = status ? [status] : undefined;
    return this.missionsService.findByDriverId(driverId, statuses);
  }

  @Get('package/:packageId')
  @ApiOperation({ summary: 'Récupérer la mission d\'un colis' })
  @ApiResponse({ status: 200, description: 'Mission trouvée', type: Mission })
  findByPackage(@Param('packageId') packageId: string) {
    return this.missionsService.findByPackageId(packageId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une mission par ID' })
  @ApiResponse({ status: 200, description: 'Mission trouvée', type: Mission })
  findOne(@Param('id') id: string) {
    return this.missionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une mission' })
  @ApiResponse({ status: 200, description: 'Mission mise à jour', type: Mission })
  update(@Param('id') id: string, @Body() updateMissionDto: Partial<Mission>) {
    return this.missionsService.update(id, updateMissionDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une mission' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour', type: Mission })
  updateStatus(@Param('id') id: string, @Body('status') status: MissionStatus) {
    return this.missionsService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une mission' })
  @ApiResponse({ status: 200, description: 'Mission supprimée' })
  remove(@Param('id') id: string) {
    return this.missionsService.remove(id);
  }
}

