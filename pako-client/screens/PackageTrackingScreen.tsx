import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';

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
  const [showCallModal, setShowCallModal] = useState(false);
  const slideAnim = useState(new Animated.Value(Dimensions.get('window').height))[0];
  const spinValue = useRef(new Animated.Value(0)).current;

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

  const showCallModalPopup = () => {
    setShowCallModal(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideCallModal = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowCallModal(false);
    });
  };

  const handleCallDriver = () => {
    showCallModalPopup();
  };

  const confirmCall = () => {
    hideCallModal();
    Alert.alert("Appel", `Appel vers ${trackingData?.driver.phone}`);
  };

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
          <Text style={styles.headerTitle}>Suivi du colis</Text>
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
        <Text style={styles.headerTitle}>Suivi du colis {packageId}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statut du colis */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Statut actuel</Text>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.statusText}>{trackingData.status}</Text>
          </View>
        </View>

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

      {/* Modal pour l'appel du livreur */}
      <Modal
        visible={showCallModal}
        transparent={true}
        animationType="none"
        onRequestClose={hideCallModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={hideCallModal}
          />
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📞 Appeler le livreur</Text>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalMessage}>
                Voulez-vous appeler {trackingData?.driver.name} ?
              </Text>
              <Text style={styles.modalPhone}>
                📱 {trackingData?.driver.phone}
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={hideCallModal}
              >
                <Text style={styles.modalCancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalCallButton}
                onPress={confirmCall}
              >
                <Text style={styles.modalCallButtonText}>📞 Appeler</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 8,
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
  // Styles pour le modal d'appel
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '50%',
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  modalContent: {
    marginBottom: 30,
    alignItems: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  modalPhone: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalCallButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCallButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default PackageTrackingScreen;