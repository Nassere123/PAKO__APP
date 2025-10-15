import { Storage } from '../lib/storage';
import { OrderData } from '../types/common';

export class OrderService {
  private static readonly ORDERS_KEY = '@pako_orders';

  /**
   * Sauvegarde une nouvelle commande
   */
  static async saveOrder(orderData: Omit<OrderData, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<OrderData> {
    try {
      const orders = await this.getAllOrders();
      
      const newOrder: OrderData = {
        ...orderData,
        id: this.generateOrderId(),
        orderNumber: this.generateOrderNumber(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      orders.push(newOrder);
      await Storage.setItem(this.ORDERS_KEY, orders);
      
      return newOrder;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la commande:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les commandes
   */
  static async getAllOrders(): Promise<OrderData[]> {
    try {
      const orders = await Storage.getItem<OrderData[]>(this.ORDERS_KEY);
      if (!orders) return [];
      
      // Convertir les dates string en objets Date
      return orders.map(order => ({
        ...order,
        createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
        updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date(),
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return [];
    }
  }

  /**
   * Récupère les commandes par statut
   */
  static async getOrdersByStatus(status: OrderData['status']): Promise<OrderData[]> {
    try {
      const orders = await this.getAllOrders();
      return orders.filter(order => order.status === status);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes par statut:', error);
      return [];
    }
  }

  /**
   * Récupère les commandes en cours (pending, confirmed, in_transit)
   */
  static async getInProgressOrders(): Promise<OrderData[]> {
    try {
      const orders = await this.getAllOrders();
      return orders.filter(order => 
        ['pending', 'confirmed', 'in_transit'].includes(order.status)
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes en cours:', error);
      return [];
    }
  }

  /**
   * Met à jour le statut d'une commande
   */
  static async updateOrderStatus(orderId: string, status: OrderData['status']): Promise<boolean> {
    try {
      const orders = await this.getAllOrders();
      const orderIndex = orders.findIndex(order => order.id === orderId);
      
      if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date();
        await Storage.setItem(this.ORDERS_KEY, orders);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return false;
    }
  }

  /**
   * Supprime une commande
   */
  static async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const orders = await this.getAllOrders();
      const filteredOrders = orders.filter(order => order.id !== orderId);
      await Storage.setItem(this.ORDERS_KEY, filteredOrders);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
      return false;
    }
  }

  /**
   * Génère un ID unique pour une commande
   */
  private static generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Génère un numéro de commande lisible
   */
  private static generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const day = String(new Date().getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `#PAKO-${year}${month}${day}-${random}`;
  }
}
