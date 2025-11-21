import { httpClient } from '../http-client';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  status: OrderStatus;
  totalAmount: number;
  distance?: number;
  originAddress: string;
  destinationAddress: string;
  originLatitude?: number;
  originLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  createdAt: string;
  updatedAt: string;
  packages?: any[];
}

export interface CreateOrderDto {
  customerId: string;
  customerName?: string;
  originAddress: string;
  destinationAddress: string;
  originLatitude?: number;
  originLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  packages: Array<{
    description: string;
    weight: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  }>;
}

export interface UpdateStatusDto {
  status: OrderStatus;
}

class OrdersService {
  // Démarrer le processus de commande
  async startOrderProcess(customerId: string, customerName?: string) {
    return httpClient.post('orders/start-order-process', { customerId, customerName });
  }

  // Créer une nouvelle commande
  async create(data: CreateOrderDto): Promise<Order> {
    return httpClient.post<Order>('orders', data);
  }

  // Récupérer toutes les commandes
  async findAll(): Promise<Order[]> {
    return httpClient.get<Order[]>('orders');
  }

  // Récupérer les commandes d'un utilisateur
  async findByUserId(userId: string): Promise<Order[]> {
    return httpClient.get<Order[]>(`orders/user/${userId}`);
  }

  // Récupérer les compteurs de colis par statut
  async getOrderCounts(userId: string) {
    return httpClient.get<{
      delivered: number;
      inProgress: number;
      cancelled: number;
      total: number;
    }>(`orders/counts/${userId}`);
  }

  // Récupérer une commande par ID
  async findOne(id: string): Promise<Order> {
    return httpClient.get<Order>(`orders/${id}`);
  }

  // Mettre à jour le statut d'une commande
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return httpClient.patch<Order>(`orders/${id}/status`, { status });
  }

  // Supprimer une commande
  async remove(id: string): Promise<void> {
    return httpClient.delete<void>(`orders/${id}`);
  }
}

export const ordersService = new OrdersService();

