import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import { TrackingMap } from '../components';

type PackageTrackingScreenProps = StackScreenProps<RootStackParamList, 'PackageTracking'>;

interface TrackingData {
  packageId: string;
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
  status: string;
  estimatedArrival: string;
  progress: number; // 0-100
  lastUpdate: string;
}

const PackageTrackingScreen: React.FC<PackageTrackingScreenProps> = ({ navigation, route }) => {
  const { packageId } = route.params;
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isTracking, setIsTracking] = useState(true);

  // Simulation de données de suivi
  const mockTrackingData: TrackingData = {
    packageId: packageId,
    currentLocation: {
      latitude: 5.3599,
      longitude: -4.0083,
      address: "Plateau, Abidjan - En route vers Cocody"
    },
    destination: {
      latitude: 5.3600,
      longitude: -4.0080,
      address: "Cocody, Abidjan - Adresse de livraison"
    },
    driver: {
      name: "Kouassi Jean",
      phone: "+225 07 12 34 56 78",
      vehicle: "Moto - AB-123-CD"
    },
    status: "En cours de livraison",
    estimatedArrival: "14:30",
    progress: 75,
    lastUpdate: "14:15"
  };

  useEffect(() => {
    // Simulation du chargement des données
    setTimeout(() => {
      setTrackingData(mockTrackingData);
    }, 1000);

    // Simulation de mise à jour en temps réel
    const interval = setInterval(() => {
      if (isTracking && trackingData) {
        // Simulation de progression
        setTrackingData(prev => {
          if (!prev) return prev;
          const newProgress = Math.min(prev.progress + Math.random() * 5, 100);
          const newTime = new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          return {
            ...prev,
            progress: newProgress,
            lastUpdate: newTime,
            status: newProgress >= 100 ? "Arrivé à destination" : "En cours de livraison"
          };
        });
      }
    }, 10000); // Mise à jour toutes les 10 secondes

    return () => clearInterval(interval);
  }, [isTracking, trackingData]);

  const handleCallDriver = () => {
    Alert.alert(
      "Appeler le livreur",
      `Voulez-vous appeler ${trackingData?.driver.name} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Appeler", 
          onPress: () => {
            // Ici vous pourriez intégrer un système d'appel
            Alert.alert("Appel", `Appel vers ${trackingData?.driver.phone}`);
          }
        }
      ]
    );
  };


  const renderTrackingMap = () => {
    if (!trackingData) return null;
    
    return (
      <TrackingMap
        currentLocation={trackingData.currentLocation}
        destination={trackingData.destination}
        driver={trackingData.driver}
        progress={trackingData.progress}
        onCallDriver={handleCallDriver}
      />
    );
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Progression de la livraison</Text>
        <Text style={styles.progressPercentage}>{trackingData?.progress}%</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${trackingData?.progress || 0}%` }]} />
      </View>
      <Text style={styles.progressText}>
        Arrivée estimée : {trackingData?.estimatedArrival}
      </Text>
    </View>
  );

  const renderDriverInfo = () => (
    <View style={styles.driverContainer}>
      <Text style={styles.driverTitle}>👨‍💼 Informations du livreur</Text>
      <View style={styles.driverCard}>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{trackingData?.driver.name}</Text>
          <Text style={styles.driverVehicle}>{trackingData?.driver.vehicle}</Text>
          <Text style={styles.driverPhone}>📞 {trackingData?.driver.phone}</Text>
        </View>
        <TouchableOpacity style={styles.callButton} onPress={handleCallDriver}>
          <Text style={styles.callButtonText}>📞</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTrackingActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.actionButton} onPress={handleCallDriver}>
        <Text style={styles.actionButtonIcon}>📞</Text>
        <Text style={styles.actionButtonText}>Appeler le livreur</Text>
      </TouchableOpacity>
    </View>
  );

  if (!trackingData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Suivi du colis</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🔄 Chargement du suivi...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suivi du colis {packageId}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statut du colis */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>📦 Statut actuel</Text>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.statusText}>{trackingData.status}</Text>
          </View>
          <Text style={styles.lastUpdate}>Dernière mise à jour : {trackingData.lastUpdate}</Text>
        </View>

        {/* Carte de suivi intégrée */}
        {renderTrackingMap()}

        {/* Barre de progression */}
        {renderProgressBar()}

        {/* Informations de livraison */}
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryTitle}>📋 Détails de livraison</Text>
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryItem}>
              <Text style={styles.deliveryLabel}>Destination :</Text>
              <Text style={styles.deliveryValue}>{trackingData.destination.address}</Text>
            </View>
            <View style={styles.deliveryItem}>
              <Text style={styles.deliveryLabel}>Arrivée estimée :</Text>
              <Text style={styles.deliveryValue}>{trackingData.estimatedArrival}</Text>
            </View>
            <View style={styles.deliveryItem}>
              <Text style={styles.deliveryLabel}>Progression :</Text>
              <Text style={styles.deliveryValue}>{trackingData.progress}%</Text>
            </View>
          </View>
        </View>

        {/* Informations du livreur */}
        {renderDriverInfo()}

        {/* Actions */}
        {renderTrackingActions()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: '#2C3E50',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastUpdate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  mapContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 20,
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
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  progressContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  driverContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
  driverTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  driverVehicle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  driverPhone: {
    fontSize: 14,
    color: COLORS.primary,
  },
  callButton: {
    backgroundColor: COLORS.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 20,
    color: COLORS.white,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  deliveryInfo: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
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
  deliveryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  deliveryCard: {
    gap: 8,
  },
  deliveryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  deliveryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
});

export default PackageTrackingScreen;