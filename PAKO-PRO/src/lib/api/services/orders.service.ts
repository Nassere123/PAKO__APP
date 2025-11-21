import { httpClient } from '../http-client';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  destinationStation: string;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  pickupAddress: string;
  stationLatitude?: number;
  stationLongitude?: number;
  distanceKm?: number;
  receiverPhone: string;
  senderPhone: string;
  deliveryType: 'standard' | 'express';
  paymentMethod: 'cash' | 'wave' | 'orange';
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  packages?: Array<{
    id: string;
    orderId: string;
    packageCode: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface UpdateStatusDto {
  status: OrderStatus;
}

class OrdersService {
  // Récupérer toutes les commandes
  async findAll(): Promise<Order[]> {
    return httpClient.get<Order[]>('orders');
  }

  // Récupérer les commandes d'un utilisateur
  async findByUserId(userId: string): Promise<Order[]> {
    return httpClient.get<Order[]>(`orders/user/${userId}`);
  }

  // Récupérer une commande par ID
  async findOne(id: string): Promise<Order> {
    return httpClient.get<Order>(`orders/${id}`);
  }

  // Mettre à jour le statut d'une commande
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return httpClient.patch<Order>(`orders/${id}/status`, { status });
  }

  // Marquer une commande comme confirmée par la gare
  async markAsArrived(orderId: string): Promise<Order> {
    return this.updateStatus(orderId, OrderStatus.CONFIRMED);
  }

  // Récupérer le nombre total de commandes
  async getTotalCount(): Promise<number> {
    const orders = await this.findAll();
    return orders.length;
  }
}

export const ordersService = new OrdersService();

