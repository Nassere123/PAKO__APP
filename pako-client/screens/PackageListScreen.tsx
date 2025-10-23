import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CancelPackageModal from '../components/CancelPackageModal';
import Toast from '../components/Toast';

type PackageListScreenProps = StackScreenProps<RootStackParamList, 'PackageList'>;

const PackageListScreen: React.FC<PackageListScreenProps> = ({ navigation, route }) => {
  const { category } = route.params as { category: 'received' | 'in_transit' | 'cancelled' };
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  useEffect(() => {
    loadOrders();
  }, [category]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Charger depuis la clé simple
      const simpleOrders = await AsyncStorage.getItem('@pako_simple_orders');
      const allOrders = simpleOrders ? JSON.parse(simpleOrders) : [];
      
      console.log('=== DEBUG PackageListScreen ===');
      console.log('Category:', category);
      console.log('Raw data from storage:', simpleOrders);
      console.log('Parsed orders:', allOrders);
      console.log('Number of orders:', allOrders.length);
      
      let filteredOrders: any[] = [];
      
      switch (category) {
        case 'received':
          filteredOrders = allOrders.filter((order: any) => order.status === 'delivered');
          break;
        case 'in_transit':
          filteredOrders = allOrders.filter((order: any) => 
            order.status === 'confirmed' || order.status === 'in_transit' || order.status === 'pending'
          );
          console.log('Filtered in_transit orders:', filteredOrders);
          console.log('Order statuses:', allOrders.map((o: any) => o.status));
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
      // Récupérer toutes les commandes
      const simpleOrders = await AsyncStorage.getItem('@pako_simple_orders');
      const allOrders = simpleOrders ? JSON.parse(simpleOrders) : [];
      
      // Mettre à jour le statut de la commande sélectionnée
      const updatedOrders = allOrders.map((order: any) => 
        order.id === selectedOrder.id 
          ? { ...order, status: 'cancelled', cancelledAt: new Date().toISOString() }
          : order
      );
      
      // Sauvegarder les commandes mises à jour
      await AsyncStorage.setItem('@pako_simple_orders', JSON.stringify(updatedOrders));
      
      // Fermer le modal et recharger les données
      setCancelModalVisible(false);
      setSelectedOrder(null);
      loadOrders();
      
      // Afficher le toast de succès
      showToast('Votre colis a été annulé avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      // Afficher le toast d'erreur
      showToast('Une erreur est survenue lors de l\'annulation. Veuillez réessayer.', 'error');
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
          title: 'Colis reçus',
          subtitle: 'Colis livrés avec succès',
          color: '#4CAF50',
          icon: true
        };
      case 'in_transit':
        return {
          title: 'Colis en cours de livraison',
          subtitle: 'Colis actuellement en transit',
          color: '#FF9800',
          icon: true
        };
      case 'cancelled':
        return {
          title: 'Colis annulés',
          subtitle: 'Colis annulés ou retournés',
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
      key={order.id}
      style={styles.packageCard}
      onPress={() => navigation.navigate('PackageTracking', { packageId: order.orderNumber })}
    >
      <View style={styles.packageHeader}>
        <Text style={styles.packageCode}>{order.packageCode || order.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: categoryInfo.color }]}>
          <Text style={styles.statusText}>En cours</Text>
        </View>
      </View>
      
      {/* Utiliser les données du récapitulatif */}
      <Text style={styles.packageDescription}>
        {order.packages?.length > 0 ? `${order.packages.length} colis` : '1 colis'}
        {order.deliveryType === 'express' ? ' • Express' : ' • Standard'}
      </Text>
      <Text style={styles.packageType}>📍 {order.deliveryAddress}</Text>
      
      <View style={styles.packageFooter}>
        <Text style={styles.packageDate}>📅 {new Date(order.createdAt).toLocaleDateString('fr-FR')}</Text>
        {order.totalPrice && order.totalPrice > 0 && (
          <Text style={styles.packageValue}>💰 {order.totalPrice.toLocaleString()} FCFA</Text>
        )}
      </View>
      
      <Text style={styles.trackingNumber}>🔍 Suivi: {order.packageCode || order.orderNumber}</Text>
      
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
      <Text style={styles.emptyStateTitle}>Aucun colis trouvé</Text>
      <Text style={styles.emptyStateText}>
        Vous n'avez aucun colis dans cette catégorie pour le moment.
      </Text>
      
      {/* Boutons de test temporaires */}
      <View style={styles.testButtonsContainer}>
          <TouchableOpacity 
          style={[styles.trackButton, { marginTop: 20, marginRight: 10 }]}
            onPress={async () => {
            console.log('=== TEST STOCKAGE ===');
            const data = await AsyncStorage.getItem('@pako_simple_orders');
            console.log('Données brutes du stockage:', data);
            const parsed = data ? JSON.parse(data) : [];
            console.log('Données parsées:', parsed);
            console.log('Nombre de commandes:', parsed.length);
            
            if (parsed.length > 0) {
              console.log('Première commande:', parsed[0]);
              console.log('Statut première commande:', parsed[0].status);
              console.log('Toutes les commandes:', parsed);
            } else {
              console.log('Aucune commande trouvée dans le stockage');
            }
            
            // Recharger les données
              loadOrders();
            }}
          >
          <Text style={styles.trackButtonText}>🔍 Vérifier</Text>
          </TouchableOpacity>

          <TouchableOpacity 
          style={[styles.cancelButton, { marginTop: 20 }]}
            onPress={async () => {
            console.log('=== CRÉATION TEST SIMPLE ===');
            const testOrder = {
              id: `test_${Date.now()}`,
              orderNumber: `#PAKO-TEST-${Math.floor(Math.random() * 1000)}`,
              packageCode: 'PK002',
              deliveryAddress: 'Cocody, Angré 8ème Tranche, Abidjan',
              senderName: 'Test User',
              status: 'confirmed',
              createdAt: new Date().toISOString(),
              totalPrice: 2500,
              deliveryType: 'standard',
              packages: [{ packageCode: 'PK002', packageDescription: 'Colis standard' }]
            };
            
            console.log('Création du colis de test:', testOrder);
            
            const existingOrders = await AsyncStorage.getItem('@pako_simple_orders');
            const orders = existingOrders ? JSON.parse(existingOrders) : [];
            orders.push(testOrder);
            await AsyncStorage.setItem('@pako_simple_orders', JSON.stringify(orders));
            
            console.log('Colis de test sauvegardé. Total commandes:', orders.length);
            console.log('Toutes les commandes après sauvegarde:', orders);
            
            // Recharger les données
              loadOrders();
            }}
          >
          <Text style={styles.cancelButtonText}>➕ Test</Text>
          </TouchableOpacity>
        </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes colis</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTitleContainer}>
            <Text style={styles.categoryTitle}>{categoryInfo.title}</Text>
          </View>
          <Text style={styles.categorySubtitle}>{categoryInfo.subtitle}</Text>
          <View style={[styles.categoryIndicator, { backgroundColor: categoryInfo.color }]} />
        </View>

        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Chargement des commandes...</Text>
          </View>
        ) : orders.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.packagesList}>
            {orders.map((order) => renderOrderItem({ order }))}
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
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
  packageCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
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
  packageType: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  packageFooter: {
    marginBottom: 8,
  },
  packageDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  packageValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  trackingNumber: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 8,
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
  testButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PackageListScreen;