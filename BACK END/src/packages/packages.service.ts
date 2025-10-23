import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package, PackageStatus, PackageType } from './entities/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packagesRepository: Repository<Package>,
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
    const package_ = await this.packagesRepository.findOne({
      where: { packageCode },
      relations: ['order'],
    });
    if (!package_) {
      throw new NotFoundException(`Colis avec le code ${packageCode} non trouvé`);
    }
    return package_;
  }

  async update(id: string, packageData: Partial<Package>): Promise<Package> {
    await this.packagesRepository.update(id, packageData);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: PackageStatus): Promise<Package> {
    await this.packagesRepository.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const package_ = await this.findOne(id);
    await this.packagesRepository.remove(package_);
  }
}
