import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { parcelService } from '../../services/parcelService';
import { driverService } from '../../services/driverService';
import { notificationsService } from '../../lib/api/services/notifications.service';
import { Parcel, ParcelStatus, Driver } from '../../types/parcel';
import { AgentParcelsStackParamList } from '../../types/navigation';
import { groupParcelsByZone } from '../../utils/zoneExtractor';

type NavigationProp = NativeStackNavigationProp<AgentParcelsStackParamList, 'AgentParcelList'>;
type RouteProps = RouteProp<AgentParcelsStackParamList, 'AgentParcelList'>;

const STATUS_LABELS: Record<ParcelStatus, string> = {
  arrived: 'Arrivé',
  verified: 'Vérifié',
  ready_for_delivery: 'Prêt pour livraison',
  assigned: 'Assigné',
  delivered: 'Livré',
};

const STATUS_ACCENTS: Record<
  ParcelStatus,
  { badgeBg: string; badgeText: string; subtitleColor: string }
> = {
  arrived: {
    badgeBg: '#E3F2FD',
    badgeText: COLORS.primary,
    subtitleColor: COLORS.textSecondary,
  },
  verified: {
    badgeBg: '#FFE8CC',
    badgeText: '#B15900',
    subtitleColor: '#B15900',
  },
  ready_for_delivery: {
    badgeBg: '#FFF2E5',
    badgeText: '#C25700',
    subtitleColor: '#C25700',
  },
  assigned: {
    badgeBg: '#E8F4FF',
    badgeText: COLORS.primary,
    subtitleColor: COLORS.primary,
  },
  delivered: {
    badgeBg: '#E7F8EF',
    badgeText: COLORS.success,
    subtitleColor: COLORS.success,
  },
};

const AgentParcelListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<RouteProps>();
  const { title, status } = params;

  const statusAccent = useMemo(() => {
    return STATUS_ACCENTS[status] || {
      badgeBg: COLORS.surface,
      badgeText: COLORS.textPrimary,
      subtitleColor: COLORS.textSecondary,
    };
  }, [status]);

  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const stationId = 'STATION-001';

  // Fonction pour formater la date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Grouper les colis par zone
  const parcelsByZone = groupParcelsByZone<Parcel>(parcels);

  const loadParcels = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const data = await parcelService.getParcelsByStatus(status, stationId);
      setParcels(data);
    } catch (error) {
      console.error('Erreur lors du chargement des colis:', error);
      Alert.alert('Erreur', 'Impossible de charger les colis');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [status, stationId]);

  const loadAvailableDrivers = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoadingDrivers(true);
    }
    try {
      const drivers = await driverService.getAvailableDrivers();
      console.log('Livreurs chargés:', drivers.length);
      if (drivers.length === 0) {
        console.warn('Aucun livreur disponible trouvé. Vérifiez que des livreurs existent dans la base de données avec le statut AVAILABLE et isActive: true');
      }
      setAvailableDrivers(drivers);
    } catch (error) {
      console.error('Erreur lors du chargement des livreurs:', error);
      // Ne pas afficher d'alerte pour les rafraîchissements automatiques
      if (showLoading) {
        Alert.alert('Erreur', 'Impossible de charger les livreurs disponibles');
      }
    } finally {
      if (showLoading) {
        setLoadingDrivers(false);
      }
    }
  }, []);

  // Charger les colis au montage avec l'indicateur de chargement
  useEffect(() => {
    loadParcels(true);
  }, [loadParcels]);

  // Recharger les colis chaque fois que l'écran est mis au focus
  // Cela permet de synchroniser avec les changements dans AgentOrdersScreen
  useFocusEffect(
    useCallback(() => {
      loadParcels(false);
    }, [loadParcels])
  );

  // Rafraîchir automatiquement la liste des livreurs toutes les 5 secondes quand le modal est ouvert
  useEffect(() => {
    if (!showAssignModal) {
      return;
    }

    // Charger immédiatement
    loadAvailableDrivers(false);

    // Configurer l'intervalle de rafraîchissement (toutes les 5 secondes)
    const interval = setInterval(() => {
      console.log('🔄 Rafraîchissement automatique de la liste des livreurs...');
      loadAvailableDrivers(false);
    }, 5000); // 5 secondes

    // Nettoyer l'intervalle quand le modal est fermé
    return () => {
      clearInterval(interval);
    };
  }, [showAssignModal, loadAvailableDrivers]);

  const handleVerifyParcel = useCallback(async () => {
    if (!selectedParcel) return;

    try {
      await parcelService.verifyParcel(selectedParcel.id, {
        verified: true,
        notes: verifyNotes.trim() || undefined,
      });

      Alert.alert('Succès', 'Le colis a été vérifié');
      setShowVerifyModal(false);
      setVerifyNotes('');
      setSelectedParcel(null);
      await loadParcels();
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      Alert.alert('Erreur', 'Impossible de vérifier le colis');
    }
  }, [selectedParcel, verifyNotes, loadParcels]);

  const handleMarkAsReady = useCallback(async (parcel: Parcel) => {
    try {
      await parcelService.markAsReadyForDelivery(parcel.id);
      Alert.alert('Succès', 'Le colis est maintenant prêt pour attribution');
      await loadParcels();
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de marquer le colis comme prêt');
    }
  }, [loadParcels]);

  const handleOpenAssignModal = useCallback(
    async (parcel: Parcel) => {
      if (parcel.status !== 'ready_for_delivery') {
        Alert.alert('Attention', 'Le colis doit être vérifié avant attribution');
        return;
      }

      setSelectedParcel(parcel);
      await loadAvailableDrivers(true);
      setShowAssignModal(true);
    },
    [loadAvailableDrivers],
  );

  const handleAssignParcel = useCallback(async () => {
    if (!selectedParcel || !selectedDriver) return;

    // Vérifier que le livreur est connecté (isAvailable = true)
    if (!selectedDriver.isAvailable) {
      Alert.alert(
        'Livreur non disponible',
        'Ce livreur n\'est pas connecté. Seuls les livreurs connectés peuvent recevoir des colis.'
      );
      return;
    }

    try {
      await parcelService.assignParcelToDriver(selectedParcel.id, {
        driverId: selectedDriver.id,
        driverName: selectedDriver.name,
      });

      await driverService.incrementDriverDeliveries(selectedDriver.id);

      // Envoyer une notification SMS au livreur
      try {
        const message = `Bonjour ${selectedDriver.name}, un nouveau colis vous a été assigné.\n\nCode colis: ${selectedParcel.trackingNumber}\nDestinataire: ${selectedParcel.receiverName}\nAdresse: ${selectedParcel.receiverAddress}\n\nMerci de récupérer le colis à la gare.`;
        await notificationsService.sendSMS(selectedDriver.phone, message);
        console.log('SMS envoyé au livreur:', selectedDriver.phone);
      } catch (notificationError) {
        console.error('Erreur lors de l\'envoi de la notification:', notificationError);
        // Ne pas bloquer l'assignation si la notification échoue
      }

      // Envoyer une notification push si possible
      try {
        if (selectedDriver.userId) {
          await notificationsService.sendPushNotification(
            selectedDriver.userId,
            'Nouveau colis assigné',
            `Un colis (${selectedParcel.trackingNumber}) vous a été assigné. Destinataire: ${selectedParcel.receiverName}`
          );
          console.log('Notification push envoyée au livreur:', selectedDriver.userId);
        }
      } catch (pushError) {
        console.error('Erreur lors de l\'envoi de la notification push:', pushError);
        // Ne pas bloquer l'assignation si la notification push échoue
      }

      Alert.alert('Succès', `Le colis a été assigné à ${selectedDriver.name}. Une notification a été envoyée.`);
      setShowAssignModal(false);
      setSelectedParcel(null);
      setSelectedDriver(null);
      await loadParcels();
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible d\'assigner le colis');
    }
  }, [selectedParcel, selectedDriver, loadParcels]);

  const getStatusColor = (parcelStatus: ParcelStatus): string => {
    switch (parcelStatus) {
      case 'arrived':
        return COLORS.warning;
      case 'verified':
        return COLORS.info;
      case 'ready_for_delivery':
        return COLORS.success;
      case 'assigned':
        return COLORS.primary;
      case 'delivered':
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTexts}>
          <View style={[styles.titlePill, { backgroundColor: statusAccent.badgeBg }]}>
            <Text style={[styles.title, { color: statusAccent.badgeText }]}>{title}</Text>
          </View>
          <Text style={[styles.subtitle, { color: statusAccent.subtitleColor }]}>
            {parcels.length} colis · Statut "{STATUS_LABELS[status]}"
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des colis...</Text>
        </View>
      ) : (
        <FlatList
          data={parcelsByZone}
          keyExtractor={(item) => item.zone}
          contentContainerStyle={parcels.length === 0 ? styles.emptyContainer : styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadParcels();
              }}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item: zoneGroup }) => (
            <View style={styles.zoneSection}>
              <View style={styles.zoneHeader}>
                <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
                <Text style={styles.zoneTitle}>{zoneGroup.zone}</Text>
                <View style={styles.zoneBadge}>
                  <Text style={styles.zoneBadgeText}>{zoneGroup.count}</Text>
                </View>
              </View>
              {zoneGroup.parcels.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => {
                    if (item.status === 'arrived') {
                      setSelectedParcel(item);
                      setShowVerifyModal(true);
                    } else if (item.status === 'ready_for_delivery') {
                      handleOpenAssignModal(item);
                    }
                  }}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardId}>{item.trackingNumber}</Text>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
                      <Text style={styles.badgeText}>{STATUS_LABELS[item.status]}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardLine}>
                    <Text style={styles.cardLabel}>Expéditeur: </Text>
                    {item.senderPhone}
                  </Text>
                  <Text style={styles.cardLine}>
                    <Text style={styles.cardLabel}>Destinataire: </Text>
                    {item.receiverName}
                  </Text>
                  <Text style={styles.cardLine}>
                    <Text style={styles.cardLabel}>Téléphone destinataire: </Text>
                    {item.receiverPhone}
                  </Text>
                  <Text style={styles.cardLine}>
                    <Text style={styles.cardLabel}>Adresse: </Text>
                    {item.receiverAddress}
                  </Text>
                  <Text style={styles.cardLine}>
                    <Text style={styles.cardLabel}>Code colis: </Text>
                    {item.trackingNumber}
                  </Text>
                  {item.orderDate && (
                    <Text style={styles.cardLine}>
                      <Text style={styles.cardLabel}>Date de commande: </Text>
                      {formatDate(item.orderDate)}
                    </Text>
                  )}
                  {item.description && (
                    <Text style={styles.cardLine}>
                      <Text style={styles.cardLabel}>Description: </Text>
                      {item.description}
                    </Text>
                  )}
                  {item.assignedToDriverName && (
                    <Text style={styles.cardLine}>
                      <Text style={styles.cardLabel}>Livreur: </Text>
                      {item.assignedToDriverName}
                    </Text>
                  )}
                  <View style={styles.cardActions}>
                    {item.status === 'arrived' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.verifyButton]}
                        onPress={() => {
                          setSelectedParcel(item);
                          setShowVerifyModal(true);
                        }}
                      >
                        <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.textInverse} />
                        <Text style={styles.actionButtonText}>Vérifier</Text>
                      </TouchableOpacity>
                    )}
                    {item.status === 'verified' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.readyButton]}
                        onPress={() => handleMarkAsReady(item)}
                      >
                        <MaterialCommunityIcons name="check-all" size={18} color={COLORS.textInverse} />
                        <Text style={styles.actionButtonText}>Marquer comme prêt</Text>
                      </TouchableOpacity>
                    )}
                    {item.status === 'ready_for_delivery' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.assignButton]}
                        onPress={() => handleOpenAssignModal(item)}
                      >
                        <MaterialCommunityIcons name="account-plus" size={18} color={COLORS.textInverse} />
                        <Text style={styles.actionButtonText}>Assigner</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="package-variant-closed" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>Aucun colis à afficher</Text>
              <Text style={styles.emptySubtitle}>
                Revenez plus tard ou tirez pour rafraîchir afin de vérifier les nouveaux colis.
              </Text>
            </View>
          }
        />
      )}

      {/* Modal de vérification */}
      <Modal
        visible={showVerifyModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowVerifyModal(false);
          setVerifyNotes('');
          setSelectedParcel(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vérifier le colis</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowVerifyModal(false);
                  setVerifyNotes('');
                  setSelectedParcel(null);
                }}
              >
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

                {selectedParcel && (
                  <View style={styles.modalBody}>
                    <Text style={styles.modalLabel}>Numéro de suivi: {selectedParcel.trackingNumber}</Text>
                    {selectedParcel.orderDate && (
                      <Text style={styles.modalLabel}>Date de commande: {formatDate(selectedParcel.orderDate)}</Text>
                    )}
                    <Text style={styles.modalLabel}>Destinataire: {selectedParcel.receiverName}</Text>
                    <Text style={styles.modalLabel}>Téléphone destinataire: {selectedParcel.receiverPhone}</Text>
                    <Text style={styles.modalLabel}>Adresse: {selectedParcel.receiverAddress}</Text>

                <Text style={styles.modalLabel}>Notes (optionnel):</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Ajouter des notes sur le colis..."
                  value={verifyNotes}
                  onChangeText={setVerifyNotes}
                  multiline
                  numberOfLines={4}
                />

                <TouchableOpacity style={styles.modalButton} onPress={handleVerifyParcel}>
                  <Text style={styles.modalButtonText}>Confirmer la vérification</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal d'assignation */}
      <Modal
        visible={showAssignModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAssignModal(false);
          setSelectedParcel(null);
          setSelectedDriver(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Assigner à un livreur</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAssignModal(false);
                  setSelectedParcel(null);
                  setSelectedDriver(null);
                }}
              >
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedParcel && (
              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>Colis: {selectedParcel.trackingNumber}</Text>
                <Text style={styles.modalLabel}>Destinataire: {selectedParcel.receiverName}</Text>

                <Text style={styles.modalLabel}>Livreurs disponibles:</Text>
                {loadingDrivers ? (
                  <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
                ) : availableDrivers.length === 0 ? (
                  <View style={styles.noDriversContainer}>
                    <MaterialCommunityIcons name="alert-circle" size={24} color={COLORS.warning} />
                    <Text style={styles.noDriversText}>
                      Aucun livreur trouvé dans la base de données.
                    </Text>
                    <Text style={styles.noDriversSubtext}>
                      Vérifiez que des livreurs ont été créés avec isActive: true.
                    </Text>
                    <Text style={styles.noDriversSubtext}>
                      Consultez les logs de la console pour plus de détails.
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={availableDrivers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                      const isConnected = item.isAvailable;
                      const isSelected = selectedDriver?.id === item.id;
                      const isDisabled = !isConnected;
                      
                      return (
                        <TouchableOpacity
                          style={[
                            styles.driverItem,
                            isSelected && styles.driverItemSelected,
                            isDisabled && styles.driverItemDisabled,
                          ]}
                          onPress={() => {
                            if (isDisabled) {
                              Alert.alert(
                                'Livreur non disponible',
                                'Ce livreur n\'est pas connecté. Seuls les livreurs connectés peuvent recevoir des colis.'
                              );
                              return;
                            }
                            setSelectedDriver(item);
                          }}
                          disabled={isDisabled}
                        >
                          <View style={styles.driverInfo}>
                            <MaterialCommunityIcons
                              name="account-circle"
                              size={32}
                              color={
                                isDisabled
                                  ? COLORS.textSecondary
                                  : isSelected
                                  ? COLORS.primary
                                  : COLORS.textPrimary
                              }
                            />
                            <View style={styles.driverDetails}>
                              <View style={styles.driverNameRow}>
                                <Text style={[styles.driverName, isDisabled && styles.driverNameDisabled]}>
                                  {item.name}
                                </Text>
                                {isConnected ? (
                                  <View style={styles.onlineBadge}>
                                    <MaterialCommunityIcons name="circle" size={8} color={COLORS.success} />
                                    <Text style={styles.onlineText}>Connecté</Text>
                                  </View>
                                ) : (
                                  <View style={styles.offlineBadge}>
                                    <MaterialCommunityIcons name="circle" size={8} color={COLORS.textSecondary} />
                                    <Text style={styles.offlineText}>Déconnecté</Text>
                                  </View>
                                )}
                              </View>
                            <Text style={styles.driverPhone}>{item.phone}</Text>
                            <View style={styles.driverStats}>
                              <Text style={styles.driverStat}>
                                {item.rating ? `⭐ ${item.rating}` : 'N/A'}
                              </Text>
                              <Text style={styles.driverStat}>{item.vehicleType || 'Moto'}</Text>
                              <Text style={styles.driverStat}>
                                {item.currentDeliveriesCount} livraison{item.currentDeliveriesCount > 1 ? 's' : ''}
                              </Text>
                            </View>
                          </View>
                        </View>
                        {selectedDriver?.id === item.id && (
                          <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />
                        )}
                      </TouchableOpacity>
                    );
                    }}
                    style={styles.driversList}
                  />
                )}

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    (!selectedDriver || !selectedDriver.isAvailable || availableDrivers.length === 0) && styles.modalButtonDisabled,
                  ]}
                  onPress={handleAssignParcel}
                  disabled={!selectedDriver || !selectedDriver.isAvailable || availableDrivers.length === 0}
                >
                  <Text style={styles.modalButtonText}>
                    {availableDrivers.length === 0
                      ? 'Aucun livreur disponible'
                      : selectedDriver
                      ? `Assigner à ${selectedDriver.name}`
                      : 'Sélectionner un livreur'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight * 0.4 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.md,
    gap: SIZES.spacing.md,
  },
  headerTexts: {
    flex: 1,
    gap: SIZES.spacing.xs,
  },
  titlePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.lg,
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
  title: {
    fontSize: SIZES.font.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.spacing.lg,
  },
  loadingText: {
    marginTop: SIZES.spacing.sm,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xl,
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    padding: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.xs,
  },
  cardId: {
    fontSize: SIZES.font.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: SIZES.font.xs,
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  cardLine: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  cardLabel: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cardActions: {
    marginTop: SIZES.spacing.sm,
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
    gap: SIZES.spacing.xs,
  },
  verifyButton: {
    backgroundColor: COLORS.success,
  },
  readyButton: {
    backgroundColor: COLORS.info,
  },
  assignButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.textInverse,
    fontSize: SIZES.font.sm,
    fontWeight: '600',
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
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    alignItems: 'center',
    marginTop: SIZES.spacing.md,
  },
  modalButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.5,
  },
  modalButtonText: {
    color: COLORS.textInverse,
    fontSize: SIZES.font.md,
    fontWeight: '600',
  },
  driversList: {
    maxHeight: 300,
  },
  driverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
  },
  driverItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  driverItemDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.background + '80',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverDetails: {
    marginLeft: SIZES.spacing.sm,
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  driverName: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  driverNameDisabled: {
    color: COLORS.textSecondary,
  },
  driverPhone: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  driverStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.xs,
  },
  driverStat: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.textSecondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  onlineText: {
    fontSize: SIZES.font.xs,
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: 4,
  },
  offlineText: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  loader: {
    marginVertical: SIZES.spacing.lg,
  },
  noDriversContainer: {
    alignItems: 'center',
    padding: SIZES.spacing.lg,
    gap: SIZES.spacing.sm,
  },
  noDriversText: {
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontSize: SIZES.font.md,
    fontWeight: '600',
    marginTop: SIZES.spacing.sm,
  },
  noDriversSubtext: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: SIZES.font.sm,
    marginTop: SIZES.spacing.xs,
  },
});

export default AgentParcelListScreen;

