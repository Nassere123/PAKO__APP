import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Package, PackageStatus, PackageType } from './entities/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { MissionsService } from '../missions/missions.service';
import { MissionStatus } from '../missions/entities/mission.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packagesRepository: Repository<Package>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @Inject(forwardRef(() => MissionsService))
    private missionsService: MissionsService,
  ) {}

  async findAll(): Promise<Package[]> {
    return this.packagesRepository.find({
      relations: ['order'],
    });
  }

  async findOne(id: string): Promise<Package> {
    const package_ = await this.packagesRepository.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!package_) {
      throw new NotFoundException(`Colis avec l'ID ${id} non trouvé`);
    }
    return package_;
  }

  async findByTrackingCode(trackingCode: string): Promise<Package> {
    // Note: trackingCode n'existe plus dans la structure simplifiée
    // Utiliser packageCode à la place
    const package_ = await this.packagesRepository.findOne({
      where: { packageCode: trackingCode },
      relations: ['order'],
    });
    if (!package_) {
      throw new NotFoundException(`Colis avec le code ${trackingCode} non trouvé`);
    }
    return package_;
  }

  async create(packageData: Partial<Package>): Promise<Package> {
    const package_ = this.packagesRepository.create(packageData);
    return this.packagesRepository.save(package_);
  }

  async createPackage(createPackageDto: CreatePackageDto): Promise<Package> {
    // Vérifier si le code de colis existe déjà
    const existingPackage = await this.packagesRepository.findOne({
      where: { packageCode: createPackageDto.packageCode }
    });

    if (existingPackage) {
      throw new BadRequestException(`Un colis avec le code ${createPackageDto.packageCode} existe déjà`);
    }

    const package_ = this.packagesRepository.create({
      orderId: createPackageDto.orderId,
      packageCode: createPackageDto.packageCode,
    });

    return this.packagesRepository.save(package_);
  }

  async findByOrderId(orderId: string): Promise<Package[]> {
    return this.packagesRepository.find({
      where: { orderId },
      relations: ['order'],
    });
  }

  async findByPackageCode(packageCode: string): Promise<Package> {
    if (!packageCode) {
      throw new BadRequestException('Code colis manquant');
    }

    const package_ = await this.packagesRepository.findOne({
      where: { packageCode },
      relations: ['order'],
    });
    if (package_) {
      return package_;
    }

    // Fallback pour les anciens colis qui utilisaient le numéro de commande comme code
    const legacyPackage = await this.findPackageByOrderNumber(packageCode);
    if (legacyPackage) {
      return legacyPackage;
    }

    throw new NotFoundException(`Colis avec le code ${packageCode} non trouvé`);
  }

  async update(id: string, packageData: Partial<Package>): Promise<Package> {
    await this.packagesRepository.update(id, packageData);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: PackageStatus): Promise<Package> {
    await this.packagesRepository.update(id, { status });
    const updatedPackage = await this.findOne(id);

    // Synchroniser le statut de la mission associée
    try {
      const mission = await this.missionsService.findByPackageId(id);
      if (mission) {
        let missionStatus: MissionStatus;
        switch (status) {
          case PackageStatus.IN_DELIVERY:
            missionStatus = MissionStatus.IN_PROGRESS;
            break;
          case PackageStatus.DELIVERED:
            missionStatus = MissionStatus.COMPLETED;
            break;
          case PackageStatus.CANCELLED:
            missionStatus = MissionStatus.CANCELLED;
            break;
          case PackageStatus.ASSIGNED:
            missionStatus = MissionStatus.ASSIGNED;
            break;
          default:
            // Ne pas modifier la mission pour les autres statuts
            return updatedPackage;
        }
        await this.missionsService.updateStatus(mission.id, missionStatus);
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation de la mission:', error);
      // Ne pas bloquer la mise à jour du colis si la mission échoue
    }

    return updatedPackage;
  }

  async markAsReadyForDelivery(packageCode: string): Promise<Package> {
    if (!packageCode || packageCode.trim() === '' || packageCode === 'code') {
      throw new BadRequestException(`Code colis invalide: "${packageCode}"`);
    }

    const package_ = await this.findByPackageCode(packageCode);
    if (!package_) {
      throw new NotFoundException(`Colis avec le code ${packageCode} non trouvé`);
    }

    if (!package_.id) {
      throw new BadRequestException(`Colis invalide: ID manquant pour le code ${packageCode}`);
    }

    if (package_.status === PackageStatus.CANCELLED) {
      throw new BadRequestException('Ce colis est annulé');
    }

    await this.packagesRepository.update(package_.id, { 
      status: PackageStatus.READY_FOR_DELIVERY,
      assignedDriverId: null,
      assignedDriverName: null,
      assignedAt: null,
    });
    return this.findOne(package_.id);
  }

  async assignToDriver(packageCode: string, driverId: string, driverName?: string): Promise<Package> {
    const package_ = await this.findByPackageCode(packageCode);

    if (![PackageStatus.READY_FOR_DELIVERY, PackageStatus.RECEIVED, PackageStatus.VERIFIED].includes(package_.status)) {
      throw new BadRequestException(`Le colis ${packageCode} n'est pas prêt pour attribution (statut actuel: ${package_.status})`);
    }

    const assignedAt = new Date();

    await this.packagesRepository.update(package_.id, {
      status: PackageStatus.ASSIGNED,
      assignedDriverId: driverId,
      assignedDriverName: driverName,
      assignedAt,
    });

    // Créer une mission pour ce colis assigné (si elle n'existe pas déjà)
    try {
      const existingMission = await this.missionsService.findByPackageId(package_.id);
      if (!existingMission) {
        const missionNumber = await this.missionsService.generateMissionNumber();
        await this.missionsService.create({
          missionNumber,
          packageId: package_.id,
          deliveryPersonId: driverId,
          deliveryPersonName: driverName,
          status: MissionStatus.ASSIGNED,
          assignedAt,
        });
        console.log(`✅ Mission créée pour le colis ${packageCode}`);
      } else {
        // Mettre à jour la mission existante si nécessaire
        if (existingMission.deliveryPersonId !== driverId) {
          await this.missionsService.update(existingMission.id, {
            deliveryPersonId: driverId,
            deliveryPersonName: driverName,
            status: MissionStatus.ASSIGNED,
            assignedAt,
          });
          console.log(`✅ Mission mise à jour pour le colis ${packageCode}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création/mise à jour de la mission:', error);
      // Ne pas bloquer l'assignation si la création de mission échoue
    }

    return this.findOne(package_.id);
  }

  async findByDriverId(driverId: string, statuses?: PackageStatus[]): Promise<Package[]> {
    const where: any = {
      assignedDriverId: driverId,
    };

    if (statuses && statuses.length > 0) {
      where.status = In(statuses);
    }

    return this.packagesRepository.find({
      where,
      relations: ['order'],
      order: {
        assignedAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  async remove(id: string): Promise<void> {
    const package_ = await this.findOne(id);
    await this.packagesRepository.remove(package_);
  }

  private async findPackageByOrderNumber(orderNumber: string): Promise<Package | null> {
    if (!orderNumber) {
      return null;
    }

    const order = await this.ordersRepository.findOne({
      where: { orderNumber },
      relations: ['packages'],
    });

    if (!order || !order.packages || order.packages.length === 0) {
      return null;
    }

    const fallbackPackage = order.packages[0];
    if (!fallbackPackage.packageCode) {
      const generatedCode = this.generateLegacyPackageCode(orderNumber, fallbackPackage.id);
      await this.packagesRepository.update(fallbackPackage.id, { packageCode: generatedCode });
      fallbackPackage.packageCode = generatedCode;
    }

    return this.packagesRepository.findOne({
      where: { id: fallbackPackage.id },
      relations: ['order'],
    });
  }

  private generateLegacyPackageCode(orderNumber: string, packageId: string): string {
    const sanitizedOrder = (orderNumber || 'PKG').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 12) || 'PKG';
    const shortId = packageId?.split('-')[0]?.toUpperCase() ?? 'PKG';
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${sanitizedOrder}-${shortId}-${random}`.slice(0, 50);
  }
}
