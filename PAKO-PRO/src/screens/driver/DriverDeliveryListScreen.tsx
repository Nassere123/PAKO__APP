import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { deliveryService } from "../../services/deliveryService";
import { DeliveryMission, DeliveryStatus } from "../../types/delivery";
import { DriverDeliveriesStackParamList } from "../../types/navigation";
import { COLORS } from "../../constants/colors";
import { SIZES } from "../../constants/sizes";
import { useAuth } from "../../context/AuthContext";
import { groupParcelsByZone, ParcelsByZone } from "../../utils/zoneExtractor";

type NavigationProp = NativeStackNavigationProp<
  DriverDeliveriesStackParamList,
  "DriverDeliveryList"
>;
type RouteProps = RouteProp<DriverDeliveriesStackParamList, "DriverDeliveryList">;

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: "En attente",
  in_progress: "En cours",
  delivered: "Livré",
  issue: "Retourné",
};

const DriverDeliveryListScreen: React.FC = () => {
  const stackNavigation = useNavigation<NavigationProp>();
  const { params } = useRoute<RouteProps>();
  const { title, statuses } = params;
  
  // Navigation vers l'onglet Accueil
  const tabNavigation = stackNavigation.getParent<BottomTabNavigationProp<any>>();

  const { user } = useAuth();
  const [missions, setMissions] = useState<DeliveryMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMissions = useCallback(async () => {
    if (!user?.id) {
      setMissions([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await deliveryService.listAssignedDeliveries(user.id, statuses);
      setMissions(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statuses, user?.id]);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  // Recharger les missions quand l'écran est focus (après signature)
  useFocusEffect(
    useCallback(() => {
      loadMissions();
    }, [loadMissions])
  );

  // Appeler le destinataire
  const handleCallRecipient = useCallback((phone: string) => {
    if (!phone) {
      Alert.alert('Erreur', 'Numéro de téléphone non disponible');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch((err) => {
      Alert.alert('Erreur', 'Impossible de passer l\'appel');
      console.error(err);
    });
  }, []);

  // Ouvrir Google Maps avec le lieu de livraison
  const handleOpenDeliveryLocation = useCallback(async (mission: DeliveryMission) => {
    console.log('handleOpenDeliveryLocation appelé pour mission:', mission.code);
    console.log('dropoffLocation:', mission.dropoffLocation);
    
    // Vérifier que la destination a des coordonnées
    const rawLat = mission.dropoffLocation.latitude;
    const rawLon = mission.dropoffLocation.longitude;
    
    console.log('Coordonnées brutes - lat:', rawLat, 'lon:', rawLon);
    console.log('Types - lat:', typeof rawLat, 'lon:', typeof rawLon);
    
    if (rawLat === null || rawLat === undefined || rawLon === null || rawLon === undefined) {
      Alert.alert('Erreur', 'Coordonnées de destination non disponibles');
      return;
    }

    const lat = typeof rawLat === 'string' ? parseFloat(rawLat) : Number(rawLat);
    const lon = typeof rawLon === 'string' ? parseFloat(rawLon) : Number(rawLon);
    
    console.log('Coordonnées converties - lat:', lat, 'lon:', lon);
    
    // Valider que les coordonnées sont des nombres valides
    if (isNaN(lat) || isNaN(lon)) {
      Alert.alert('Erreur', 'Coordonnées de destination invalides');
      console.error('Coordonnées invalides après conversion:', { lat, lon });
      return;
    }
    
    // Détecter si les coordonnées sont inversées (pour Abidjan, Côte d'Ivoire)
    // Latitude normale: 5.0 à 5.5, Longitude normale: -4.5 à -3.5
    // Si lat est négatif et lon est positif, elles sont probablement inversées
    let finalLat = lat;
    let finalLon = lon;
    
    if (lat < 0 && lon > 0) {
      // Coordonnées probablement inversées
      console.warn('Coordonnées probablement inversées, correction automatique');
      finalLat = lon;
      finalLon = lat;
    } else if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      // Coordonnées clairement invalides
      Alert.alert('Erreur', 'Coordonnées de destination invalides');
      console.error('Coordonnées hors limites:', { lat, lon });
      return;
    }
    
    console.log('Coordonnées finales utilisées - lat:', finalLat, 'lon:', finalLon);
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${finalLat},${finalLon}&travelmode=driving`;
    console.log('URL Google Maps:', url);
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir Google Maps');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir Google Maps');
      console.error(error);
    }
  }, []);

  // Terminer la livraison et ouvrir l'écran de signature
  const handleCompleteDelivery = useCallback((mission: DeliveryMission) => {
    if (mission.status !== 'in_progress') {
      Alert.alert('Erreur', 'Cette livraison n\'est pas en cours');
      return;
    }
    stackNavigation.navigate('DriverSignature', {
      missionId: mission.id,
    });
  }, [stackNavigation]);

  // Commencer la livraison et ouvrir Google Maps
  const handleStartDelivery = useCallback(async (mission: DeliveryMission) => {
    // Vérifier que la destination a des coordonnées
    if (!mission.dropoffLocation.latitude || !mission.dropoffLocation.longitude) {
      Alert.alert('Erreur', 'Coordonnées de destination non disponibles');
      return;
    }

    Alert.alert(
      'Commencer la livraison',
      `Voulez-vous commencer la livraison du colis ${mission.code} ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Commencer',
          style: 'default',
          onPress: async () => {
            try {
              // Mettre à jour le statut
              await deliveryService.updateDelivery(mission.id, {
                status: 'in_progress',
              });
              
              // Ouvrir Google Maps avec la destination
              const lat = Number(mission.dropoffLocation.latitude);
              const lon = Number(mission.dropoffLocation.longitude);
              const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;
              
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
              } else {
                Alert.alert('Erreur', 'Impossible d\'ouvrir Google Maps');
              }
              
              // Recharger les missions en arrière-plan
              loadMissions();
            } catch (error) {
              console.error('Erreur lors du démarrage de la livraison:', error);
              Alert.alert('Erreur', 'Impossible de commencer la livraison');
            }
          },
        },
      ]
    );
  }, [loadMissions]);

  const subtitle = useMemo(() => {
    if (statuses.length === 1) {
      return `${missions.length} mission(s) · Statut "${STATUS_LABELS[statuses[0]]}"`;
    }
    return `${missions.length} mission(s) correspondant aux statuts sélectionnés`;
  }, [missions.length, statuses]);

  // Grouper les missions par zone de livraison
  const missionsByZone = useMemo(() => {
    // Adapter les missions pour le regroupement par zone
    const adaptedMissions = missions.map((mission) => ({
      ...mission,
      deliveryAddress: mission.dropoffLocation.label,
    }));
    return groupParcelsByZone<DeliveryMission & { deliveryAddress: string }>(adaptedMissions);
  }, [missions]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={stackNavigation.goBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTexts}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des missions...</Text>
        </View>
      ) : (
        <FlatList
          data={missionsByZone}
          keyExtractor={(item) => item.zone}
          contentContainerStyle={
            missions.length === 0 ? styles.emptyContainer : styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadMissions();
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
              {zoneGroup.parcels.map((item) => {
                // Les colis livrés ne sont pas cliquables
                const isDelivered = item.status === 'delivered';
                const CardComponent = isDelivered ? View : TouchableOpacity;
                const cardProps = isDelivered 
                  ? {} 
                  : {
                      onPress: () => handleOpenDeliveryLocation(item),
                      activeOpacity: 0.7,
                    };

                return (
                  <CardComponent
                    key={item.id}
                    style={styles.card}
                    {...cardProps}
                  >
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardId}>{item.code || item.id}</Text>
                    <View style={[styles.badge, styles[`badge_${item.status}`]]}>
                      <Text style={styles.badgeText}>{STATUS_LABELS[item.status]}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardLine}>
                    <Text style={styles.cardLabel}>Client: </Text>
                    {item.customerName}
                  </Text>
                  {item.customerPhone && (
                    <Text style={styles.cardLine}>
                      <Text style={styles.cardLabel}>Téléphone destinataire: </Text>
                      {item.customerPhone}
                    </Text>
                  )}
                  <Text style={styles.cardLine}>
                    <Text style={styles.cardLabel}>Pickup: </Text>
                    {item.pickupStation.label}
                  </Text>
                  <Text style={styles.cardLine}>
                    <Text style={styles.cardLabel}>Destination: </Text>
                    {item.dropoffLocation.label}
                  </Text>
                  <Text style={styles.cardLine}>
                    <Text style={styles.cardLabel}>Programme: </Text>
                    {new Date(item.scheduledAt).toLocaleString()}
                  </Text>
                  {item.totalPrice !== undefined && (
                    <Text style={styles.cardLine}>
                      <Text style={styles.cardLabel}>Montant: </Text>
                      <Text style={styles.priceText}>
                        {item.totalPrice.toLocaleString('fr-FR')} FCFA
                      </Text>
                    </Text>
                  )}
                  {item.paymentMethod && (
                    <Text style={styles.cardLine}>
                      <Text style={styles.cardLabel}>Paiement: </Text>
                      <Text style={styles.paymentMethodText}>{item.paymentMethod}</Text>
                    </Text>
                  )}
                  {/* Boutons d'action - Masqués pour les colis livrés */}
                  {item.status !== 'delivered' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.callButton]}
                        onPress={() => handleCallRecipient(item.customerPhone || item.dropoffLocation.contactPhone || '')}
                        disabled={!item.customerPhone && !item.dropoffLocation.contactPhone}
                      >
                        <MaterialCommunityIcons name="phone" size={18} color={COLORS.textInverse} />
                        <Text style={styles.actionButtonText}>Appeler</Text>
                      </TouchableOpacity>
                      {item.status === 'in_progress' && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.completeButton]}
                          onPress={() => handleCompleteDelivery(item)}
                        >
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={18}
                            color={COLORS.textInverse}
                          />
                          <Text style={styles.actionButtonText}>Terminer</Text>
                        </TouchableOpacity>
                      )}
                      {item.status !== 'in_progress' && item.status !== 'delivered' && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deliverButton]}
                          onPress={() => handleStartDelivery(item)}
                        >
                          <MaterialCommunityIcons
                            name="play-circle"
                            size={18}
                            color={COLORS.textInverse}
                          />
                          <Text style={styles.actionButtonText}>
                            Commencer la livraison
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  </CardComponent>
                );
              })}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="package-variant"
                size={48}
                color={COLORS.textSecondary}
              />
              <Text style={styles.emptyTitle}>Aucun colis à afficher</Text>
              <Text style={styles.emptySubtitle}>
                Revenez plus tard ou tirez pour rafraîchir afin de vérifier les nouvelles missions.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.md,
    gap: SIZES.spacing.md,
  },
  headerTexts: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: SIZES.font.lg,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.spacing.lg,
  },
  loadingText: {
    marginTop: SIZES.spacing.sm,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xl,
    gap: SIZES.spacing.md,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardId: {
    fontSize: SIZES.font.md,
    fontWeight: "700",
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
    fontWeight: "700",
  },
  badge_pending: {
    backgroundColor: COLORS.warning,
  },
  badge_in_progress: {
    backgroundColor: COLORS.info,
  },
  badge_delivered: {
    backgroundColor: COLORS.success,
  },
  badge_issue: {
    backgroundColor: COLORS.danger,
  },
  cardLine: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  cardLabel: {
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SIZES.spacing.lg,
    gap: SIZES.spacing.md,
  },
  emptyState: {
    alignItems: "center",
    padding: SIZES.spacing.lg,
    gap: SIZES.spacing.sm,
  },
  emptyTitle: {
    fontSize: SIZES.font.md,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  priceText: {
    fontSize: SIZES.font.sm,
    fontWeight: "700",
    color: COLORS.success,
  },
  paymentMethodText: {
    fontSize: SIZES.font.sm,
    fontWeight: "600",
    color: COLORS.primary,
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
  actionButtons: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.sm,
    paddingTop: SIZES.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    gap: SIZES.spacing.xs,
  },
  callButton: {
    backgroundColor: COLORS.info,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
  deliverButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: SIZES.font.sm,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  actionButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.6,
  },
  actionButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
});

export default DriverDeliveryListScreen;


