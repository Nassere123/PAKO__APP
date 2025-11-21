import { httpClient } from '../http-client';

export interface DashboardStats {
  totalOrders: number;
  totalDeliveries: number;
  totalUsers: number;
  totalRevenue: number;
  activeDeliveryPersons: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export interface TopDeliveryPerson {
  id: string;
  name: string;
  totalDeliveries: number;
  rating: number;
  status: string;
}

class AdminService {
  // Récupérer les statistiques du tableau de bord
  async getDashboardStats(): Promise<DashboardStats> {
    return httpClient.get<DashboardStats>('admin/dashboard');
  }

  // Récupérer les commandes récentes
  async getRecentOrders(limit?: number): Promise<RecentOrder[]> {
    const query = limit ? `?limit=${limit}` : '';
    return httpClient.get<RecentOrder[]>(`admin/recent-orders${query}`);
  }

  // Récupérer les meilleurs livreurs
  async getTopDeliveryPersons(limit?: number): Promise<TopDeliveryPerson[]> {
    const query = limit ? `?limit=${limit}` : '';
    return httpClient.get<TopDeliveryPerson[]>(`admin/top-delivery-persons${query}`);
  }
}

export const adminService = new AdminService();

