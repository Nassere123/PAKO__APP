import { httpClient } from '../http-client';

export enum StationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  status: StationStatus;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

class StationsService {
  // Récupérer toutes les stations
  async findAll(): Promise<Station[]> {
    return httpClient.get<Station[]>('stations');
  }

  // Récupérer les stations actives
  async findActive(): Promise<Station[]> {
    return httpClient.get<Station[]>('stations/active');
  }

  // Récupérer les stations par ville
  async findByCity(city: string): Promise<Station[]> {
    return httpClient.get<Station[]>(`stations/city/${city}`);
  }

  // Récupérer une station par ID
  async findOne(id: string): Promise<Station> {
    return httpClient.get<Station>(`stations/${id}`);
  }
}

export const stationsService = new StationsService();

