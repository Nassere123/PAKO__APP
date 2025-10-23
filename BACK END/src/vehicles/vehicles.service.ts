import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createVehicleDto: any): Promise<Vehicle> {
    const vehicle = this.vehicleRepository.create(createVehicleDto);
    const savedVehicle = await this.vehicleRepository.save(vehicle);
    return Array.isArray(savedVehicle) ? savedVehicle[0] : savedVehicle;
  }

  async findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      relations: ['deliveryPerson'],
    });
  }

  async findOne(id: string): Promise<Vehicle> {
    return this.vehicleRepository.findOne({
      where: { id },
      relations: ['deliveryPerson'],
    });
  }

  async update(id: string, updateVehicleDto: any): Promise<Vehicle> {
    await this.vehicleRepository.update(id, updateVehicleDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.vehicleRepository.delete(id);
  }
}
