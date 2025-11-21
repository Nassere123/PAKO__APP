import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { useAuth } from '../../context/AuthContext';
import { orderService, Order } from '../../services/orderService';
import { OrderStatus } from '../../lib/api/services/orders.service';
import { parcelService } from '../../services/parcelService';
import { AgentTabParamList } from '../../types/navigation';
import { groupParcelsByZone } from '../../utils/zoneExtractor';
import BottomToast from '../../components/BottomToast';

type NavigationProp = NativeStackNavigationProp<AgentTabParamList, 'AgentHome'>;

const getErrorMessage = (error: unknown): string | null => {
  if (!error) {
    return null;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  const responseData = (error as { response?: { data?: unknown } })?.response?.data as
    | { message?: string | string[] }
    | undefined;

  if (responseData?.message) {
    return Array.isArray(responseData.message)
      ? responseData.message.join('\n')
      : responseData.message;
  }

  return null;
};

const AgentOrdersScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successToastMessage, setSuccessToastMessage] = useState('');

  const stationName = "Gare d'Adjamé";
  const stationId = 'STATION-001';

  // Grouper les commandes par zone
  const ordersByZone = groupParcelsByZone<Order>(orders);

  const loadOrders = useCallback(async () => {
    try {
      // Charger toutes les commandes sans filtre de gare
      const allOrders = await orderService.getAllOrders();
      
      // Filtrer pour exclure :
      // - Les commandes déjà confirmées (traitées)
      // - Les commandes livrées
      // - Les commandes annulées (elles restent visibles dans PAKO CLIENT)
      const pendingOrders = allOrders.filter(
        (order) => 
          order.status !== OrderStatus.CONFIRMED && 
          order.status !== OrderStatus.DELIVERED &&
          order.status !== OrderStatus.CANCELLED
      );
      
      setOrders(pendingOrders);
      
      // Mettre à jour le compteur avec seulement les commandes en attente de livraison
      setTotalCount(pendingOrders.length);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      Alert.alert('Erreur', 'Impossible de charger les commandes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const getClientDisplayName = (order: Order): string => {
    if (order.customerName?.trim()) {
      return order.customerName;
    }
    const relationName = `${order.customer?.firstName ?? ''} ${order.customer?.lastName ?? ''}`.trim();
    if (relationName) {
      return relationName;
    }
    return order.customerId;
  };

  const processOrderReception = useCallback(
    async (order: Order, notes?: string) => {
      setProcessingOrderId(order.id);

      try {
        // Récupérer les codes de colis réels de la commande
        const packageCodes = order.packages?.map(pkg => pkg.packageCode) || [];
        
        // Utiliser le nom du client comme destinataire
        const receiverName = getClientDisplayName(order);
        
        const parcel = await parcelService.createParcelFromOrder({
          orderNumber: order.orderNumber,
          senderName: getClientDisplayName(order),
          senderPhone: order.senderPhone,
          receiverName: receiverName, // Nom de la personne qui a commandé
          receiverPhone: order.receiverPhone, // Téléphone du destinataire
          deliveryAddress: order.deliveryAddress,
          description: `Commande ${order.orderNumber} - ${order.packages?.length || 0} colis`,
          stationId,
          stationName,
          packageCodes, // Inclure les codes de colis réels
          orderDate: order.createdAt, // Date de création de la commande
        });

        await orderService.markAsArrived(order.id);
        await parcelService.verifyParcel(parcel.id, {
          verified: true,
          notes: notes?.trim() || undefined,
        });

        // Afficher le toast de succès qui glisse du bas
        setSuccessToastMessage('Colis enregistré et vérifié. Consultez l\'onglet Colis.');
        setShowSuccessToast(true);
        setShowVerifyModal(false);
        setVerifyNotes('');
        setCurrentOrder(null);
        await loadOrders();
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        const errorMessage = getErrorMessage(error);
        Alert.alert('Erreur', errorMessage ?? 'Impossible d\'enregistrer le colis comme reçu');
      } finally {
        setProcessingOrderId(null);
      }
    },
    [stationId, stationName, loadOrders, getClientDisplayName],
  );

  const handleMarkAsReceived = useCallback(
    (order: Order) => {
      if (processingOrderId) return;
      setCurrentOrder(order);
      setVerifyNotes('');
      setShowVerifyModal(true);
    },
    [processingOrderId],
  );

  const handleCloseVerifyModal = useCallback(() => {
    setShowVerifyModal(false);
    setVerifyNotes('');
      setCurrentOrder(null);
  }, []);

  const handleConfirmVerification = useCallback(() => {
    if (!currentOrder || processingOrderId) return;
    processOrderReception(currentOrder, verifyNotes);
  }, [currentOrder, processingOrderId, processOrderReception, verifyNotes]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      picked_up: 'Récupérée',
      in_transit: 'En transit',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      arrived_at_station: 'Arrivée à la gare',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      pending: COLORS.warning,
      confirmed: COLORS.info,
      picked_up: COLORS.info,
      in_transit: COLORS.primary,
      delivered: COLORS.success,
      cancelled: COLORS.danger,
      arrived_at_station: COLORS.success,
    };
    return colorMap[status] || COLORS.textSecondary;
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const isProcessing = processingOrderId === item.id;
    const packageCodes = item.packages?.map(pkg => pkg.packageCode).join(', ') || 'N/A';

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.cardLine}>
            <Text style={styles.cardLabel}>Client: </Text>
            <Text style={styles.cardValue}>{getClientDisplayName(item)}</Text>
          </Text>
          <Text style={styles.cardLine}>
            <Text style={styles.cardLabel}>Expéditeur: </Text>
            <Text style={styles.cardValue}>{item.senderPhone}</Text>
          </Text>
          <Text style={styles.cardLine}>
            <Text style={styles.cardLabel}>Destinataire: </Text>
            <Text style={styles.cardValue}>{item.receiverPhone}</Text>
          </Text>
          <Text style={styles.cardLine}>
            <Text style={styles.cardLabel}>Adresse de livraison: </Text>
            <Text style={styles.cardValue}>{item.deliveryAddress}</Text>
          </Text>
          <Text style={styles.cardLine}>
            <Text style={styles.cardLabel}>Lieu d'origine: </Text>
            <Text style={styles.cardValue}>{item.pickupAddress}</Text>
          </Text>
          <Text style={styles.cardLine}>
            <Text style={styles.cardLabel}>Gare de destination: </Text>
            <Text style={styles.cardValue}>{item.destinationStation}</Text>
          </Text>
          {item.distanceKm && (
            <Text style={styles.cardLine}>
              <Text style={styles.cardLabel}>Distance: </Text>
              <Text style={styles.cardValue}>{item.distanceKm} km</Text>
            </Text>
          )}
          <Text style={styles.cardLine}>
            <Text style={styles.cardLabel}>Type de livraison: </Text>
            <Text style={styles.cardValue}>{item.deliveryType === 'express' ? 'Express' : 'Standard'}</Text>
          </Text>
          <Text style={styles.cardLine}>
            <Text style={styles.cardLabel}>Mode de paiement: </Text>
            <Text style={styles.cardValue}>{item.paymentMethod}</Text>
          </Text>
          <Text style={styles.cardLine}>
            <Text style={styles.cardLabel}>Prix total: </Text>
            <Text style={styles.cardValue}>{item.totalPrice} FCFA</Text>
          </Text>
          <Text style={styles.cardLine}>
            <Text style={styles.cardLabel}>Statut: </Text>
            <Text style={[styles.cardValue, styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </Text>
          <Text style={styles.cardLine}>
            <Text style={styles.cardLabel}>Codes colis: </Text>
            <Text style={styles.cardValue}>{packageCodes}</Text>
          </Text>
          {item.packages && item.packages.length > 0 && (
            <Text style={styles.cardLine}>
              <Text style={styles.cardLabel}>Nombre de colis: </Text>
              <Text style={styles.cardValue}>{item.packages.length}</Text>
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.receivedButton, isProcessing && styles.receivedButtonDisabled]}
            onPress={() => handleMarkAsReceived(item)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={COLORS.textInverse} />
            ) : (
              <>
                <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.textInverse} />
                <Text style={styles.receivedButtonText}>Colis reçu</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notReceivedButton}
            onPress={() => {
              Alert.alert('Information', 'Le colis sera conservé dans la liste pour vérification ultérieure.');
            }}
          >
            <MaterialCommunityIcons name="clock-alert-outline" size={18} color={COLORS.textInverse} />
            <Text style={styles.notReceivedButtonText}>Pas encore reçu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des commandes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
        <Text style={styles.title}>Les commandes</Text>
          {totalCount > 0 && (
            <Text style={styles.totalCount}>Total: {totalCount}</Text>
          )}
        </View>
      </View>

      <FlatList
        data={ordersByZone}
        renderItem={({ item: zoneGroup }) => (
          <View style={styles.zoneSection}>
            <View style={styles.zoneHeader}>
              <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
              <Text style={styles.zoneTitle}>{zoneGroup.zone}</Text>
              <View style={styles.zoneBadge}>
                <Text style={styles.zoneBadgeText}>{zoneGroup.count}</Text>
              </View>
            </View>
            {zoneGroup.parcels.map((order) => (
              <React.Fragment key={order.id}>
                {renderOrderItem({ item: order as Order })}
              </React.Fragment>
            ))}
          </View>
        )}
        keyExtractor={(item) => item.zone}
        contentContainerStyle={orders.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadOrders();
            }}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-variant-closed" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>Aucune commande</Text>
            <Text style={styles.emptySubtitle}>
              Les commandes des utilisateurs de PAKO CLIENT apparaîtront ici.
            </Text>
          </View>
        }
      />

      <Modal
        visible={showVerifyModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseVerifyModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vérifier le colis</Text>
              <TouchableOpacity onPress={handleCloseVerifyModal}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {currentOrder && (
              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>Numéro de commande: {currentOrder.orderNumber}</Text>
                <Text style={styles.modalLabel}>
                  Client: {currentOrder.customerName || currentOrder.customerId}
                </Text>
                <Text style={styles.modalLabel}>
                  Destinataire: {getClientDisplayName(currentOrder)}
                </Text>
                <Text style={styles.modalLabel}>
                  Téléphone destinataire: {currentOrder.receiverPhone}
                </Text>
                <Text style={styles.modalLabel}>Adresse: {currentOrder.deliveryAddress}</Text>
                {currentOrder.packages && currentOrder.packages.length > 0 && (
                  <Text style={styles.modalLabel}>
                    Codes colis: {currentOrder.packages.map((pkg) => pkg.packageCode).join(', ')}
                  </Text>
                )}

                <Text style={styles.modalLabel}>Notes de vérification (optionnel):</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Ajoutez des remarques sur l'état du colis..."
                  value={verifyNotes}
                  onChangeText={setVerifyNotes}
                  multiline
                  numberOfLines={4}
                />

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    currentOrder.id === processingOrderId && styles.modalButtonDisabled,
                  ]}
                  onPress={handleConfirmVerification}
                  disabled={currentOrder.id === processingOrderId}
                >
                  {currentOrder.id === processingOrderId ? (
                    <ActivityIndicator size="small" color={COLORS.textInverse} />
                  ) : (
                    <>
                  <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.textInverse} />
                  <Text style={styles.modalButtonText}>Confirmer la vérification</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalButtonSecondary} onPress={handleCloseVerifyModal}>
                  <Text style={styles.modalButtonSecondaryText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Toast de succès qui glisse du bas */}
      <BottomToast
        visible={showSuccessToast}
        title="Succès"
        message={successToastMessage}
        onClose={() => setShowSuccessToast(false)}
        duration={4000}
        type="success"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SIZES.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  title: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  totalCount: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusText: {
    fontWeight: '600',
  },
  listContent: {
    padding: SIZES.spacing.md,
    gap: SIZES.spacing.lg,
  },
  zoneSection: {
    marginBottom: SIZES.spacing.lg,
  },
  zoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.md,
    gap: SIZES.spacing.sm,
  },
  zoneTitle: {
    flex: 1,
    fontSize: SIZES.font.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  zoneBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneBadgeText: {
    fontSize: SIZES.font.xs,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  orderCard: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  orderNumber: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  orderDate: {
    fontSize: SIZES.font.sm,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginLeft: SIZES.spacing.md,
  },
  orderDetails: {
    gap: SIZES.spacing.md,
  },
  cardLine: {
    fontSize: SIZES.font.sm,
    lineHeight: 22,
  },
  cardLabel: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardValue: {
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.md,
  },
  receivedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    gap: SIZES.spacing.xs,
  },
  receivedButtonDisabled: {
    opacity: 0.6,
  },
  receivedButtonText: {
    color: COLORS.textInverse,
    fontSize: SIZES.font.md,
    fontWeight: '600',
  },
  notReceivedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warning,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    gap: SIZES.spacing.xs,
  },
  notReceivedButtonText: {
    color: COLORS.textInverse,
    fontSize: SIZES.font.md,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.spacing.md,
    color: COLORS.textSecondary,
    fontSize: SIZES.font.sm,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacing.lg,
    gap: SIZES.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: SIZES.spacing.lg,
    gap: SIZES.spacing.sm,
  },
  emptyTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SIZES.spacing.md,
  },
  emptySubtitle: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: SIZES.borderRadius.lg,
    borderTopRightRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  modalTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalBody: {
    gap: SIZES.spacing.md,
  },
  modalLabel: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.md,
    padding: SIZES.spacing.sm,
    fontSize: SIZES.font.sm,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: COLORS.surface,
  },
  modalButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    alignItems: 'center',
    marginTop: SIZES.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    color: COLORS.textInverse,
    fontSize: SIZES.font.md,
    fontWeight: '600',
  },
  modalButtonSecondary: {
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    alignItems: 'center',
    marginTop: SIZES.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalButtonSecondaryText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.font.md,
    fontWeight: '600',
  },
});

export default AgentOrdersScreen;

