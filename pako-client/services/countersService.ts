import api from '../lib/api';

export interface PackageCounters {
  delivered: number;
  inProgress: number;
  cancelled: number;
  total: number;
}

export const CountersService = {
  /**
   * Récupère les compteurs de colis par statut depuis l'API
   * @param userId ID de l'utilisateur
   * @returns Compteurs de colis
   */
  async getPackageCounters(userId: string): Promise<PackageCounters> {
    try {
      console.log('🔢 === RÉCUPÉRATION COMPTEURS API ===');
      console.log('👤 User ID:', userId);
      
      if (!userId) {
        console.log('⚠️ User ID manquant');
        return { delivered: 0, inProgress: 0, cancelled: 0, total: 0 };
      }
      
      const response = await api.get(`/orders/counts/${userId}`);
      
      console.log('✅ Réponse API compteurs reçue');
      console.log('📊 Compteurs:', response.data);
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Erreur récupération compteurs:', error);
      console.error('   URL tentée:', error.config?.url);
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data?.message || error.message);
      
      // Retourner des compteurs vides en cas d'erreur
      return { delivered: 0, inProgress: 0, cancelled: 0, total: 0 };
    }
  }
};
