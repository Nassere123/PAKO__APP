import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';

type CartScreenProps = StackScreenProps<RootStackParamList, 'Cart'>;

interface PackageData {
  packageCode: string;
  packageDescription: string;
  estimatedValue: string;
  specialInstructions: string;
}

interface CartData {
  id: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  destinationStation: string;
  packages: PackageData[];
  createdAt: string;
}

const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const [carts, setCarts] = useState<CartData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simuler le chargement des paniers sauvegardés
    loadSavedCarts();
  }, []);

  const loadSavedCarts = () => {
    // Simulation de données sauvegardées
    const savedCarts: CartData[] = [
      {
        id: '1',
        senderName: 'Jean Dupont',
        senderPhone: '+225 05 76 32 0581',
        senderAddress: 'Bouaké, Centre-ville',
        receiverName: 'Marie Kouassi',
        receiverPhone: '+225 07 12 34 5678',
        destinationStation: 'Gare du Nord',
        deliveryAddress: 'Cocody, Riviera 2',
        packages: [
          { packageCode: 'ABC123', packageDescription: 'Vêtements', estimatedValue: '15000', specialInstructions: '' },
          { packageCode: 'DEF456', packageDescription: 'Livre', estimatedValue: '5000', specialInstructions: 'Fragile' },
        ],
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        senderName: 'Pierre Martin',
        senderPhone: '+225 05 98 76 5432',
        senderAddress: 'Daloa, Centre-ville',
        receiverName: 'Fatou Traoré',
        receiverPhone: '+225 07 65 43 2109',
        destinationStation: 'Gare de Lyon',
        deliveryAddress: 'Plateau, Boulevard Lagunaire',
        packages: [
          { packageCode: 'GHI789', packageDescription: 'Électronique', estimatedValue: '75000', specialInstructions: 'À manipuler avec précaution' },
        ],
        createdAt: '2024-01-14',
      },
    ];
    setCarts(savedCarts);
  };

  const handleValidateCart = async (cartId: string) => {
    setLoading(true);
    
    // Simulation de validation
    setTimeout(() => {
      setLoading(false);
      setCarts(prev => prev.filter(cart => cart.id !== cartId));
      Alert.alert(
        'Succès',
        'Commande validée et enregistrée avec succès !',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    }, 2000);
  };

  const handleDeleteCart = (cartId: string) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => setCarts(prev => prev.filter(cart => cart.id !== cartId))
        }
      ]
    );
  };

  const handleEditCart = (cart: CartData) => {
    // Naviguer vers l'écran d'édition avec les données du panier
    navigation.navigate('MultiStepPackageRegistration', { editCart: cart });
  };

  const renderCart = (cart: CartData) => (
    <View key={cart.id} style={styles.cartCard}>
      <View style={styles.cartHeader}>
        <View style={styles.cartInfo}>
          <Text style={styles.cartTitle}>
            Commande #{cart.id} - {cart.destinationStation}
          </Text>
          <Text style={styles.cartDate}>
            Créée le {new Date(cart.createdAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <View style={styles.cartActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditCart(cart)}
          >
            <Text style={styles.editButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteCart(cart.id)}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cartDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Expéditeur:</Text>
          <Text style={styles.detailValue}>{cart.senderName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Destinataire:</Text>
          <Text style={styles.detailValue}>{cart.receiverName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Adresse:</Text>
          <Text style={styles.detailValue}>{cart.deliveryAddress}</Text>
        </View>
      </View>

      <View style={styles.packagesSection}>
        <Text style={styles.packagesTitle}>
          Colis ({cart.packages.length})
        </Text>
        {cart.packages.map((pkg, index) => (
          <View key={pkg.packageCode} style={styles.packageItem}>
            <Text style={styles.packageCode}>{pkg.packageCode}</Text>
            <Text style={styles.packageDescription}>{pkg.packageDescription}</Text>
            {pkg.estimatedValue && (
              <Text style={styles.packageValue}>{pkg.estimatedValue} FCFA</Text>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.validateButton, loading && styles.disabledButton]}
        onPress={() => handleValidateCart(cart.id)}
        disabled={loading}
      >
        <Text style={styles.validateButtonText}>
          {loading ? 'Validation...' : 'Valider cette commande'}
        </Text>
      </TouchableOpacity>
    </View>
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
        <Text style={styles.title}>Mes paniers en attente</Text>
        <Text style={styles.subtitle}>
          Validez vos commandes ou continuez à les modifier
        </Text>

        {carts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyTitle}>Aucun panier en attente</Text>
            <Text style={styles.emptyText}>
              Créez une nouvelle commande pour commencer
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('MultiStepPackageRegistration', {})}
            >
              <Text style={styles.createButtonText}>Créer une commande</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {carts.map(renderCart)}
            
            <TouchableOpacity
              style={styles.addNewButton}
              onPress={() => navigation.navigate('MultiStepPackageRegistration', {})}
            >
              <Text style={styles.addNewButtonText}>+ Créer une nouvelle commande</Text>
            </TouchableOpacity>
          </>
        )}
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
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  cartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
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
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cartInfo: {
    flex: 1,
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cartDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cartActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 6,
  },
  editButtonText: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 6,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  cartDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
  },
  packagesSection: {
    marginBottom: 16,
  },
  packagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  packageItem: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  packageCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 2,
  },
  packageDescription: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  packageValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  validateButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  validateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  addNewButton: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addNewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

export default CartScreen;
