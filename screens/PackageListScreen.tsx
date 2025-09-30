import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Animated, Dimensions } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';

type PackageListScreenProps = StackScreenProps<RootStackParamList, 'PackageList'>;

interface Package {
  id: string;
  code: string;
  description: string;
  type: string;
  status: string;
  date: string;
  estimatedValue?: string;
  trackingNumber?: string;
}

const PackageListScreen: React.FC<PackageListScreenProps> = ({ navigation, route }) => {
  const { category } = route.params as { category: 'received' | 'in_transit' | 'cancelled' };
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const slideAnim = useState(new Animated.Value(Dimensions.get('window').height))[0];

  // Données de test pour les colis
  const packagesData: Record<string, Package[]> = {
    received: [
      {
        id: '1',
        code: 'ABC123',
        description: 'Vêtements et accessoires',
        type: 'Colis vestimentaire',
        status: 'Livré',
        date: '15/12/2024',
        estimatedValue: '25,000 FCFA',
        trackingNumber: 'TRK001'
      },
      {
        id: '2',
        code: 'DEF456',
        description: 'Livres et documents',
        type: 'Colis documentaire',
        status: 'Livré',
        date: '12/12/2024',
        estimatedValue: '15,000 FCFA',
        trackingNumber: 'TRK002'
      },
      {
        id: '3',
        code: 'GHI789',
        description: 'Produits cosmétiques',
        type: 'Colis cosmétique',
        status: 'Livré',
        date: '10/12/2024',
        estimatedValue: '35,000 FCFA',
        trackingNumber: 'TRK003'
      }
    ],
    in_transit: [
      {
        id: '4',
        code: 'JKL012',
        description: 'Équipements électroniques',
        type: 'Colis électronique',
        status: 'En cours de livraison',
        date: '18/12/2024',
        estimatedValue: '150,000 FCFA',
        trackingNumber: 'TRK004'
      },
      {
        id: '5',
        code: 'MNO345',
        description: 'Pièces détachées auto',
        type: 'Colis pièce détachée',
        status: 'En préparation',
        date: '20/12/2024',
        estimatedValue: '80,000 FCFA',
        trackingNumber: 'TRK005'
      }
    ],
    cancelled: [
      {
        id: '6',
        code: 'PQR678',
        description: 'Mobilier de bureau',
        type: 'Colis mobilier',
        status: 'Annulé',
        date: '05/12/2024',
        estimatedValue: '200,000 FCFA',
        trackingNumber: 'TRK006'
      }
    ]
  };

  const packages = packagesData[category] || [];

  const getCategoryInfo = () => {
    switch (category) {
      case 'received':
        return {
          title: '📥 Colis reçus',
          subtitle: 'Colis livrés avec succès',
          color: '#4CAF50'
        };
      case 'in_transit':
        return {
          title: '🚚 Colis en cours de livraison',
          subtitle: 'Colis actuellement en transit',
          color: '#FF9800'
        };
      case 'cancelled':
        return {
          title: '❌ Colis annulés',
          subtitle: 'Colis annulés ou retournés',
          color: '#F44336'
        };
      default:
        return {
          title: '📦 Mes colis',
          subtitle: 'Liste de vos colis',
          color: COLORS.primary
        };
    }
  };

  const categoryInfo = getCategoryInfo();

  const showModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedPackage(null);
    });
  };

  const handlePackagePress = (pkg: Package) => {
    showModal(pkg);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📦</Text>
      <Text style={styles.emptyStateTitle}>Aucun colis trouvé</Text>
      <Text style={styles.emptyStateText}>
        Vous n'avez aucun colis dans cette catégorie pour le moment.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes colis</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>{categoryInfo.title}</Text>
          <Text style={styles.categorySubtitle}>{categoryInfo.subtitle}</Text>
          <View style={[styles.categoryIndicator, { backgroundColor: categoryInfo.color }]} />
        </View>

        {packages.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.packagesList}>
            {packages.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={styles.packageCard}
                onPress={() => handlePackagePress(pkg)}
              >
                <View style={styles.packageHeader}>
                  <Text style={styles.packageCode}>{pkg.code}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: categoryInfo.color }]}>
                    <Text style={styles.statusText}>{pkg.status}</Text>
                  </View>
                </View>
                
                <Text style={styles.packageDescription}>{pkg.description}</Text>
                <Text style={styles.packageType}>{pkg.type}</Text>
                
                <View style={styles.packageFooter}>
                  <Text style={styles.packageDate}>📅 {pkg.date}</Text>
                  {pkg.estimatedValue && (
                    <Text style={styles.packageValue}>💰 {pkg.estimatedValue}</Text>
                  )}
                </View>
                
                {pkg.trackingNumber && (
                  <Text style={styles.trackingNumber}>🔍 Suivi: {pkg.trackingNumber}</Text>
                )}
                
                {category === 'in_transit' && (
                  <TouchableOpacity 
                    style={styles.trackButton}
                    onPress={() => navigation.navigate('PackageTracking' as any, { packageId: pkg.code })}
                  >
                    <Text style={styles.trackButtonText}>📍 Suivre en temps réel</Text>
                  </TouchableOpacity>
                )}
                
                {category === 'received' && (
                  <TouchableOpacity 
                    style={styles.rateButton}
                    onPress={() => navigation.navigate('PackageRating' as any, { 
                      packageId: pkg.code, 
                      packageData: pkg 
                    })}
                  >
                    <Text style={styles.rateButtonText}>⭐ Évaluer la livraison</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal pour les détails du colis */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={hideModal}
          />
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {selectedPackage && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Détails du colis {selectedPackage.code}</Text>
                </View>
                
                <View style={styles.modalContent}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={styles.detailValue}>{selectedPackage.description}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>{selectedPackage.type}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Statut:</Text>
                    <Text style={styles.detailValue}>{selectedPackage.status}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>{selectedPackage.date}</Text>
                  </View>
                  
                  {selectedPackage.estimatedValue && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Valeur:</Text>
                      <Text style={styles.detailValue}>{selectedPackage.estimatedValue}</Text>
                    </View>
                  )}
                  
                  {selectedPackage.trackingNumber && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Numéro de suivi:</Text>
                      <Text style={styles.detailValue}>{selectedPackage.trackingNumber}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.modalActions}>
                  {category === 'in_transit' && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => {
                        hideModal();
                        navigation.navigate('PackageTracking' as any, { packageId: selectedPackage.code });
                      }}
                    >
                      <Text style={styles.actionButtonText}>SUIVRE EN TEMPS RÉEL</Text>
                    </TouchableOpacity>
                  )}
                  
                  {category === 'received' && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => {
                        hideModal();
                        navigation.navigate('PackageRating' as any, { 
                          packageId: selectedPackage.code, 
                          packageData: selectedPackage 
                        });
                      }}
                    >
                      <Text style={styles.actionButtonText}>⭐ ÉVALUER LA LIVRAISON</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={hideModal}
                  >
                    <Text style={styles.cancelButtonText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  categoryHeader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  categorySubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  categoryIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  packagesList: {
    marginBottom: 30,
  },
  packageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  packageDescription: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  packageType: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  packageValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  trackingNumber: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  trackButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  trackButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  rateButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  rateButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Styles pour le modal
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
    maxHeight: '80%',
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
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    width: 120,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PackageListScreen;
