import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station, StationStatus } from './entities/station.entity';

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station)
    private stationsRepository: Repository<Station>,
  ) {}

  async findAll(): Promise<Station[]> {
    return this.stationsRepository.find();
  }

  async findOne(id: string): Promise<Station> {
    const station = await this.stationsRepository.findOne({ where: { id } });
    if (!station) {
      throw new NotFoundException(`Station avec l'ID ${id} non trouvée`);
    }
    return station;
  }

  async findByCity(city: string): Promise<Station[]> {
    return this.stationsRepository.find({
      where: { city, status: StationStatus.ACTIVE },
    });
  }

  async findActive(): Promise<Station[]> {
    return this.stationsRepository.find({
      where: { status: StationStatus.ACTIVE, isActive: true },
    });
  }

  async create(stationData: Partial<Station>): Promise<Station> {
    const station = this.stationsRepository.create(stationData);
    return this.stationsRepository.save(station);
  }

  async update(id: string, stationData: Partial<Station>): Promise<Station> {
    await this.stationsRepository.update(id, stationData);
    return this.findOne(id);
  }

  async updateStatus(id: string, status: StationStatus): Promise<Station> {
    await this.stationsRepository.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const station = await this.findOne(id);
    await this.stationsRepository.remove(station);
  }
}
