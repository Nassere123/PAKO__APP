import api from '../lib/api';

export interface CancelOrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  [key: string]: any;
}

export const CancelOrderService = {
  /**
   * Annule une commande en mettant à jour son statut dans la base de données
   * @param orderId ID de la commande à annuler
   * @returns Commande mise à jour
   */
  async cancelOrder(orderId: string): Promise<CancelOrderResponse> {
    try {
      console.log('🚫 === ANNULATION COMMANDE ===');
      console.log('📦 Order ID:', orderId);
      
      if (!orderId) {
        throw new Error('ID de commande manquant');
      }
      
      const response = await api.patch(`/orders/${orderId}/status`, {
        status: 'cancelled'
      });
      
      console.log('✅ Commande annulée avec succès dans la base de données');
      console.log('📦 Commande mise à jour:', response.data);
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Erreur annulation commande:', error);
      console.error('   URL tentée:', error.config?.url);
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data?.message || error.message);
      
      throw error;
    }
  }
};
