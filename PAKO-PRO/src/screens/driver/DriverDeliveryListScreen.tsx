import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { deliveryService } from "../../services/deliveryService";
import { DeliveryMission, DeliveryStatus } from "../../types/delivery";
import { DriverDeliveriesStackParamList } from "../../types/navigation";
import { COLORS } from "../../constants/colors";
import { SIZES } from "../../constants/sizes";

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
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<RouteProps>();
  const { title, statuses } = params;

  const [missions, setMissions] = useState<DeliveryMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMissions = useCallback(async () => {
    try {
      const data = await deliveryService.listAssignedDeliveries();
      const filtered = data.filter((mission) => statuses.includes(mission.status));
      setMissions(filtered);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statuses]);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const subtitle = useMemo(() => {
    if (statuses.length === 1) {
      return `${missions.length} mission(s) · Statut "${STATUS_LABELS[statuses[0]]}"`;
    }
    return `${missions.length} mission(s) correspondant aux statuts sélectionnés`;
  }, [missions.length, statuses]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={navigation.goBack}
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
          data={missions}
          keyExtractor={(item) => item.id}
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
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardId}>{item.id}</Text>
                <View style={[styles.badge, styles[`badge_${item.status}`]]}>
                  <Text style={styles.badgeText}>{STATUS_LABELS[item.status]}</Text>
                </View>
              </View>
              <Text style={styles.cardLine}>
                <Text style={styles.cardLabel}>Client: </Text>
                {item.customerName}
              </Text>
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
});

export default DriverDeliveryListScreen;


