import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// @ts-ignore - Module @expo/vector-icons installé mais types non disponibles
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "../../components/Button";
import { COLORS } from "../../constants/colors";
import { SIZES } from "../../constants/sizes";
import { useAuth } from "../../context/AuthContext";
import { deliveryService } from "../../services/deliveryService";
import { DeliveryMission } from "../../types/delivery";

const DriverProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [missions, setMissions] = useState<DeliveryMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState(true);

  const loadMissions = useCallback(async () => {
    if (!user?.id) {
      setMissions([]);
      setLoading(false);
      return;
    }
    try {
      const data = await deliveryService.listAssignedDeliveries(user.id);
      setMissions(data);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const stats = useMemo(() => {
    const total = missions.length;
    const delivered = missions.filter((mission) => mission.status === "delivered").length;
    const inProgress = missions.filter((mission) => mission.status === "in_progress").length;
    const pending = missions.filter((mission) => mission.status === "pending").length;
    const issues = missions.filter((mission) => mission.status === "issue").length;
    return { total, delivered, inProgress, pending, issues };
  }, [missions]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account-circle" size={64} color={COLORS.primary} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{user?.fullName ?? "Livreur PAKO PRO"}</Text>
            <Text style={styles.phone}>{user?.phone ?? "Numéro non renseigné"}</Text>
            <View style={styles.availabilityRow}>
              <MaterialCommunityIcons
                name={availability ? "check-circle" : "pause-circle"}
                size={18}
                color={availability ? COLORS.success : COLORS.warning}
              />
              <Text style={styles.availabilityText}>
                {availability ? "Disponible" : "Pause"}
              </Text>
              <Switch
                value={availability}
                onValueChange={setAvailability}
                thumbColor={availability ? COLORS.primary : COLORS.border}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.loadingText}>Mise à jour des performances...</Text>
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.statPrimary]}>
                <Text style={styles.statLabel}>Missions totales</Text>
                <Text style={styles.statValue}>{stats.total}</Text>
              </View>
              <View style={[styles.statCard, styles.statSuccess]}>
                <Text style={styles.statLabel}>Livrées</Text>
                <Text style={styles.statValue}>{stats.delivered}</Text>
              </View>
              <View style={[styles.statCard, styles.statInfo]}>
                <Text style={styles.statLabel}>En cours</Text>
                <Text style={styles.statValue}>{stats.inProgress}</Text>
              </View>
              <View style={[styles.statCard, styles.statWarning]}>
                <Text style={styles.statLabel}>En attente</Text>
                <Text style={styles.statValue}>{stats.pending}</Text>
              </View>
              <View style={[styles.statCard, styles.statDanger]}>
                <Text style={styles.statLabel}>Incidents</Text>
                <Text style={styles.statValue}>{stats.issues}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          <TouchableOpacity style={styles.settingRow}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <MaterialCommunityIcons name="translate" size={22} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Langue</Text>
            <Text style={styles.settingValue}>Français</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <MaterialCommunityIcons name="theme-light-dark" size={22} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Apparence</Text>
            <Text style={styles.settingValue}>Système</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.settingRow}>
            <MaterialCommunityIcons name="headset" size={22} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>Contacter l'assistance</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <MaterialCommunityIcons name="book-open-page-variant" size={22} color={COLORS.textSecondary} />
            <Text style={styles.settingLabel}>FAQ & procédures</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Se déconnecter" onPress={signOut} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.xl,
    gap: SIZES.spacing.lg,
  },
  headerCard: {
    flexDirection: "row",
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.lg,
    alignItems: "center",
    gap: SIZES.spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.font.lg,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  phone: {
    marginTop: 4,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  availabilityRow: {
    marginTop: SIZES.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.spacing.sm,
  },
  availabilityText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  section: {
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: SIZES.font.md,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.spacing.sm,
  },
  loadingText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.spacing.sm,
  },
  statCard: {
    flexBasis: "48%",
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
  },
  statLabel: {
    fontSize: SIZES.font.xs,
    color: COLORS.textInverse,
    textTransform: "uppercase",
  },
  statValue: {
    marginTop: SIZES.spacing.xs,
    fontSize: SIZES.font.xl,
    fontWeight: "700",
    color: COLORS.textInverse,
  },
  statPrimary: {
    backgroundColor: COLORS.primary,
  },
  statSuccess: {
    backgroundColor: COLORS.success,
  },
  statInfo: {
    backgroundColor: COLORS.info,
  },
  statWarning: {
    backgroundColor: COLORS.warning,
  },
  statDanger: {
    backgroundColor: COLORS.danger,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.spacing.sm,
    gap: SIZES.spacing.sm,
  },
  settingLabel: {
    flex: 1,
    fontSize: SIZES.font.sm,
    color: COLORS.textPrimary,
  },
  settingValue: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
  },
  footer: {
    padding: SIZES.spacing.lg,
  },
});

export default DriverProfileScreen;
