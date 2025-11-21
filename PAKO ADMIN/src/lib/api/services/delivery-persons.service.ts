import { httpClient } from '../http-client';

export enum DeliveryPersonStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export enum VehicleType {
  MOTORCYCLE = 'motorcycle',
  CAR = 'car',
  VAN = 'van',
  TRUCK = 'truck',
}

export interface DeliveryPerson {
  id: string;
  userId: string;
  licenseNumber: string;
  status: DeliveryPersonStatus;
  vehicleType: VehicleType;
  vehicleBrand: string;
  vehicleModel: string;
  plateNumber: string;
  vehicleColor: string;
  maxLoadCapacity: number;
  currentLatitude?: number;
  currentLongitude?: number;
  rating: number;
  totalRatings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
}

export interface CreateDeliveryPersonDto {
  userId: string;
  licenseNumber: string;
  vehicleType: VehicleType;
  vehicleBrand: string;
  vehicleModel: string;
  plateNumber: string;
  vehicleColor: string;
  maxLoadCapacity: number;
}

export interface UpdateDeliveryPersonDto {
  licenseNumber?: string;
  status?: DeliveryPersonStatus;
  vehicleType?: VehicleType;
  vehicleBrand?: string;
  vehicleModel?: string;
  plateNumber?: string;
  vehicleColor?: string;
  maxLoadCapacity?: number;
  isActive?: boolean;
}

export interface UpdateLocationDto {
  latitude: number;
  longitude: number;
}

class DeliveryPersonsService {
  // Récupérer tous les livreurs
  async findAll(): Promise<DeliveryPerson[]> {
    return httpClient.get<DeliveryPerson[]>('delivery-persons');
  }

  // Récupérer les livreurs disponibles
  async findAvailable(): Promise<DeliveryPerson[]> {
    return httpClient.get<DeliveryPerson[]>('delivery-persons/available');
  }

  // Récupérer un livreur par ID
  async findOne(id: string): Promise<DeliveryPerson> {
    return httpClient.get<DeliveryPerson>(`delivery-persons/${id}`);
  }

  // Récupérer un livreur par ID utilisateur
  async findByUserId(userId: string): Promise<DeliveryPerson | null> {
    return httpClient.get<DeliveryPerson | null>(`delivery-persons/user/${userId}`);
  }

  // Créer un nouveau livreur
  async create(data: CreateDeliveryPersonDto): Promise<DeliveryPerson> {
    return httpClient.post<DeliveryPerson>('delivery-persons', data);
  }

  // Mettre à jour un livreur
  async update(id: string, data: UpdateDeliveryPersonDto): Promise<DeliveryPerson> {
    return httpClient.put<DeliveryPerson>(`delivery-persons/${id}`, data);
  }

  // Mettre à jour le statut d'un livreur
  async updateStatus(id: string, status: DeliveryPersonStatus): Promise<DeliveryPerson> {
    return httpClient.put<DeliveryPerson>(`delivery-persons/${id}/status`, { status });
  }

  // Mettre à jour la localisation d'un livreur
  async updateLocation(id: string, data: UpdateLocationDto): Promise<DeliveryPerson> {
    return httpClient.put<DeliveryPerson>(`delivery-persons/${id}/location`, data);
  }

  // Supprimer un livreur
  async remove(id: string): Promise<{ message: string }> {
    return httpClient.delete<{ message: string }>(`delivery-persons/${id}`);
  }

  // Tableau de bord du livreur
  async getDashboard(id: string) {
    return httpClient.get(`delivery-persons/${id}/dashboard`);
  }

  // Commandes à proximité
  async getNearbyOrders(id: string, radius?: number) {
    const query = radius ? `?radius=${radius}` : '';
    return httpClient.get(`delivery-persons/${id}/nearby-orders${query}`);
  }
}

export const deliveryPersonsService = new DeliveryPersonsService();

