import React, { useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import SignatureCanvas from 'react-native-signature-canvas';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { DriverDeliveriesStackParamList } from '../../types/navigation';
import { deliveryService } from '../../services/deliveryService';

type NavigationProp = NativeStackNavigationProp<
  DriverDeliveriesStackParamList,
  'DriverSignature'
>;
type RouteProps = RouteProp<DriverDeliveriesStackParamList, 'DriverSignature'>;

const DriverSignatureScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<RouteProps>();
  const { missionId } = params;
  
  const signatureRef = useRef<any>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleOK = (signatureData: string) => {
    // Activer le bouton de confirmation seulement si la signature n'est pas vide
    console.log('handleOK - signature reçue:', signatureData ? 'OUI' : 'NON');
    if (signatureData && signatureData.trim().length > 0) {
      console.log('Signature valide détectée, activation du bouton');
      setSignature(signatureData);
    } else {
      console.log('Signature vide, désactivation du bouton');
      setSignature(null);
    }
  };

  const handleEnd = () => {
    // Cette fonction est appelée quand l'utilisateur termine de signer
    // Activer le bouton immédiatement quand une signature est détectée
    console.log('handleEnd - fin de signature, activation du bouton...');
    setHasSignature(true);
    // Récupérer la signature pour l'envoyer au backend
    setTimeout(() => {
      if (signatureRef.current) {
        try {
          signatureRef.current.readSignature();
        } catch (error) {
          console.error('Erreur lors de la lecture de la signature:', error);
        }
      }
    }, 300);
  };

  const handleEmpty = () => {
    // Quand la signature est effacée
    setSignature(null);
    setHasSignature(false);
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setSignature(null);
    setHasSignature(false);
  };

  const handleConfirm = async () => {
    if (!hasSignature) {
      Alert.alert('Erreur', 'Veuillez signer avant de confirmer');
      return;
    }

    // Récupérer la signature avant de confirmer
    if (signatureRef.current) {
      signatureRef.current.readSignature();
      // Attendre un peu pour que la signature soit récupérée
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    Alert.alert(
      'Confirmer la livraison',
      'Êtes-vous sûr de vouloir confirmer cette livraison ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Confirmer',
          style: 'default',
          onPress: async () => {
            try {
              setIsConfirming(true);
              
              console.log('Tentative de confirmation de livraison, missionId:', missionId);
              
              // Mettre à jour le statut de la livraison à "delivered"
              const result = await deliveryService.updateDelivery(missionId, {
                status: 'delivered',
              });

              console.log('Livraison confirmée avec succès:', result);

              // Ici, vous pouvez également envoyer la signature au backend si nécessaire
              // await deliveryService.uploadSignature(missionId, signature);

              Alert.alert(
                'Succès',
                'Livraison confirmée avec succès',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.goBack();
                      // Recharger la liste des livraisons
                      // Le parent écran devrait recharger automatiquement
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('Erreur lors de la confirmation:', error);
              console.error('Type d\'erreur:', typeof error);
              console.error('Erreur complète:', JSON.stringify(error, null, 2));
              
              // Extraire le message d'erreur
              let errorMessage = 'Erreur inconnue';
              
              if (error?.message) {
                errorMessage = error.message;
              } else if (error instanceof Error) {
                errorMessage = error.message;
              } else if (typeof error === 'string') {
                errorMessage = error;
              } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
              } else if (error?.status) {
                errorMessage = `Erreur HTTP ${error.status}: ${error.message || 'Erreur serveur'}`;
              }
              
              console.error('Message d\'erreur final:', errorMessage);
              
              Alert.alert(
                'Erreur',
                `Impossible de confirmer la livraison: ${errorMessage}. Veuillez réessayer.`
              );
            } finally {
              setIsConfirming(false);
            }
          },
        },
      ]
    );
  };

  const style = `
    body,html {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }
    .m-signature-pad {
      position: absolute;
      font-size: 10px;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      margin: 0;
      padding: 0;
      border: none;
      background-color: white;
    }
    .m-signature-pad--body {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      border: none;
    }
    .m-signature-pad--body canvas {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      border-radius: 0;
    }
    .m-signature-pad--footer {
      display: none;
    }
  `;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTexts}>
          <Text style={styles.title}>Signature du client</Text>
          <Text style={styles.subtitle}>Veuillez signer ci-dessous</Text>
        </View>
      </View>

      {/* Zone de signature */}
      <View style={styles.signatureContainer}>
        <View style={styles.signatureLabel}>
          <Text style={styles.signatureLabelText}>Veuillez signer ici</Text>
        </View>
        <View style={styles.signatureBox}>
          <SignatureCanvas
            ref={signatureRef}
            onOK={handleOK}
            onEnd={handleEnd}
            onEmpty={handleEmpty}
            descriptionText=""
            clearText="Effacer"
            confirmText=""
            webStyle={style}
            autoClear={false}
            imageType="image/png"
          />
        </View>
      </View>

      {/* Boutons d'action */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={handleClear}
        >
          <MaterialCommunityIcons name="refresh" size={20} color={COLORS.textPrimary} />
          <Text style={styles.clearButtonText}>Effacer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.confirmButton,
            !hasSignature && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirm}
          disabled={!hasSignature || isConfirming}
        >
          <MaterialCommunityIcons 
            name="check-circle" 
            size={20} 
            color={!hasSignature ? COLORS.textSecondary : COLORS.textInverse} 
          />
          <Text style={[
            styles.confirmButtonText,
            !hasSignature && styles.confirmButtonTextDisabled
          ]}>
            {isConfirming ? 'Confirmation...' : 'Confirmer'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
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
    backgroundColor: COLORS.surface,
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
  signatureContainer: {
    flex: 1,
    padding: SIZES.spacing.lg,
    backgroundColor: COLORS.surface,
  },
  signatureLabel: {
    marginBottom: SIZES.spacing.md,
    alignItems: 'center',
  },
  signatureLabelText: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  signatureBox: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.md,
    backgroundColor: COLORS.textInverse,
    overflow: 'hidden',
    ...(Platform.OS === 'ios' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
    ...(Platform.OS === 'android' && {
      elevation: 2,
    }),
  },
  actionContainer: {
    flexDirection: 'row',
    padding: SIZES.spacing.lg,
    gap: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
    borderRadius: SIZES.borderRadius.md,
    gap: SIZES.spacing.sm,
  },
  clearButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearButtonText: {
    fontSize: SIZES.font.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: SIZES.font.md,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  confirmButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
});

export default DriverSignatureScreen;

