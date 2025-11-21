import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { SIZES } from "../../constants/sizes";
import { deliveryService } from "../../services/deliveryService";
import { DeliveryMission } from "../../types/delivery";
import { DriverDeliveriesStackParamList } from "../../types/navigation";
import { useAuth } from "../../context/AuthContext";

const DriverDeliveriesScreen: React.FC = () => {
  const { user } = useAuth();
  const [missions, setMissions] = useState<DeliveryMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const stackNavigation =
    useNavigation<NativeStackNavigationProp<DriverDeliveriesStackParamList, "DriverDeliveriesHome">>();
  
  // Navigation vers l'onglet Accueil
  const tabNavigation = stackNavigation.getParent<BottomTabNavigationProp<any>>();

  const loadMissions = useCallback(async () => {
    if (!user?.id) {
      setMissions([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await deliveryService.listAssignedDeliveries(user.id);
      setMissions(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const summary = useMemo(() => {
    const total = missions.length;
    const pending = missions.filter((mission) => mission.status === "pending").length;
    const inProgress = missions.filter((mission) => mission.status === "in_progress").length;
    const delivered = missions.filter((mission) => mission.status === "delivered").length;
    const issues = missions.filter((mission) => mission.status === "issue").length;
    return { total, pending, inProgress, delivered, issues };
  }, [missions]);

  // Trouver la première mission en attente
  const nextPendingMission = useMemo(() => {
    return missions.find((mission) => mission.status === "pending");
  }, [missions]);

  // Commencer la livraison et ouvrir Google Maps
  const handleStartDelivery = useCallback(async () => {
    if (!nextPendingMission) {
      Alert.alert('Aucune mission', 'Aucune mission en attente disponible');
      return;
    }

    // Vérifier que la destination a des coordonnées
    if (!nextPendingMission.dropoffLocation.latitude || !nextPendingMission.dropoffLocation.longitude) {
      Alert.alert('Erreur', 'Coordonnées de destination non disponibles');
      return;
    }

    Alert.alert(
      'Commencer la livraison',
      `Voulez-vous commencer la livraison du colis ${nextPendingMission.code} ?`,
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
              await deliveryService.updateDelivery(nextPendingMission.id, {
                status: 'in_progress',
              });
              
              // Ouvrir Google Maps avec la destination
              const lat = Number(nextPendingMission.dropoffLocation.latitude);
              const lon = Number(nextPendingMission.dropoffLocation.longitude);
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
              Alert.alert('Erreur', `Impossible de commencer la livraison: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
            }
          },
        },
      ]
    );
  }, [nextPendingMission, loadMissions]);

  const summaryCards = useMemo(
    () => [
      {
        id: "awaiting",
        title: "Colis en attente de livraison",
        count: summary.pending + summary.inProgress,
        description: "Missions en attente ou en preparation",
        statuses: ["pending", "in_progress"] as DeliveryMission["status"][],
        emptyMessage: "Aucun colis en attente pour le moment.",
          },
      {
        id: "delivered",
        title: "Colis livrés",
        count: summary.delivered,
        description: "Livraisons finalisées avec succès",
        statuses: ["delivered"] as DeliveryMission["status"][],
        emptyMessage: "Aucun colis livré pour le moment.",
      },
      {
        id: "issues",
        title: "Colis retournés",
        count: summary.issues,
        description: "Colis annulés ou retournés",
        statuses: ["issue"] as DeliveryMission["status"][],
        emptyMessage: "Aucun colis retourné pour le moment.",
      },
    ],
    [summary.delivered, summary.inProgress, summary.issues, summary.pending],
  );
  const handleNavigateToList = useCallback(
    (card: (typeof summaryCards)[number]) => {
      stackNavigation.navigate("DriverDeliveryList", {
        title: card.title,
        statuses: card.statuses,
      });
    },
    [stackNavigation, summaryCards],
  );

  // Calculer le total affiché
  const displayedTotal = useMemo(
    () => summaryCards.reduce((total, card) => total + card.count, 0),
    [summaryCards],
  );

  // Séparer les cartes : 2 premières en haut, dernière en bas
  const topCards = summaryCards.slice(0, 2);
  const bottomCard = summaryCards[2];

  // Fonction pour obtenir la couleur selon le type de carte
  const getCardColor = (cardId: string) => {
    if (cardId === "awaiting") return COLORS.warning;
    if (cardId === "delivered") return COLORS.success;
    return COLORS.danger;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Missions assignées</Text>
        {displayedTotal > 0 && (
          <Text style={styles.subtitle}>{displayedTotal} mission{displayedTotal > 1 ? 's' : ''} au total</Text>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
      >
        {/* Deux cartes en haut */}
        <View style={styles.topRow}>
          {topCards.map((card) => {
            const cardColor = getCardColor(card.id);
                return (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.85}
                style={[styles.summaryCard, { borderColor: cardColor }]}
                onPress={() => handleNavigateToList(card)}
              >
                <Text style={styles.summaryTitle}>{card.title.toUpperCase()}</Text>
                <Text style={[styles.summaryCount, { color: cardColor }]}>{card.count}</Text>
                <Text style={styles.summaryDescription}>{card.description}</Text>
                <Text style={styles.summaryHint}>Appuyez pour afficher la liste</Text>
              </TouchableOpacity>
            );
          })}
            </View>

        {/* Une carte en bas, centrée */}
        {bottomCard && (
          <View style={styles.bottomRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.summaryCard,
                styles.bottomCard,
                { borderColor: getCardColor(bottomCard.id) },
              ]}
              onPress={() => handleNavigateToList(bottomCard)}
            >
              <Text style={styles.summaryTitle}>{bottomCard.title.toUpperCase()}</Text>
              <Text style={[styles.summaryCount, { color: getCardColor(bottomCard.id) }]}>
                {bottomCard.count}
              </Text>
              <Text style={styles.summaryDescription}>{bottomCard.description}</Text>
              <Text style={styles.summaryHint}>Appuyez pour afficher la liste</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bouton Commencer la livraison */}
        {nextPendingMission && !loading && (
          <View style={styles.startDeliveryContainer}>
            <TouchableOpacity
              style={styles.startDeliveryButton}
              onPress={handleStartDelivery}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="play-circle" size={24} color={COLORS.textInverse} />
              <View style={styles.startDeliveryButtonContent}>
                <Text style={styles.startDeliveryButtonText}>Commencer la livraison</Text>
                <Text style={styles.startDeliverySubtext}>
                  Colis {nextPendingMission.code}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Chargement des livraisons...</Text>
          </View>
        ) : null}
          </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Fond gris très clair pour la profondeur
  },
  header: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.xl,
    paddingBottom: SIZES.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1F36', // Bleu foncé / gris anthracite
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.xs,
    fontWeight: '500',
  },
  topRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    gap: SIZES.spacing.md,
  },
  bottomRow: {
    paddingHorizontal: SIZES.spacing.lg,
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 20, // Coins plus arrondis
    paddingVertical: SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.lg,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2, // Bordure plus subtile
    minHeight: 180,
    // Ombres douces
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  bottomCard: {
    width: '100%',
    maxWidth: '100%',
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2C3E50',
    textTransform: 'uppercase',
    marginBottom: SIZES.spacing.md,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  summaryCount: {
    fontSize: 56, // Chiffres beaucoup plus grands
    fontWeight: '800',
    marginVertical: SIZES.spacing.sm,
    letterSpacing: -2,
  },
  summaryDescription: {
    marginTop: SIZES.spacing.sm,
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: SIZES.font.sm,
    fontWeight: '400',
    lineHeight: 20,
  },
  summaryHint: {
    marginTop: SIZES.spacing.md,
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.7,
  },
  scrollContent: {
    paddingBottom: SIZES.spacing.xl,
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
  startDeliveryContainer: {
    paddingHorizontal: SIZES.spacing.lg,
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  startDeliveryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startDeliveryButtonContent: {
    alignItems: 'center',
  },
  startDeliveryButtonText: {
    fontSize: SIZES.font.md,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  startDeliverySubtext: {
    fontSize: SIZES.font.xs,
    color: COLORS.textInverse,
    opacity: 0.9,
    marginTop: 2,
  },
});

export default DriverDeliveriesScreen;

