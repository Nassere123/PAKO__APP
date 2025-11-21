import { ordersService as apiOrdersService, OrderStatus } from '../lib/api/services/orders.service';

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

export const orderService = {
  // Récupérer toutes les commandes depuis le backend
  getAllOrders: async (stationName?: string): Promise<Order[]> => {
    try {
      const orders = await apiOrdersService.findAll();
      // Filtrer par gare si spécifiée
      if (stationName) {
        return orders.filter((order) => order.destinationStation === stationName);
      }
      return orders;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      throw error;
    }
  },

  // Récupérer les commandes en transit vers la gare
  getOrdersInTransit: async (stationName: string): Promise<Order[]> => {
    try {
      const orders = await apiOrdersService.findAll();
      const filteredOrders = orders.filter((order) => order.destinationStation === stationName);
      return filteredOrders.filter(
        (order) =>
          order.status === OrderStatus.IN_TRANSIT ||
          order.status === OrderStatus.CONFIRMED ||
          order.status === OrderStatus.PENDING
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes en transit:', error);
      throw error;
    }
  },

  // Récupérer une commande par ID
  getOrderById: async (id: string): Promise<Order | undefined> => {
    try {
      return await apiOrdersService.findOne(id);
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      return undefined;
    }
  },

  // Marquer une commande comme arrivée à la gare
  markAsArrived: async (orderId: string): Promise<Order> => {
    try {
      return await apiOrdersService.markAsArrived(orderId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      throw error;
    }
  },

  // Récupérer le nombre total de commandes
  getTotalCount: async (stationName?: string): Promise<number> => {
    try {
      const orders = await apiOrdersService.findAll();
      // Filtrer par gare si spécifiée
      const filteredOrders = stationName
        ? orders.filter((order) => order.destinationStation === stationName)
        : orders;
      return filteredOrders.length;
    } catch (error) {
      console.error('Erreur lors du comptage des commandes:', error);
      return 0;
    }
  },
};

