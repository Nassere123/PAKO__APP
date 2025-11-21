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
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  licenseNumber: string;
  status: DeliveryPersonStatus;
  isOnline: boolean;
  lastLoginAt?: string;
  lastLogoutAt?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  rating: number;
  totalRatings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  vehicles?: Array<{
    id: string;
    brand: string;
    model: string;
    plateNumber: string;
    vehicleType: VehicleType;
  }>;
}

export interface UpdateLocationDto {
  latitude: number;
  longitude: number;
}

export interface UpdateStatusDto {
  status: DeliveryPersonStatus;
}

class DeliveryPersonsService {
  // Récupérer tous les livreurs
  async findAll(): Promise<DeliveryPerson[]> {
    try {
      console.log('🌐 Appel API: GET delivery-persons');
      const result = await httpClient.get<DeliveryPerson[]>('delivery-persons');
      console.log('📥 Réponse API delivery-persons:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur API delivery-persons:', error);
      throw error;
    }
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

  // Mettre à jour le statut d'un livreur
  async updateStatus(id: string, status: DeliveryPersonStatus): Promise<DeliveryPerson> {
    return httpClient.put<DeliveryPerson>(`delivery-persons/${id}/status`, { status });
  }

  // Mettre à jour le statut de connexion d'un livreur
  async updateOnlineStatus(id: string, isOnline: boolean): Promise<DeliveryPerson> {
    return httpClient.put<DeliveryPerson>(`delivery-persons/${id}/online-status`, { isOnline });
  }

  // Mettre à jour la localisation d'un livreur
  async updateLocation(id: string, data: UpdateLocationDto): Promise<DeliveryPerson> {
    return httpClient.put<DeliveryPerson>(`delivery-persons/${id}/location`, data);
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

