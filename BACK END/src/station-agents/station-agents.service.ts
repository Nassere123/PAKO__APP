import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StationAgent } from './entities/station-agent.entity';

@Injectable()
export class StationAgentsService {
  constructor(
    @InjectRepository(StationAgent)
    private stationAgentsRepository: Repository<StationAgent>,
  ) {}

  async findAll(): Promise<StationAgent[]> {
    return this.stationAgentsRepository.find();
  }

  async findOne(id: string): Promise<StationAgent> {
    const agent = await this.stationAgentsRepository.findOne({
      where: { id },
    });
    if (!agent) {
      throw new NotFoundException(`Agent de gare avec l'ID ${id} non trouvé`);
    }
    return agent;
  }

  async findByPhone(phone: string): Promise<StationAgent | null> {
    return this.stationAgentsRepository.findOne({
      where: { phone },
    });
  }

  async create(agentData: Partial<StationAgent>): Promise<StationAgent> {
    const agent = this.stationAgentsRepository.create(agentData);
    return this.stationAgentsRepository.save(agent);
  }

  async update(id: string, agentData: Partial<StationAgent>): Promise<StationAgent> {
    await this.stationAgentsRepository.update(id, agentData);
    return this.findOne(id);
  }

  async updateOnlineStatus(id: string, isOnline: boolean): Promise<StationAgent> {
    const updateData: Partial<StationAgent> = {
      isOnline,
    };
    
    if (isOnline) {
      updateData.lastLoginAt = new Date();
    } else {
      updateData.lastLogoutAt = new Date();
    }
    
    await this.stationAgentsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const agent = await this.findOne(id);
    await this.stationAgentsRepository.remove(agent);
  }
}

