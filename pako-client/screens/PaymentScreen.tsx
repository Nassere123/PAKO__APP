import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS } from '../constants';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { OrderService } from '../services/orderService';

type PaymentScreenProps = StackScreenProps<RootStackParamList, 'Payment'>;

const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    {
      id: 'orange_money',
      name: 'Orange Money',
      icon: '🍊',
      description: 'Payer avec Orange Money',
    },
    {
      id: 'mtn_money',
      name: 'MTN Money',
      icon: '📱',
      description: 'Payer avec MTN Money',
    },
    {
      id: 'moov_money',
      name: 'Moov Money',
      icon: '💳',
      description: 'Payer avec Moov Money',
    },
    {
      id: 'cash',
      name: 'Espèces',
      icon: '💰',
      description: 'Payer en espèces à la livraison',
    },
  ];

  const packageDetails = {
    id: '#PAKO-2024-001',
    description: 'Colis vers Gare du Nord',
    price: 2500,
    fees: 500,
    total: 3000,
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Erreur', 'Veuillez sélectionner un mode de paiement');
      return;
    }

    setLoading(true);
    
    try {
      // Simulation de paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Récupérer les données de commande depuis les paramètres de navigation
      const orderData = navigation.getState().routes.find(route => 
        route.name === 'Payment'
      )?.params as any;

      if (orderData) {
        // Sauvegarder la commande avec le statut "confirmed"
        const savedOrder = await OrderService.saveOrder({
          ...orderData,
          totalPrice: packageDetails.total,
          paymentMethod: selectedPaymentMethod,
          status: 'confirmed' as const,
        });

        console.log('Commande sauvegardée:', savedOrder.orderNumber);

        setLoading(false);
        Alert.alert(
          'Paiement réussi !',
          `Votre commande ${savedOrder.orderNumber} a été confirmée et sera traitée sous peu.`,
          [
            {
              text: 'Voir mes colis',
              onPress: () => navigation.navigate('MyPackages')
            },
            {
              text: 'Suivre le colis',
              onPress: () => navigation.navigate('PackageTracking', { packageId: savedOrder.orderNumber })
            }
          ]
        );
      } else {
        // Fallback si pas de données de commande
        setLoading(false);
        Alert.alert(
          'Paiement réussi !',
          'Votre paiement a été traité avec succès',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('PackageTracking', { packageId: packageDetails.id })
            }
          ]
        );
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Erreur', 'Une erreur est survenue lors du traitement du paiement');
    }
  };

  const renderPaymentMethod = (method: any) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethodCard,
        selectedPaymentMethod === method.id && styles.selectedPaymentMethod
      ]}
      onPress={() => handlePaymentMethodSelect(method.id)}
    >
      <View style={styles.paymentMethodContent}>
        <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
        <View style={styles.paymentMethodInfo}>
          <Text style={styles.paymentMethodName}>{method.name}</Text>
          <Text style={styles.paymentMethodDescription}>{method.description}</Text>
        </View>
        {selectedPaymentMethod === method.id && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image 
            source={require('../assets/8bedea66-f318-404b-8ffd-73beacaa06c5.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>PAKO Client</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Paiement</Text>
        
        <View style={styles.packageSummary}>
          <Text style={styles.summaryTitle}>Résumé de la commande</Text>
          <Text style={styles.packageId}>{packageDetails.id}</Text>
          <Text style={styles.packageDescription}>{packageDetails.description}</Text>
          
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Prix de livraison</Text>
              <Text style={styles.priceValue}>{packageDetails.price} FCFA</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Frais de service</Text>
              <Text style={styles.priceValue}>{packageDetails.fees} FCFA</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{packageDetails.total} FCFA</Text>
            </View>
          </View>
        </View>

        <View style={styles.paymentMethodsSection}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
          {paymentMethods.map(renderPaymentMethod)}
        </View>

        <TouchableOpacity
          style={[styles.payButton, loading && styles.disabledButton]}
          onPress={handlePayment}
          disabled={loading}
        >
          <Text style={styles.payButtonText}>
            {loading ? 'Traitement...' : `Payer ${packageDetails.total} FCFA`}
          </Text>
        </TouchableOpacity>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  logoImage: {
    width: 80,
    height: 40,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 20,
  },
  packageSummary: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
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
    marginBottom: 16,
  },
  priceBreakdown: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  paymentMethodsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  paymentMethodCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedPaymentMethod: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF5F0',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: COLORS.textSecondary,
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen;
