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

export interface CreateStationDto {
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  capacity?: number;
}

export interface UpdateStationDto {
  name?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  status?: StationStatus;
  capacity?: number;
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

  // Créer une nouvelle station
  async create(data: CreateStationDto): Promise<Station> {
    return httpClient.post<Station>('stations', data);
  }

  // Mettre à jour une station
  async update(id: string, data: UpdateStationDto): Promise<Station> {
    return httpClient.patch<Station>(`stations/${id}`, data);
  }

  // Mettre à jour le statut d'une station
  async updateStatus(id: string, status: StationStatus): Promise<Station> {
    return httpClient.patch<Station>(`stations/${id}/status`, { status });
  }

  // Supprimer une station
  async remove(id: string): Promise<void> {
    return httpClient.delete<void>(`stations/${id}`);
  }
}

export const stationsService = new StationsService();

