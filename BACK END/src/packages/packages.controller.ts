import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PackagesService } from './packages.service';
import { Package, PackageStatus } from './entities/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';

@ApiTags('Colis')
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les colis' })
  @ApiResponse({ status: 200, description: 'Liste des colis', type: [Package] })
  findAll() {
    return this.packagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un colis par ID' })
  @ApiResponse({ status: 200, description: 'Colis trouvé', type: Package })
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  @Get('track/:trackingCode')
  @ApiOperation({ summary: 'Suivre un colis par code de suivi' })
  @ApiResponse({ status: 200, description: 'Colis trouvé', type: Package })
  findByTrackingCode(@Param('trackingCode') trackingCode: string) {
    return this.packagesService.findByTrackingCode(trackingCode);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau colis' })
  @ApiResponse({ status: 201, description: 'Colis créé', type: Package })
  create(@Body() createPackageDto: Partial<Package>) {
    return this.packagesService.create(createPackageDto);
  }

  @Post('create')
  @ApiOperation({ summary: 'Créer un nouveau colis avec validation' })
  @ApiResponse({ status: 201, description: 'Colis créé', type: Package })
  createPackage(@Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.createPackage(createPackageDto);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Récupérer tous les colis d\'une commande' })
  @ApiResponse({ status: 200, description: 'Liste des colis de la commande', type: [Package] })
  findByOrderId(@Param('orderId') orderId: string) {
    return this.packagesService.findByOrderId(orderId);
  }

  @Get('code/:packageCode')
  @ApiOperation({ summary: 'Récupérer un colis par son code' })
  @ApiResponse({ status: 200, description: 'Colis trouvé', type: Package })
  findByPackageCode(@Param('packageCode') packageCode: string) {
    return this.packagesService.findByPackageCode(packageCode);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un colis' })
  @ApiResponse({ status: 200, description: 'Colis mis à jour', type: Package })
  update(@Param('id') id: string, @Body() updatePackageDto: Partial<Package>) {
    return this.packagesService.update(id, updatePackageDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un colis' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour', type: Package })
  updateStatus(@Param('id') id: string, @Body('status') status: PackageStatus) {
    return this.packagesService.updateStatus(id, status);
  }

  @Patch('code/:packageCode/ready')
  @ApiOperation({ summary: 'Marquer un colis comme prêt pour livraison' })
  @ApiResponse({ status: 200, description: 'Colis marqué comme prêt', type: Package })
  markAsReadyForDelivery(@Param('packageCode') packageCode: string) {
    return this.packagesService.markAsReadyForDelivery(packageCode);
  }

  @Patch('code/:packageCode/assign')
  @ApiOperation({ summary: 'Assigner un colis à un livreur' })
  @ApiResponse({ status: 200, description: 'Colis assigné au livreur', type: Package })
  assignToDriver(
    @Param('packageCode') packageCode: string,
    @Body() payload: { driverId: string; driverName?: string },
  ) {
    return this.packagesService.assignToDriver(packageCode, payload.driverId, payload.driverName);
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Récupérer les colis assignés à un livreur' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Liste de statuts séparés par des virgules',
  })
  @ApiResponse({ status: 200, description: 'Liste des colis assignés', type: [Package] })
  findByDriver(
    @Param('driverId') driverId: string,
    @Query('status') status?: string,
  ) {
    const statuses = status
      ? status.split(',').map((s) => s.trim() as PackageStatus)
      : undefined;
    return this.packagesService.findByDriverId(driverId, statuses);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un colis' })
  @ApiResponse({ status: 200, description: 'Colis supprimé' })
  remove(@Param('id') id: string) {
    return this.packagesService.remove(id);
  }
}
