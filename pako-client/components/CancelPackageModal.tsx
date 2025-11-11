import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '../constants';

interface PackageData {
  id: string;
  trackingNumber: string;
  status: 'pending' | 'in_transit' | 'arrived' | 'delivered' | 'cancelled';
  description: string;
  estimatedArrival?: string;
}

interface CancelPackageModalProps {
  visible: boolean;
  packageData: PackageData | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const CancelPackageModal: React.FC<CancelPackageModalProps> = ({
  visible,
  packageData,
  onConfirm,
  onCancel
}) => {
  const canCancel = packageData?.status === 'pending' || packageData?.status === 'in_transit';
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente d\'enregistrement';
      case 'in_transit':
        return 'En cours de livraison';
      case 'arrived':
        return 'Arrivé en gare';
      case 'delivered':
        return 'Livré';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'Statut inconnu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'in_transit':
        return '#2196F3';
      case 'arrived':
        return '#4CAF50';
      case 'delivered':
        return '#8BC34A';
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  if (!packageData) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Icône d'annulation */}
          <View style={styles.iconContainer}>
            <Text style={styles.cancelIcon}>❌</Text>
          </View>

          {/* Titre */}
          <Text style={styles.title}>Annuler la livraison</Text>

          {/* Informations du colis */}
          <View style={styles.packageInfo}>
            <Text style={styles.packageId}>Colis #{packageData.trackingNumber}</Text>
            <Text style={styles.packageDescription}>{packageData.description}</Text>
            
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(packageData.status) }]}>
                <Text style={styles.statusText}>{getStatusText(packageData.status)}</Text>
              </View>
            </View>
          </View>

          {/* Message conditionnel */}
          {!canCancel ? (
            <View style={styles.cannotCancelContainer}>
              <Text style={styles.cannotCancelTitle}>⚠️ Annulation impossible</Text>
              <Text style={styles.cannotCancelMessage}>
                Ce colis ne peut plus être annulé car il est déjà arrivé en gare 
                et a été enregistré par l'agent.
              </Text>
            </View>
          ) : null}

          {/* Boutons d'action */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>
                {canCancel ? 'Non, garder la livraison' : 'Fermer'}
              </Text>
            </TouchableOpacity>

            {canCancel && (
              <TouchableOpacity 
                style={[styles.button, styles.confirmButton]}
                onPress={onConfirm}
              >
                <Text style={styles.confirmButtonText}>Oui, annuler</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  packageInfo: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  packageId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  cannotCancelContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  cannotCancelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8,
    textAlign: 'center',
  },
  cannotCancelMessage: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#F44336',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default CancelPackageModal;
