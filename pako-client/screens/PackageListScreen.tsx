import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CancelPackageModal from '../components/CancelPackageModal';
import Toast from '../components/Toast';
import { useAuth, useTheme, useTranslation } from '../hooks';
import { UserOrderService } from '../services/userOrderService';
import { CancelOrderService } from '../services/cancelOrderService';

type PackageListScreenProps = StackScreenProps<RootStackParamList, 'PackageList'>;

const PackageListScreen: React.FC<PackageListScreenProps> = ({ navigation, route }) => {
  const { category } = route.params as { category: 'received' | 'in_transit' | 'cancelled' };
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  useEffect(() => {
    loadOrders();
  }, [category, user?.id]); // Recharger quand l'utilisateur change

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.log('⚠️ Pas d\'utilisateur - affichage vide');
        setOrders([]);
        return;
      }
      
      // Synchroniser les commandes depuis l'API si possible
      try {
        console.log('🔄 Synchronisation des commandes depuis l\'API...');
        await UserOrderService.syncOrdersToLocal(user.id);
      } catch (error) {
        console.log('⚠️ Erreur sync API - utilisation des données locales:', error);
      }
      
      // Charger les commandes depuis le stockage avec une clé spécifique par utilisateur
      const userOrdersKey = user?.id ? `@pako_orders_${user.id}` : '@pako_simple_orders';
      console.log('🔑 Clé de stockage utilisée:', userOrdersKey);
      console.log('👤 Utilisateur actuel:', user ? `${user.firstName} ${user.lastName}` : 'Aucun');
      const simpleOrders = await AsyncStorage.getItem(userOrdersKey);
      const allOrders = simpleOrders ? JSON.parse(simpleOrders) : [];
      console.log('📦 Nombre de commandes chargées:', allOrders.length);
      
      // Filtrer les commandes par catégorie
      let filteredOrders: any[] = [];
      
      switch (category) {
        case 'received':
          filteredOrders = allOrders.filter((order: any) => order.status === 'delivered');
          break;
        case 'in_transit':
          filteredOrders = allOrders.filter((order: any) => 
            order.status === 'confirmed' || order.status === 'in_transit' || order.status === 'pending'
          );
          break;
        case 'cancelled':
          filteredOrders = allOrders.filter((order: any) => order.status === 'cancelled');
          break;
        default:
          filteredOrders = allOrders;
      }
      
      setOrders(filteredOrders);
      
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };


  const handleCancelOrder = (order: any) => {
    setSelectedOrder(order);
    setCancelModalVisible(true);
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      console.log('🚫 === DÉBUT ANNULATION COMMANDE ===');
      console.log('📦 Commande sélectionnée:', selectedOrder);
      console.log('🆔 Order ID:', selectedOrder.id);
      
      // ÉTAPE 1: Mettre à jour le statut dans la base de données backend
      if (selectedOrder.id) {
        try {
          console.log('📡 Appel API pour annuler la commande dans la BD...');
          const updatedOrder = await CancelOrderService.cancelOrder(selectedOrder.id);
          console.log('✅ Commande annulée dans la base de données:', updatedOrder);
        } catch (apiError) {
          console.error('❌ Erreur API annulation:', apiError);
          // Continuer quand même pour mettre à jour le local
          console.log('⚠️ Poursuite avec mise à jour locale seulement...');
        }
      } else {
        console.log('⚠️ Pas d\'ID de commande - mise à jour locale seulement');
      }
      
      // ÉTAPE 2: Mettre à jour le stockage local
      console.log('💾 Mise à jour du stockage local...');
      const userOrdersKey = user?.id ? `@pako_orders_${user.id}` : '@pako_simple_orders';
      const simpleOrders = await AsyncStorage.getItem(userOrdersKey);
      const allOrders = simpleOrders ? JSON.parse(simpleOrders) : [];
      
      // Mettre à jour le statut de la commande sélectionnée
      const updatedOrders = allOrders.map((order: any) => 
        order.id === selectedOrder.id || order.orderNumber === selectedOrder.orderNumber
          ? { ...order, status: 'cancelled', cancelledAt: new Date().toISOString() }
          : order
      );
      
      // Sauvegarder les commandes mises à jour avec la clé utilisateur
      await AsyncStorage.setItem(userOrdersKey, JSON.stringify(updatedOrders));
      console.log('✅ Stockage local mis à jour');
      
      // ÉTAPE 3: Synchroniser depuis l'API pour avoir les données à jour
      if (user?.id) {
        try {
          console.log('🔄 Synchronisation des commandes depuis l\'API...');
          await UserOrderService.syncOrdersToLocal(user.id);
          console.log('✅ Synchronisation terminée');
        } catch (syncError) {
          console.log('⚠️ Erreur synchronisation - données locales utilisées:', syncError);
        }
      }
      
      // Fermer le modal
      setCancelModalVisible(false);
      setSelectedOrder(null);
      
      // Recharger les données
      await loadOrders();
      
      // Naviguer vers les colis annulés si on était sur colis en cours
      if (category === 'in_transit') {
        console.log('🔄 Navigation vers colis annulés...');
        // Le colis devrait maintenant apparaître dans "Colis annulés"
      }
      
      // Afficher le toast de succès
      showToast(t('colis_annule_success'), 'success');
      
      console.log('✅ ANNULATION TERMINÉE\n');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation:', error);
      // Afficher le toast d'erreur
      showToast(t('erreur_annulation'), 'error');
    }
  };

  const cancelCancelOrder = () => {
    setCancelModalVisible(false);
    setSelectedOrder(null);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };


  const getCategoryInfo = () => {
    switch (category) {
      case 'received':
        return {
          title: t('received_packages'),
          subtitle: t('delivered_successfully'),
          color: '#4CAF50',
          icon: true
        };
      case 'in_transit':
        return {
          title: t('in_transit_packages'),
          subtitle: t('in_transit_desc'),
          color: '#FF9800', // Orange pour les colis en cours
          icon: true
        };
      case 'cancelled':
        return {
          title: t('cancelled_packages'),
          subtitle: t('cancelled_desc'),
          color: '#F44336',
          icon: false
        };
      default:
        return {
          title: 'Tous les colis',
          subtitle: 'Historique complet',
          color: '#2196F3',
          icon: false
        };
    }
  };

  const categoryInfo = getCategoryInfo();

  const renderOrderItem = ({ order }: { order: any }) => (
    <TouchableOpacity
      style={[styles.packageCard, { backgroundColor: colors.white, shadowColor: colors.shadow }]}
      onPress={() => {
        // Les colis annulés ne sont pas cliquables (pas de navigation)
        if (category === 'cancelled') {
          return; // Ne rien faire si c'est un colis annulé
        }
        // Navigation uniquement pour les colis en cours ou reçus
        navigation.navigate('PackageTracking', { packageId: order.orderNumber });
      }}
      disabled={category === 'cancelled'}
      activeOpacity={category === 'cancelled' ? 1 : 0.7}
    >
      <View style={styles.packageHeader}>
        <View style={styles.packageCodeContainer}>
          <Text style={[styles.packageCode, { color: colors.textPrimary }]}>
            {order.packages && order.packages.length > 1 ? (
              // Afficher tous les codes des colis séparés par des virgules
              order.packages
                .map((pkg: any) => pkg.packageCode || order.packageCode || order.orderNumber)
                .join(', ')
            ) : (
              // Afficher un seul code s'il n'y a qu'un colis
              order.packages?.[0]?.packageCode || order.packageCode || order.orderNumber
            )}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: categoryInfo.color }]}>
          <Text style={styles.statusText}>
            {category === 'cancelled' ? 'Annulé' : category === 'received' ? 'Livré' : 'En cours'}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.packageDescription, { color: colors.textPrimary }]}>
        {order.packages?.length > 0 ? `${order.packages.length} colis` : '1 colis'}
        {order.deliveryType === 'express' ? ' • Express' : ' • Standard'}
      </Text>
      
      <View style={styles.iconTextRow}>
        <Ionicons name="location-outline" size={16} color="#F44336" style={styles.infoIcon} />
        <Text style={[styles.packageType, { color: colors.textSecondary }]}>{order.deliveryAddress}</Text>
      </View>
      
      <View style={styles.packageFooter}>
        <View style={[styles.iconTextRow, { flex: 1 }]}>
          <Ionicons name="calendar-outline" size={16} color="#2196F3" style={styles.infoIcon} />
          <Text style={[styles.packageDate, { color: colors.textSecondary }]}>
            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })} à {new Date(order.createdAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        {order.totalPrice && order.totalPrice > 0 && (
          <View style={styles.iconTextRow}>
            <Ionicons name="cash-outline" size={16} color="#FFC107" style={styles.infoIcon} />
            <Text style={[styles.packageValue, { color: colors.textSecondary }]}>{order.totalPrice.toLocaleString()} FCFA</Text>
          </View>
        )}
      </View>
      
      <View style={styles.iconTextRow}>
        <Ionicons name="search-outline" size={16} color="#FF9800" style={styles.infoIcon} />
        <Text style={styles.trackingNumber}>{order.orderNumber || order.packageCode}</Text>
      </View>
      
      {category === 'in_transit' && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={() => navigation.navigate('PackageTracking', { packageId: order.orderNumber })}
          >
            <Ionicons name="location-outline" size={16} color={COLORS.white} style={styles.buttonIcon} />
            <Text style={styles.trackButtonText}>Suivre en temps réel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelOrder(order)}
          >
            <Ionicons name="close-outline" size={16} color={COLORS.white} style={styles.buttonIcon} />
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📦</Text>
      <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>{t('aucun_colis_trouve')}</Text>
      <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        {t('aucun_colis_categorie')}
      </Text>
      
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleContainer}>
            <Text style={[styles.categoryTitle, { color: categoryInfo.color }]}>{categoryInfo.title}</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>Chargement des commandes...</Text>
          </View>
        ) : orders.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.packagesList}>
            {orders.map((order) => (
              <View key={order.id}>
                {renderOrderItem({ order })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal d'annulation */}
      <CancelPackageModal
        visible={cancelModalVisible}
        packageData={selectedOrder ? {
          id: selectedOrder.id,
          trackingNumber: selectedOrder.packageCode || selectedOrder.orderNumber,
          status: selectedOrder.status === 'confirmed' ? 'in_transit' : selectedOrder.status,
          description: selectedOrder.packages?.length > 0 ? `${selectedOrder.packages.length} colis` : '1 colis',
          estimatedArrival: selectedOrder.estimatedArrival
        } : null}
        onConfirm={confirmCancelOrder}
        onCancel={cancelCancelOrder}
      />


      {/* Toast de notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={hideToast}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  categoryHeader: {
    marginBottom: 20,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 32,
  },
  categorySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  categoryIndicator: {
    height: 3,
    borderRadius: 2,
  },
  packagesList: {
    gap: 15,
  },
  packageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  packageCodeContainer: {
    flex: 1,
    marginRight: 8,
  },
  packageCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  packageDescription: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  packageType: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  packageDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  packageValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  trackingNumber: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  trackButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
});

export default PackageListScreen;