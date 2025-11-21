import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { useAuth } from '../../context/AuthContext';
import { parcelService } from '../../services/parcelService';
import { Parcel, ParcelStatus } from '../../types/parcel';
import { AgentParcelsStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<AgentParcelsStackParamList, 'AgentParcelsHome'>;

const AgentParcelsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const stationId = 'STATION-001'; // ID de la gare de l'agent (à récupérer depuis le contexte utilisateur)

  // Charger les colis
  const loadParcels = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const data = await parcelService.getParcelsByStation(stationId);
      setParcels(data);
    } catch (error) {
      console.error('Erreur lors du chargement des colis:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [stationId]);

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

  // Calculer les statistiques par statut
  const summary = useMemo(() => {
    const arrived = parcels.filter((parcel) => parcel.status === 'arrived').length;
    const verified = parcels.filter((parcel) => parcel.status === 'verified').length;
    const ready = parcels.filter((parcel) => parcel.status === 'ready_for_delivery').length;
    const assigned = parcels.filter((parcel) => parcel.status === 'assigned').length;
    return { arrived, verified, ready, assigned, total: parcels.length };
  }, [parcels]);

  // Définir les cases de résumé (sans "Colis arrivés" car vérification faite à la réception)
  const summaryCards = useMemo(
    () => [
      {
        id: 'verified',
        title: 'Colis vérifiés',
        count: summary.verified,
        description: 'Vérifiés et en attente',
        status: 'verified' as ParcelStatus,
        color: COLORS.info,
      },
      {
        id: 'ready',
        title: 'Prêts pour livraison',
        count: summary.ready,
        description: 'Prêts à être assignés',
        status: 'ready_for_delivery' as ParcelStatus,
        color: COLORS.success,
      },
      {
        id: 'assigned',
        title: 'Colis assignés',
        count: summary.assigned,
        description: 'Assignés à un livreur',
        status: 'assigned' as ParcelStatus,
        color: COLORS.primary,
      },
    ],
    [summary.verified, summary.ready, summary.assigned],
  );

  const displayedTotal = useMemo(
    () => summaryCards.reduce((total, card) => total + card.count, 0),
    [summaryCards],
  );

  const handleNavigateToList = useCallback(
    (card: (typeof summaryCards)[number]) => {
      navigation.navigate('AgentParcelList', {
        title: card.title,
        status: card.status,
      });
    },
    [navigation],
  );

  // Séparer les cartes : 2 premières en haut, dernière en bas
  const topCards = summaryCards.slice(0, 2);
  const bottomCard = summaryCards[2];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>{displayedTotal} colis au total</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
      >
        {/* Deux cartes en haut */}
        <View style={styles.topRow}>
          {topCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              activeOpacity={0.85}
              style={[styles.summaryCard, { borderColor: card.color }]}
              onPress={() => handleNavigateToList(card)}
            >
              <Text style={styles.summaryTitle}>{card.title.toUpperCase()}</Text>
              <Text style={[styles.summaryCount, { color: card.color }]}>
                {card.count}
              </Text>
              <Text style={styles.summaryDescription}>{card.description}</Text>
              <Text style={styles.summaryHint}>Appuyez pour afficher la liste</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Une carte en bas, centrée */}
        {bottomCard && (
          <View style={styles.bottomRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.summaryCard, styles.bottomCard, { borderColor: bottomCard.color }]}
              onPress={() => handleNavigateToList(bottomCard)}
            >
              <Text style={styles.summaryTitle}>{bottomCard.title.toUpperCase()}</Text>
              <Text style={[styles.summaryCount, { color: bottomCard.color }]}>
                {bottomCard.count}
              </Text>
              <Text style={styles.summaryDescription}>{bottomCard.description}</Text>
              <Text style={styles.summaryHint}>Appuyez pour afficher la liste</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Chargement des colis...</Text>
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
    fontSize: SIZES.font.lg,
    color: COLORS.primary,
    marginTop: SIZES.spacing.xs,
    fontWeight: '700',
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
});

export default AgentParcelsScreen;
