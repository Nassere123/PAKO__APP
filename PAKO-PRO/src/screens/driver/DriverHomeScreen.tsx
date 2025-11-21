import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { MapView, Marker, UrlTile, Region } from '../../components/MapComponents';
// @ts-ignore - Module @expo/vector-icons installé mais types non disponibles
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { deliveryService } from '../../services/deliveryService';
import { DeliveryMission } from '../../types/delivery';
import { useAuth } from '../../context/AuthContext';

// Coordonnées mock pour Abidjan (à remplacer par de vraies coordonnées depuis l'API)
const ABIDJAN_CENTER: Region = {
  latitude: 5.3600,
  longitude: -4.0083,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Fonction pour obtenir des coordonnées mock basées sur le nom du lieu
const getMockCoordinates = (label: string) => {
  const mockCoords: Record<string, { latitude: number; longitude: number }> = {
    "Gare d'Adjamé": { latitude: 5.3569, longitude: -4.0264 },
    "Gare de Yopougon": { latitude: 5.3192, longitude: -4.0775 },
    "Gare d'Abobo": { latitude: 5.4167, longitude: -4.0167 },
    "Gare de Treichville": { latitude: 5.2933, longitude: -4.0133 },
    "Immeuble Les Palmiers": { latitude: 5.3400, longitude: -4.0200 },
    "Résidence Harmattan": { latitude: 5.3600, longitude: -4.0100 },
    "Clinique Danga": { latitude: 5.3500, longitude: -4.0300 },
    "Immeuble Alpha, Plateau": { latitude: 5.3200, longitude: -4.0250 },
  };
  return mockCoords[label] || { latitude: ABIDJAN_CENTER.latitude, longitude: ABIDJAN_CENTER.longitude };
};

// Calcul de distance entre deux points (formule de Haversine)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const DriverHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const [missions, setMissions] = useState<DeliveryMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedMission, setSelectedMission] = useState<DeliveryMission | null>(null);
  const [region, setRegion] = useState<Region>(ABIDJAN_CENTER);
  const mapRef = useRef<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [previousPendingCount, setPreviousPendingCount] = useState(0);
  
  // Compter les missions en attente
  const pendingCount = useMemo(() => {
    return missions.filter((m) => m.status === 'pending').length;
  }, [missions]);

  // Charger les missions
  const loadMissions = useCallback(async () => {
    if (!user?.id) {
      setMissions([]);
      setLoading(false);
      return;
    }

    try {
      const data = await deliveryService.listAssignedDeliveries(user.id);
      setMissions(data);
      
      // Compter les nouvelles commandes en attente
      const pendingMissions = data.filter((m) => m.status === 'pending');
      const currentPendingCount = pendingMissions.length;
      
      // Si le nombre de commandes en attente a augmenté, afficher une notification
      if (currentPendingCount > previousPendingCount && previousPendingCount > 0) {
        const newCount = currentPendingCount - previousPendingCount;
        Alert.alert(
          'Nouvelle(s) commande(s)',
          `Vous avez reçu ${newCount} nouvelle(s) commande(s) à livrer.`,
          [{ text: 'OK' }]
        );
      }
      
      setPreviousPendingCount(currentPendingCount);
      
      const activeMission = data.find(
        (m) => m.status === 'in_progress' || m.status === 'pending'
      );
      if (activeMission) {
        setSelectedMission(activeMission);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, previousPendingCount]);

  // Demander la permission de localisation
  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission de localisation refusée');
        return;
      }

      // Vérifier si les services de localisation sont activés
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setLocationError('Les services de localisation sont désactivés');
        return;
      }

      // Obtenir la position actuelle avec timeout
      const currentLocation = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de localisation')), 10000)
        ),
      ]);

      setLocation(currentLocation);
      setLocationError(null);

      // Centrer la carte sur la position du livreur seulement au premier chargement
      const newRegion: Region = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      // Ne mettre à jour la région que si elle n'a pas encore été définie
      if (!region || (region.latitude === ABIDJAN_CENTER.latitude && region.longitude === ABIDJAN_CENTER.longitude)) {
        setRegion(newRegion);
      }
      // Animer la carte seulement sur mobile et seulement au premier chargement
      if (Platform.OS !== 'web' && mapRef.current?.animateToRegion) {
        if (!region || (region.latitude === ABIDJAN_CENTER.latitude && region.longitude === ABIDJAN_CENTER.longitude)) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      }
    } catch (error) {
      // Gérer les erreurs silencieusement et afficher un message à l'utilisateur
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      if (errorMessage.includes('unavailable') || errorMessage.includes('timeout')) {
        setLocationError('Localisation indisponible. Activez les services de localisation.');
      } else if (errorMessage.includes('permission')) {
        setLocationError('Permission de localisation refusée');
      } else {
        setLocationError('Impossible de récupérer votre position');
      }
      
      // Ne pas logger l'erreur en console pour éviter les erreurs visibles
      // L'erreur est déjà gérée via setLocationError
    }
  }, []);

  // Recharger les missions quand l'écran est focus
  useFocusEffect(
    useCallback(() => {
      loadMissions();
    }, [loadMissions])
  );

  useEffect(() => {
    requestLocationPermission();

    // Mettre à jour la position toutes les 30 secondes
    const locationInterval = setInterval(() => {
      if (location) {
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        })
          .then((newLocation) => {
            setLocation(newLocation);
            // Ne pas recentrer automatiquement la carte lors des mises à jour périodiques
            // L'utilisateur peut zoomer/déplacer librement
            // Seul le marqueur de position sera mis à jour
          })
          .catch(() => {
            // Erreur silencieuse - la localisation sera réessayée au prochain intervalle
            // Ne pas afficher d'erreur console pour éviter les erreurs visibles
          });
      }
    }, 30000);

    return () => clearInterval(locationInterval);
  }, [requestLocationPermission, location, region]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const activeMissions = missions.filter(
      (m) => m.status === 'in_progress' || m.status === 'pending'
    );
    const delivered = missions.filter((m) => m.status === 'delivered').length;
    return {
      active: activeMissions.length,
      delivered,
      total: missions.length,
    };
  }, [missions]);

  // Calculer la distance pour la mission sélectionnée
  const missionDistance = useMemo(() => {
    if (!selectedMission || !location) return null;

    const pickupCoords = getMockCoordinates(selectedMission.pickupStation.label);
    const dropoffCoords = getMockCoordinates(selectedMission.dropoffLocation.label);
    const driverCoords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    // Distance du livreur au point de collecte
    const distToPickup = calculateDistance(
      driverCoords.latitude,
      driverCoords.longitude,
      pickupCoords.latitude,
      pickupCoords.longitude
    );

    // Distance du point de collecte à la livraison
    const distPickupToDropoff = calculateDistance(
      pickupCoords.latitude,
      pickupCoords.longitude,
      dropoffCoords.latitude,
      dropoffCoords.longitude
    );

    return {
      toPickup: distToPickup,
      pickupToDropoff: distPickupToDropoff,
      total: distToPickup + distPickupToDropoff,
    };
  }, [selectedMission, location]);

  // Ouvrir dans la navigation
  const openInMaps = useCallback((address: string, coords?: { latitude: number; longitude: number }) => {
    if (coords) {
      const url = `https://www.openstreetmap.org/directions?to=${coords.latitude},${coords.longitude}`;
      Linking.openURL(url).catch((err) => {
        Alert.alert('Erreur', 'Impossible d\'ouvrir la navigation');
        console.error(err);
      });
    }
  }, []);

  // Appeler le client
  const callCustomer = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`).catch((err) => {
      Alert.alert('Erreur', 'Impossible de passer l\'appel');
      console.error(err);
    });
  }, []);

  // Centrer sur la position de l'utilisateur
  const centerOnUserLocation = useCallback(() => {
    if (location && mapRef.current && Platform.OS !== 'web') {
      const newRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      if (mapRef.current.animateToRegion) {
      mapRef.current.animateToRegion(newRegion, 1000);
      }
    }
  }, [location]);



  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Carte interactive - Plein écran */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          showsUserLocation={false}
          showsMyLocationButton={false}
          followsUserLocation={false}
        >
          {/* Tuiles CartoDB comme dans pako-client */}
          <UrlTile
            urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
            zIndex={-1}
          />

          {/* Marqueur position du livreur */}
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Votre position"
            >
              <View style={styles.locationMarker}>
                <MaterialCommunityIcons name="map-marker" size={32} color={COLORS.info} />
              </View>
            </Marker>
          )}

        </MapView>

        {/* Bouton centrer sur position */}
        <TouchableOpacity style={styles.myLocationButton} onPress={centerOnUserLocation}>
          <MaterialCommunityIcons name="crosshairs-gps" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {/* Attribution */}
        <View style={styles.attribution}>
          <Text style={styles.attributionText}>© OpenStreetMap contributors | Tiles by MapTiler/Carto</Text>
        </View>

        {locationError && (
          <View style={styles.locationError}>
            <Text style={styles.locationErrorText}>{locationError}</Text>
            <TouchableOpacity onPress={requestLocationPermission} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Header PAKO PRO */}
        <View style={styles.headerOverlay}>
          <Text style={styles.headerTitle}>PAKO PRO</Text>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => setShowNotifications(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color={COLORS.textPrimary}
            />
            {pendingCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {pendingCount > 99 ? '99+' : pendingCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Chargement des livraisons...</Text>
          </View>
        )}
      </View>

      {/* Modal des notifications */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity
                onPress={() => setShowNotifications(false)}
                style={styles.modalCloseButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.textPrimary}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {pendingCount > 0 ? (
                <View style={styles.notificationItem}>
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={32}
                    color={COLORS.primary}
                    style={styles.notificationIcon}
                  />
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>
                      Nouvelle(s) commande(s)
                    </Text>
                    <Text style={styles.notificationMessage}>
                      Vous avez reçu {pendingCount} commande{pendingCount > 1 ? 's' : ''} à aller livrer
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyNotifications}>
                  <MaterialCommunityIcons
                    name="bell-off-outline"
                    size={48}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.emptyNotificationsText}>
                    Aucune notification
                  </Text>
                </View>
              )}
            </ScrollView>
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
  },
  mapContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  locationMarker: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 56,
    right: 12,
    backgroundColor: COLORS.background,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  attribution: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 10,
  },
  attributionText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: SIZES.font.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  notificationButton: {
    position: 'relative',
    padding: SIZES.spacing.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  notificationBadgeText: {
    color: COLORS.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: SIZES.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.font.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    padding: SIZES.spacing.xs,
  },
  modalBody: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.md,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationIcon: {
    marginRight: SIZES.spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.xs,
  },
  notificationMessage: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.xl * 2,
  },
  emptyNotificationsText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.md,
  },
  locationError: {
    position: 'absolute',
    top: 100,
    left: 10,
    right: 10,
    backgroundColor: COLORS.danger,
    padding: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  locationErrorText: {
    color: COLORS.textInverse,
    fontSize: SIZES.font.xs,
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: SIZES.spacing.sm,
  },
  retryButtonText: {
    color: COLORS.textInverse,
    fontSize: SIZES.font.xs,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: SIZES.spacing.sm,
    color: COLORS.textSecondary,
    fontSize: SIZES.font.sm,
  },
});

export default DriverHomeScreen;
