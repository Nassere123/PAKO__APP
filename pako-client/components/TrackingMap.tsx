import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

const TrackingMap: React.FC<TrackingMapProps> = ({
  currentLocation,
  destination,
  driver,
  progress,
  onCallDriver,
}) => {

  return (
    <View style={styles.container}>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

export default TrackingMap;
