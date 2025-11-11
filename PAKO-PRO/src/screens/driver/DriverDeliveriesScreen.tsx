import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { COLORS } from "../../constants/colors";
import { SIZES } from "../../constants/sizes";
import { deliveryService } from "../../services/deliveryService";
import { DeliveryMission } from "../../types/delivery";
import { DriverDeliveriesStackParamList } from "../../types/navigation";

const DriverDeliveriesScreen: React.FC = () => {
  const [missions, setMissions] = useState<DeliveryMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<DriverDeliveriesStackParamList, "DriverDeliveriesHome">>();

  const loadMissions = useCallback(async () => {
    try {
      const data = await deliveryService.listAssignedDeliveries();
      setMissions(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
      navigation.navigate("DriverDeliveryList", {
        title: card.title,
        statuses: card.statuses,
      });
    },
    [navigation, summaryCards],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Missions assignees</Text>
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
        <View style={styles.summaryRow}>
          {summaryCards.map((card) => {
            return (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.85}
                style={[
                  styles.summaryCard,
                  card.id === "awaiting"
                    ? styles.summaryCardInProgress
                    : card.id === "delivered"
                    ? styles.summaryCardSuccess
                    : styles.summaryCardIssue,
                ]}
                onPress={() => handleNavigateToList(card)}
              >
                <Text style={styles.summaryTitle}>{card.title}</Text>
                <Text style={styles.summaryCount}>{card.count}</Text>
                <Text style={styles.summaryDescription}>{card.description}</Text>
                <Text style={styles.summaryHint}>Appuyez pour afficher la liste</Text>
              </TouchableOpacity>
            );
          })}
        </View>

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
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.md,
  },
  title: {
    fontSize: SIZES.font.xl,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
    gap: SIZES.spacing.sm,
  },
  summaryCard: {
    flex: 1,
    minWidth: 110,
    borderRadius: SIZES.borderRadius.lg,
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCardSuccess: {
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  summaryCardInProgress: {
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  summaryCardIssue: {
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  summaryTitle: {
    fontSize: SIZES.font.xs,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textTransform: "uppercase",
    marginBottom: SIZES.spacing.xs,
  },
  summaryCount: {
    fontSize: SIZES.font.xxl,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  summaryDescription: {
    marginTop: SIZES.spacing.xs,
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: SIZES.font.xs,
  },
  summaryHint: {
    marginTop: SIZES.spacing.sm,
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: SIZES.spacing.xl,
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
});

export default DriverDeliveriesScreen;

