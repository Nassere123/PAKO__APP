import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Mission, MissionStatus } from './entities/mission.entity';

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission)
    private missionsRepository: Repository<Mission>,
  ) {}

  async create(missionData: Partial<Mission>): Promise<Mission> {
    const mission = this.missionsRepository.create(missionData);
    return this.missionsRepository.save(mission);
  }

  async findAll(): Promise<Mission[]> {
    return this.missionsRepository.find({
      relations: ['deliveryPerson', 'package', 'package.order'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Mission> {
    const mission = await this.missionsRepository.findOne({
      where: { id },
      relations: ['deliveryPerson', 'package', 'package.order'],
    });
    if (!mission) {
      throw new NotFoundException(`Mission avec l'ID ${id} non trouvée`);
    }
    return mission;
  }

  async findByDriverId(driverId: string, statuses?: MissionStatus[]): Promise<Mission[]> {
    const where: any = {
      deliveryPersonId: driverId,
    };

    if (statuses && statuses.length > 0) {
      where.status = statuses.length === 1 ? statuses[0] : In(statuses);
    }

    return this.missionsRepository.find({
      where,
      relations: ['deliveryPerson', 'package', 'package.order'],
      order: {
        assignedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findByPackageId(packageId: string): Promise<Mission | null> {
    return this.missionsRepository.findOne({
      where: { packageId },
      relations: ['deliveryPerson', 'package', 'package.order'],
    });
  }

  async update(id: string, missionData: Partial<Mission>): Promise<Mission> {
    await this.missionsRepository.update(id, missionData);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: MissionStatus): Promise<Mission> {
    const mission = await this.findOne(id);
    
    const updateData: Partial<Mission> = { status };
    
    if (status === MissionStatus.IN_PROGRESS && !mission.startedAt) {
      updateData.startedAt = new Date();
    }
    
    if (status === MissionStatus.COMPLETED && !mission.completedAt) {
      updateData.completedAt = new Date();
    }

    await this.missionsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const mission = await this.findOne(id);
    await this.missionsRepository.remove(mission);
  }

  async generateMissionNumber(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      // Format: MIS-YYMMDDHHMMSS-XXX (max 20 caractères)
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
      const missionNumber = `MIS-${year}${month}${day}${hours}${minutes}${seconds}-${random}`;
      
      // Vérifier si le numéro existe déjà
      const existing = await this.missionsRepository.findOne({
        where: { missionNumber },
      });
      
      if (!existing) {
        return missionNumber;
      }
      
      attempts++;
      // Attendre 1 seconde avant de réessayer pour éviter les collisions
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Si tous les essais ont échoué, utiliser un UUID tronqué
    const uuid = uuidv4();
    return `MIS-${uuid.substring(0, 16).toUpperCase()}`;
  }
}

