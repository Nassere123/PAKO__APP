import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// @ts-ignore - Module @expo/vector-icons installé mais types non disponibles
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { useAuth } from '../../context/AuthContext';
import { parcelService } from '../../services/parcelService';
import { agentStatsService, AgentStatistics } from '../../services/agentStatsService';
import LogoutModal from '../../components/LogoutModal';

const AgentProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState<AgentStatistics | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const stationId = 'STATION-001';
  const stationName = "Gare d'Adjamé";

  const loadData = useCallback(async () => {
    try {
      const parcels = await parcelService.getParcelsByStation(stationId);
      const stats = await agentStatsService.getStatistics(stationId, parcels);

      setStatistics(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [stationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={COLORS.primary} />
        }
      >
        {/* Header avec bandeau orange */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.profileName}>{user?.fullName ?? 'Agent PAKO PRO'}</Text>
            <Text style={styles.profileRole}>Agent de gare</Text>
          </View>
        </View>

        {/* Avatar qui chevauche */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-circle" size={80} color={COLORS.primary} />
          </View>
        </View>

        {/* Informations personnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account" size={24} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nom complet</Text>
                <Text style={styles.infoValue}>{user?.fullName ?? 'Agent PAKO PRO'}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={24} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Numéro de téléphone</Text>
                <Text style={styles.infoValue}>{user?.phone}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={24} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Gare d'attache</Text>
                <Text style={styles.infoValue}>{stationName}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="identifier" size={24} color={COLORS.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ID Agent</Text>
                <Text style={styles.infoValue}>{user?.id ?? 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderColor: COLORS.success }]}>
              <View style={styles.statNumberRow}>
                <Text style={[styles.statValue, { color: COLORS.success }]}>
                  {statistics?.totalVerified ?? 0}
                </Text>
                <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.statLabel}>Colis vérifiés</Text>
              {statistics?.thisMonthVerified !== undefined && (
                <Text style={styles.statSubLabel}>{statistics.thisMonthVerified} ce mois</Text>
              )}
            </View>

            <View style={[styles.statCard, { borderColor: COLORS.primary }]}>
              <View style={styles.statNumberRow}>
                <Text style={[styles.statValue, { color: COLORS.primary }]}>
                  {statistics?.totalAssigned ?? 0}
                </Text>
                <MaterialCommunityIcons name="account-plus" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.statLabel}>Colis assignés</Text>
              {statistics?.thisMonthAssigned !== undefined && (
                <Text style={styles.statSubLabel}>{statistics.thisMonthAssigned} ce mois</Text>
              )}
            </View>

            <View style={[styles.statCard, { borderColor: COLORS.info }]}>
              <View style={styles.statNumberRow}>
                <Text style={[styles.statValue, { color: COLORS.info }]}>
                  {statistics?.totalReady ?? 0}
                </Text>
                <MaterialCommunityIcons name="package-variant" size={24} color={COLORS.info} />
              </View>
              <Text style={styles.statLabel}>Prêts pour livraison</Text>
            </View>

            <View style={[styles.statCard, { borderColor: COLORS.warning }]}>
              <View style={styles.statNumberRow}>
                <Text style={[styles.statValue, { color: COLORS.warning }]}>
                  {statistics?.totalArrived ?? 0}
                </Text>
                <MaterialCommunityIcons name="package-variant-closed" size={24} color={COLORS.warning} />
              </View>
              <Text style={styles.statLabel}>Colis arrivés</Text>
            </View>
          </View>
        </View>

        {/* Bouton de déconnexion */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
          >
            <MaterialCommunityIcons name="logout" size={20} color={COLORS.textInverse} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de confirmation de déconnexion */}
      <LogoutModal
        visible={showLogoutModal}
        onConfirm={signOut}
        onCancel={() => setShowLogoutModal(false)}
        userName={user?.fullName}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
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
  header: {
    backgroundColor: '#E85A2B', // Orange plus foncé
    paddingTop: SIZES.spacing.xl + 20,
    paddingBottom: SIZES.spacing.xl + 30, // Plus d'espace pour l'avatar qui chevauche
    paddingHorizontal: SIZES.spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -50, // Chevauchement avec le header
    marginBottom: SIZES.spacing.md,
    zIndex: 10,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    // Ombres douces
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF', // Blanc pur pour contraste maximal
    marginBottom: SIZES.spacing.xs,
    textAlign: 'center',
  },
  profileRole: {
    fontSize: SIZES.font.sm,
    color: '#FFFFFF', // Blanc pur pour contraste maximal
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: SIZES.spacing.lg,
    marginTop: SIZES.spacing.lg,
  },
  sectionTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '700',
    color: '#1A1F36', // Gris anthracite
    marginBottom: SIZES.spacing.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20, // Coins plus arrondis
    padding: SIZES.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    // Ombres douces
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SIZES.spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: SIZES.spacing.xs,
  },
  infoContent: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF', // Gris clair
    marginBottom: SIZES.spacing.xs,
    fontWeight: '400',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1F36', // Noir/Anthracite
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 20, // Coins plus arrondis
    padding: SIZES.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    minHeight: 180,
    // Ombres douces
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  statNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.xs,
  },
  statValue: {
    fontSize: 56, // Chiffres TRÈS grands au centre
    fontWeight: '800',
    letterSpacing: -2,
  },
  statLabel: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: '#1A1F36', // Gris anthracite
    textAlign: 'center',
    marginTop: SIZES.spacing.sm,
  },
  statSubLabel: {
    fontSize: 10, // Plus petit et discret en bas
    color: '#9CA3AF', // Gris clair
    marginTop: SIZES.spacing.xs,
    fontWeight: '400',
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.md,
    borderRadius: 20, // Coins plus arrondis
    gap: SIZES.spacing.sm,
    // Ombres douces
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
});

export default AgentProfileScreen;
