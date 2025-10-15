import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PackageListScreenProps = StackScreenProps<RootStackParamList, 'PackageList'>;

const PackageListScreen: React.FC<PackageListScreenProps> = ({ navigation, route }) => {
  const { category } = route.params as { category: 'received' | 'in_transit' | 'cancelled' };
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [category]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Charger depuis la clé simple
      const simpleOrders = await AsyncStorage.getItem('@pako_simple_orders');
      const allOrders = simpleOrders ? JSON.parse(simpleOrders) : [];
      
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
      
      // Si aucune commande pour les colis en cours, créer une commande de test
      if (filteredOrders.length === 0 && category === 'in_transit') {
        await createTestOrder();
        loadOrders(); // Recharger
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const createTestOrder = async () => {
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
    
    const existingOrders = await AsyncStorage.getItem('@pako_simple_orders');
    const orders = existingOrders ? JSON.parse(existingOrders) : [];
    orders.push(testOrder);
    await AsyncStorage.setItem('@pako_simple_orders', JSON.stringify(orders));
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
            <Text style={styles.trackButtonText}>📍 Suivre en temps réel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => Alert.alert('Annulation', 'Fonctionnalité d\'annulation à implémenter')}
          >
            <Text style={styles.cancelButtonText}>✗ Annuler</Text>
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
      {category === 'in_transit' && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={async () => {
              await createTestOrder();
              loadOrders();
            }}
          >
            <Text style={styles.trackButtonText}>➕ Créer test</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={async () => {
              await AsyncStorage.removeItem('@pako_simple_orders');
              loadOrders();
            }}
          >
            <Text style={styles.cancelButtonText}>🗑️ Vider</Text>
          </TouchableOpacity>
        </View>
      )}
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
  },
  trackButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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