// ============================================================================
// ÉCRAN "MES COLIS" - VERSION SIMPLIFIÉE AVEC API
// ============================================================================
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { CountersService, PackageCounters } from '../services/countersService';
import Toast from '../components/Toast';

type MyPackagesScreenProps = StackScreenProps<RootStackParamList, 'MyPackages'>;

const MyPackagesScreen: React.FC<MyPackagesScreenProps> = ({ navigation }) => {
  // ============================================================================
  // HOOKS ET ÉTAT
  // ============================================================================
  const { user } = useAuth();
  const [counters, setCounters] = useState<PackageCounters>({
    delivered: 0,
    inProgress: 0,
    cancelled: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // ============================================================================
  // FONCTIONS
  // ============================================================================

  /**
   * Charge les compteurs de colis depuis l'API
   */
  const loadCounters = async () => {
    try {
      setLoading(true);
      console.log('🔄 === CHARGEMENT COMPTEURS ===');
      console.log('👤 Utilisateur:', user ? `${user.firstName} ${user.lastName}` : 'Aucun');
      console.log('🆔 User ID:', user?.id);
      
      if (!user?.id) {
        console.log('⚠️ Pas d\'utilisateur connecté');
        setCounters({ delivered: 0, inProgress: 0, cancelled: 0, total: 0 });
        return;
      }
      
      // Appel API pour récupérer les compteurs
      const newCounters = await CountersService.getPackageCounters(user.id);
      setCounters(newCounters);
      
      console.log('✅ Compteurs chargés:', newCounters);
      
    } catch (error) {
      console.error('❌ Erreur chargement compteurs:', error);
      showToast('Erreur lors du chargement des compteurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Affiche un toast de notification
   */
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  /**
   * Cache le toast
   */
  const hideToast = () => {
    setToastVisible(false);
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCounters();
    });
    
    loadCounters();
    
    return unsubscribe;
  }, [navigation]);

  // ============================================================================
  // CONFIGURATION DES OPTIONS
  // ============================================================================
  
  const packageOptions = [
    {
      id: 'received',
      title: 'COLIS REÇUS',
      description: 'Colis livrés avec succès',
      count: counters.delivered,
      color: '#4CAF50',
      iconName: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
      iconColor: '#4CAF50',
      bgColor: 'rgba(76, 175, 80, 0.1)',
      onPress: () => navigation.navigate('PackageList' as any, { category: 'received' })
    },
    {
      id: 'in_transit',
      title: 'COLIS EN COURS',
      description: 'Colis en transit',
      count: counters.inProgress,
      color: '#FF9800',
      iconName: 'cube-outline' as keyof typeof Ionicons.glyphMap,
      iconColor: '#FF9800',
      bgColor: 'rgba(255, 152, 0, 0.1)',
      onPress: () => navigation.navigate('PackageList' as any, { category: 'in_transit' })
    },
    {
      id: 'cancelled',
      title: 'COLIS ANNULÉS',
      description: 'Colis annulés ou retournés',
      count: counters.cancelled,
      color: '#F44336',
      iconName: 'close-circle' as keyof typeof Ionicons.glyphMap,
      iconColor: '#F44336',
      bgColor: 'rgba(244, 67, 54, 0.1)',
      onPress: () => navigation.navigate('PackageList' as any, { category: 'cancelled' })
    }
  ];

  // ============================================================================
  // RENDU
  // ============================================================================
  
  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.headerIcon}>📦</Text>
            </View>
            <View style={styles.titleTextContainer}>
              <Text style={styles.headerTitle}>Mes colis</Text>
              <Text style={styles.headerSubtitle}>Gérez vos colis</Text>
            </View>
          </View>
          
          {/* Bouton d'actualisation */}
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadCounters}
            disabled={loading}
          >
            <Image 
              source={require('../assets/refresh.png')}
              style={[styles.refreshIcon, loading && { opacity: 0.5 }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenu principal */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section de bienvenue */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Gérez vos colis</Text>
          <Text style={styles.welcomeSubtitle}>
            Consultez le statut de vos colis et suivez leur livraison
          </Text>
        </View>

        {/* Grille des options de colis */}
        <View style={styles.optionsGrid}>
          {packageOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                { borderLeftColor: option.color, backgroundColor: option.bgColor }
              ]}
              onPress={option.onPress}
            >
              <View style={styles.optionCardContent}>
                <View style={styles.optionIconContainer}>
                  <Ionicons 
                    name={option.iconName} 
                    size={32} 
                    color={option.iconColor} 
                  />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <View style={[styles.countContainer, { backgroundColor: option.color }]}>
                    <Text style={styles.countText}>{option.count}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section d'aide */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Besoin d'aide ?</Text>
          <Text style={styles.helpText}>
            Si vous ne trouvez pas votre colis ou si vous avez des questions, 
            contactez notre service client.
          </Text>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Contacter le support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Toast de notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={hideToast}
      />
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerIcon: {
    fontSize: 24,
    color: COLORS.white,
  },
  titleTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#FF6B35',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '400',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    width: 18,
    height: 18,
    tintColor: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeSection: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsGrid: {
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  optionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionIconContainer: {
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  countContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  countText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  helpButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  helpButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyPackagesScreen;