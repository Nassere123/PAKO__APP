import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility pour vider complètement le stockage des colis
 * Supprime toutes les données de colis stockées localement
 */
export const clearAllPackageStorage = async (): Promise<void> => {
  try {
    console.log('🧹 Nettoyage complet du stockage des colis...');
    
    // Supprimer toutes les clés liées aux colis
    await AsyncStorage.multiRemove([
      '@pako_simple_orders',
      '@pako_orders',
      '@pako_packages',
      '@pako_user_orders',
      '@pako_order_history'
    ]);
    
    console.log('✅ Stockage des colis nettoyé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage du stockage:', error);
    throw error;
  }
};

/**
 * Utility pour vérifier si le stockage des colis est vide
 */
export const isPackageStorageEmpty = async (): Promise<boolean> => {
  try {
    const keys = ['@pako_simple_orders', '@pako_orders', '@pako_packages'];
    const values = await AsyncStorage.multiGet(keys);
    
    // Vérifier si toutes les valeurs sont null
    return values.every(([key, value]) => value === null);
  } catch (error) {
    console.error('Erreur lors de la vérification du stockage:', error);
    return false;
  }
};
