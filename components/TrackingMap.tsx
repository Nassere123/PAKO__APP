import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS } from '../constants';

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

const { width, height } = Dimensions.get('window');

const TrackingMap: React.FC<TrackingMapProps> = ({
  currentLocation,
  destination,
  driver,
  progress,
  onCallDriver,
}) => {
  const [region, setRegion] = useState({
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    // Centrer la carte sur la position actuelle
    setRegion({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, [currentLocation]);

  const handleCallDriver = () => {
    Alert.alert(
      "Appeler le livreur",
      `Voulez-vous appeler ${driver.name} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Appeler", 
          onPress: onCallDriver
        }
      ]
    );
  };

  // Coordonnées pour la route simulée
  const routeCoordinates = [
    {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    },
    {
      latitude: destination.latitude,
      longitude: destination.longitude,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.mapHeader}>
        <Text style={styles.mapTitle}>📍 Suivi en temps réel</Text>
        <TouchableOpacity style={styles.callButton} onPress={handleCallDriver}>
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
        >
          {/* Marqueur de la position actuelle du colis */}
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Position du colis"
            description={currentLocation.address}
          >
            <View style={styles.currentMarker}>
              <Text style={styles.markerIcon}>🚚</Text>
            </View>
          </Marker>

          {/* Marqueur de destination */}
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title="Destination"
            description={destination.address}
          >
            <View style={styles.destinationMarker}>
              <Text style={styles.markerIcon}>🏠</Text>
            </View>
          </Marker>

          {/* Ligne de route */}
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={COLORS.primary}
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        </MapView>
      </View>

      <View style={styles.mapInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
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
          <Text style={styles.progressLabel}>Progression : {progress}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  callButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 18,
  },
  mapContainer: {
    height: height * 0.4,
    backgroundColor: COLORS.lightGray,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  currentMarker: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  destinationMarker: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 20,
  },
  mapInfo: {
    backgroundColor: COLORS.white,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
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
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
});

export default TrackingMap;
