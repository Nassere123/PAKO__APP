import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import * as Location from 'expo-location';
// @ts-ignore - react-native-maps peut ne pas avoir de types pour web
import MapView, { Marker, Region } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { deliveryService } from '../../services/deliveryService';
import { DeliveryMission } from '../../types/delivery';
import { DriverDeliveriesStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';


type NavigationProp = NativeStackNavigationProp<
  DriverDeliveriesStackParamList,
  'DriverNavigation'
>;
type RouteProps = RouteProp<DriverDeliveriesStackParamList, 'DriverNavigation'>;

const DriverNavigationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<RouteProps>();
  const { missionId } = params;
  const { user } = useAuth();

  const [mission, setMission] = useState<DeliveryMission | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  // Charger la mission
  const loadMission = useCallback(async () => {
    if (!user?.id || !missionId) {
      setLoading(false);
      return;
    }

    try {
      const missionData = await deliveryService.getDeliveryById(user.id, missionId);
      if (missionData) {
        setMission(missionData);
      } else {
        Alert.alert('Erreur', 'Mission introuvable');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la mission:', error);
      Alert.alert('Erreur', 'Impossible de charger la mission');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [user?.id, missionId, navigation]);

  // Demander la permission de localisation
  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission de localisation refusée');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
      setLocationError(null);
    } catch (error) {
      console.error('Erreur lors de la récupération de la localisation:', error);
      setLocationError('Impossible de récupérer la localisation');
    }
  }, []);

  // Suivre la position en temps réel
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission de localisation refusée');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Mise à jour toutes les 5 secondes
          distanceInterval: 10, // Ou tous les 10 mètres
        },
        (newLocation) => {
          setLocation(newLocation);
        }
      );
    };

    startTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Calculer la région de la carte pour afficher l'itinéraire
  const getMapRegion = useCallback((): Region | null => {
    if (!location || !mission?.dropoffLocation.latitude || !mission?.dropoffLocation.longitude) {
      return null;
    }

    const startLat = Number(location.coords.latitude);
    const startLon = Number(location.coords.longitude);
    const endLat = Number(mission.dropoffLocation.latitude);
    const endLon = Number(mission.dropoffLocation.longitude);

    const minLat = Math.min(startLat, endLat);
    const maxLat = Math.max(startLat, endLat);
    const minLon = Math.min(startLon, endLon);
    const maxLon = Math.max(startLon, endLon);

    const latDelta = (maxLat - minLat) * 1.5 + 0.01;
    const lonDelta = (maxLon - minLon) * 1.5 + 0.01;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lonDelta,
    };
  }, [location, mission]);

  // Ajuster la carte pour afficher l'itinéraire
  useEffect(() => {
    if (mapRef.current && location && mission?.dropoffLocation.latitude && mission?.dropoffLocation.longitude) {
      const region = getMapRegion();
      if (region) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: Number(location.coords.latitude), longitude: Number(location.coords.longitude) },
            { latitude: Number(mission.dropoffLocation.latitude), longitude: Number(mission.dropoffLocation.longitude) },
          ],
          {
            edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
            animated: true,
          }
        );
      }
    }
  }, [location, mission, getMapRegion]);

  useEffect(() => {
    loadMission();
    requestLocationPermission();
  }, [loadMission, requestLocationPermission]);

  // Ouvrir la navigation externe (Google Maps, Apple Maps)
  const openExternalNavigation = useCallback(() => {
    if (!mission?.dropoffLocation.latitude || !mission?.dropoffLocation.longitude) {
      Alert.alert('Erreur', 'Coordonnées de destination non disponibles');
      return;
    }

    const latitude = Number(mission.dropoffLocation.latitude);
    const longitude = Number(mission.dropoffLocation.longitude);
    const address = encodeURIComponent(mission.dropoffLocation.label);

    if (Platform.OS === 'ios') {
      Linking.openURL(`http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`);
    } else {
      Linking.openURL(`google.navigation:q=${latitude},${longitude}`);
    }
  }, [mission]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement de la navigation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!mission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={COLORS.danger} />
          <Text style={styles.errorText}>Mission introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasCoordinates =
    location &&
    mission.dropoffLocation.latitude &&
    mission.dropoffLocation.longitude;

  // Protection pour le web
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTexts}>
            <Text style={styles.title}>Navigation</Text>
            <Text style={styles.subtitle}>Colis {mission.code}</Text>
          </View>
        </View>
        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons name="map" size={64} color={COLORS.textSecondary} />
          <Text style={styles.mapPlaceholderText}>
            La navigation n'est disponible que sur mobile
          </Text>
          <TouchableOpacity
            style={styles.navigationButton}
            onPress={openExternalNavigation}
            disabled={!hasCoordinates}
          >
            <MaterialCommunityIcons name="navigation" size={24} color={COLORS.textInverse} />
            <Text style={styles.navigationButtonText}>
              Ouvrir la navigation externe
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTexts}>
          <Text style={styles.title}>Navigation</Text>
          <Text style={styles.subtitle}>Colis {mission.code}</Text>
        </View>
      </View>

      {locationError && (
        <View style={styles.errorBanner}>
          <MaterialCommunityIcons name="alert" size={20} color={COLORS.danger} />
          <Text style={styles.errorBannerText}>{locationError}</Text>
        </View>
      )}

      <View style={styles.mapContainer}>
        {hasCoordinates ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={getMapRegion() || undefined}
            showsUserLocation
            showsMyLocationButton
            followsUserLocation
          >
            {/* Marqueur de destination */}
            <Marker
              coordinate={{
                latitude: Number(mission.dropoffLocation.latitude),
                longitude: Number(mission.dropoffLocation.longitude),
              }}
              title={mission.dropoffLocation.label}
              description={mission.customerName}
            >
              <View style={styles.destinationMarker}>
                <MaterialCommunityIcons name="map-marker" size={32} color={COLORS.danger} />
              </View>
            </Marker>
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <MaterialCommunityIcons name="map" size={64} color={COLORS.textSecondary} />
            <Text style={styles.mapPlaceholderText}>
              {!location
                ? 'En attente de la localisation...'
                : 'Coordonnées de destination non disponibles'}
            </Text>
          </View>
        )}
      </View>

      {/* Panneau d'informations */}
      <View style={styles.infoPanel}>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Destination</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {mission.dropoffLocation.label}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.navigationButton}
          onPress={openExternalNavigation}
          disabled={!hasCoordinates}
        >
          <MaterialCommunityIcons name="navigation" size={24} color={COLORS.textInverse} />
          <Text style={styles.navigationButtonText}>
            Ouvrir la navigation externe
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.sm,
    gap: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.font.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.danger + '20',
    padding: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    gap: SIZES.spacing.xs,
  },
  errorBannerText: {
    fontSize: SIZES.font.sm,
    color: COLORS.danger,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  mapPlaceholderText: {
    marginTop: SIZES.spacing.md,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  destinationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoPanel: {
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SIZES.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: SIZES.font.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.md,
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.sm,
  },
  navigationButtonText: {
    fontSize: SIZES.font.md,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.md,
  },
  loadingText: {
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.md,
  },
  errorText: {
    fontSize: SIZES.font.md,
    color: COLORS.danger,
    fontWeight: '600',
  },
});

export default DriverNavigationScreen;

