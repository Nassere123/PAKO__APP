import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { GOOGLE_MAPS_API_KEY } from '../constants/api';

interface TrackingMapProps {
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
  driver: {
    name: string;
    phone: string;
    vehicle: string;
  };
  progress: number;
  onCallDriver: () => void;
}

const TrackingMap: React.FC<TrackingMapProps> = ({
  currentLocation,
  destination,
  driver,
  progress,
  onCallDriver,
}) => {
  const mapRef = useRef<MapView>(null);

  // Calculer la région pour afficher les deux points
  useEffect(() => {
    if (mapRef.current) {
      const coordinates = [
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        {
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
      ];

      // Calculer les limites de la région
      const minLat = Math.min(...coordinates.map(c => c.latitude));
      const maxLat = Math.max(...coordinates.map(c => c.latitude));
      const minLng = Math.min(...coordinates.map(c => c.longitude));
      const maxLng = Math.max(...coordinates.map(c => c.longitude));

      const padding = 0.01; // Padding pour ne pas coller aux bords
      const region: Region = {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max(maxLat - minLat + padding * 2, 0.01),
        longitudeDelta: Math.max(maxLng - minLng + padding * 2, 0.01),
      };

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        },
        animated: true,
      });
    }
  }, [currentLocation, destination]);

  return (
    <View style={styles.container}>
      {/* Carte avec itinéraire */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          // Configuration pour Expo
          // Expo Go: utilise la carte par défaut (OpenStreetMap/Apple Maps)
          // Build personnalisé: Google Maps sur Android, carte par défaut sur iOS
          provider={Platform.OS === 'android' ? 'google' : undefined}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={true}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={false}
          mapType="standard"
          loadingEnabled={true}
          liteMode={false}
          onPress={(e) => {
            // Empêcher l'ouverture de l'application externe
            e.stopPropagation();
          }}
        >
          {/* Itinéraire entre la position actuelle et la destination */}
          <MapViewDirections
            origin={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            destination={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor={COLORS.primary}
            optimizeWaypoints={true}
            onReady={(result) => {
              // Ajuster la carte pour voir tout l'itinéraire
              if (mapRef.current) {
                mapRef.current.fitToCoordinates(result.coordinates, {
                  edgePadding: {
                    top: 50,
                    right: 50,
                    bottom: 50,
                    left: 50,
                  },
                  animated: true,
                });
              }
            }}
            onError={(errorMessage) => {
              console.log('Erreur lors du calcul de l\'itinéraire:', errorMessage);
            }}
          />

          {/* Marqueur position actuelle */}
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Position actuelle"
            description={currentLocation.address}
          >
            <View style={styles.currentMarker}>
              <View style={styles.currentMarkerInner} />
            </View>
          </Marker>

          {/* Marqueur destination */}
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title="Destination"
            description={destination.address}
          >
            <View style={styles.destinationMarker}>
              <Ionicons name="location" size={24} color={COLORS.white} />
            </View>
          </Marker>
        </MapView>
      </View>

      {/* Informations sous la carte */}
      <View style={styles.mapInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color={COLORS.primary} style={styles.infoIcon} />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Position actuelle</Text>
            <Text style={styles.infoValue}>{currentLocation.address}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🎯</Text>
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Destination</Text>
            <Text style={styles.infoValue}>{destination.address}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>👨‍💼</Text>
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Livreur</Text>
            <Text style={styles.infoValue}>{driver.name} - {driver.vehicle}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}% complété</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 350,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  currentMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '33',
    borderWidth: 3,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  mapInfo: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
    width: 24,
    fontSize: 20,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default TrackingMap;
