import { httpClient } from '../http-client';

export enum ApiPackageStatus {
  RECEIVED = 'received',
  VERIFIED = 'verified',
  READY_FOR_DELIVERY = 'ready_for_delivery',
  ASSIGNED = 'assigned',
  IN_DELIVERY = 'in_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface PackageOrder {
  id: string;
  orderNumber: string;
  customerName?: string;
  receiverName?: string;
  receiverPhone: string;
  senderPhone: string;
  deliveryAddress: string;
  destinationStation: string;
  pickupAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  stationLatitude?: number;
  stationLongitude?: number;
  totalPrice?: number;
  paymentMethod?: string;
  createdAt: string;
}

export interface Package {
  id: string;
  orderId: string;
  packageCode: string;
  status: ApiPackageStatus;
  createdAt: string;
  updatedAt: string;
  assignedDriverId?: string | null;
  assignedDriverName?: string | null;
  assignedAt?: string | null;
  order?: PackageOrder;
}

class PackagesService {
  // Marquer un colis comme prêt pour livraison
  async markAsReadyForDelivery(packageCode: string): Promise<Package> {
    return httpClient.patch<Package>(`packages/code/${packageCode}/ready`);
  }

  // Assigner un colis à un livreur
  async assignToDriver(
    packageCode: string,
    payload: { driverId: string; driverName?: string },
  ): Promise<Package> {
    return httpClient.patch<Package>(`packages/code/${packageCode}/assign`, payload);
  }

  // Récupérer un colis par code
  async findByPackageCode(packageCode: string): Promise<Package> {
    return httpClient.get<Package>(`packages/code/${packageCode}`);
  }

  // Récupérer les colis d'un livreur
  async findByDriverId(driverId: string, statuses?: ApiPackageStatus[]): Promise<Package[]> {
    const query = statuses && statuses.length ? `?status=${statuses.join(',')}` : '';
    return httpClient.get<Package[]>(`packages/driver/${driverId}${query}`);
  }

  // Mettre à jour le statut d'un colis
  async updateStatus(id: string, status: ApiPackageStatus): Promise<Package> {
    console.log('packagesService.updateStatus appelé avec:', { id, status });
    try {
      const result = await httpClient.patch<Package>(`packages/${id}/status`, { status });
      console.log('packagesService.updateStatus succès:', result);
      return result;
    } catch (error: any) {
      console.error('packagesService.updateStatus erreur:', error);
      throw error;
    }
  }
}

export const packagesService = new PackagesService();

