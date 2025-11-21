import api from '../lib/api';

export interface UserOrder {
  id: string;
  orderNumber: string;
  packageCode?: string;
  deliveryAddress: string;
  senderName: string;
  senderPhone: string;
  receiverName?: string;
  receiverPhone: string;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  totalPrice: number;
  deliveryType: 'standard' | 'express';
  paymentMethod: 'cash' | 'wave' | 'orange';
  packages: Array<{
    id: string;
    packageCode: string;
    status: string;
  }>;
  distanceKm: number;
  customerId: string;
  customerName: string;
  destinationStation: string;
  createdAt: string;
  updatedAt: string;
}

export const UserOrderService = {
  /**
   * Récupère toutes les commandes d'un utilisateur depuis l'API
   */
  async getUserOrders(userId: string): Promise<UserOrder[]> {
    try {
      console.log('🔄 === RÉCUPÉRATION COMMANDES API ===');
      console.log('👤 User ID:', userId);
      
      if (!userId) {
        console.log('⚠️ User ID manquant');
        return [];
      }
      
      const response = await api.get(`/orders/user/${userId}`);
      
      console.log('✅ Réponse API reçue');
      console.log('📊 Nombre de commandes:', response?.data?.length || 0);
      
      const orders = response?.data || [];
      
      if (orders.length > 0) {
        console.log('📋 Commandes API:', orders.map((order: any) => ({
          orderNumber: order.orderNumber || 'N/A',
          status: order.status || 'unknown',
          totalPrice: order.totalPrice || 0
        })));
      } else {
        console.log('📋 Aucune commande trouvée pour cet utilisateur');
      }
      
      return orders;
    } catch (error: any) {
      console.error('❌ Erreur récupération commandes API:', error);
      console.error('   URL tentée:', error.config?.url);
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data?.message || error.message);
      
      console.log('🔄 Retour à un tableau vide pour éviter le crash');
      
      return [];
    }
  },

  /**
   * Synchronise les commandes de l'API vers AsyncStorage
   */
  async syncOrdersToLocal(userId: string): Promise<void> {
    try {
      console.log('🔄 === SYNCHRONISATION API → LOCAL ===');
      
      if (!userId) {
        console.log('⚠️ User ID manquant pour la synchronisation');
        return;
      }
      
      const apiOrders = await this.getUserOrders(userId);
      
      if (apiOrders && apiOrders.length > 0) {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        
        // Transformer les données API pour le format local avec validation
        const localOrders = apiOrders.map((order: any) => ({
          id: order.id || `temp-${Date.now()}`,
          orderNumber: order.orderNumber || 'N/A',
          packageCode: order.packages?.[0]?.packageCode || order.packageCode || 'N/A',
          deliveryAddress: order.deliveryAddress || 'Adresse non définie',
          senderName: order.customerName || order.senderName || 'Expéditeur inconnu',
          senderPhone: order.senderPhone || 'N/A',
          receiverName: order.receiverName || 'Destinataire inconnu',
          receiverPhone: order.receiverPhone || 'N/A',
          status: order.status || 'pending',
          totalPrice: parseFloat(order.totalPrice?.toString() || '0') || 0,
          deliveryType: order.deliveryType || 'standard',
          paymentMethod: order.paymentMethod || 'cash',
          packages: Array.isArray(order.packages) ? order.packages : [],
          distanceKm: parseFloat(order.distanceKm?.toString() || '0') || 0,
          customerId: order.customerId || userId,
          destinationStation: order.destinationStation || 'Station inconnue',
          createdAt: order.createdAt || new Date().toISOString(),
          updatedAt: order.updatedAt || new Date().toISOString(),
        }));
        
        // Utiliser une clé spécifique par utilisateur pour éviter le mélange entre comptes
        const userOrdersKey = `@pako_orders_${userId}`;
        await AsyncStorage.setItem(userOrdersKey, JSON.stringify(localOrders));
        
        console.log('✅ Synchronisation terminée');
        console.log('📊 Commandes synchronisées:', localOrders.length);
      } else {
        console.log('⚠️ Aucune commande API à synchroniser - utilisation des données locales existantes');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur synchronisation:', error);
      console.error('   Message:', error.message);
      console.log('🔄 Poursuite du chargement avec les données locales existantes');
    }
  }
};
