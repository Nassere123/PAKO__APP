import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Animated, Modal } from 'react-native';
import { HomeScreenProps } from '../types';
import { COLORS } from '../constants';
import { CustomHeader } from '../components';

interface HistoryItem {
  id: string;
  packageId: string;
  date: string;
  status: 'delivered' | 'in_transit' | 'pending';
  destination: string;
  description: string;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'packages' | 'profile'>('home');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  
  const [historyItems] = useState<HistoryItem[]>([
    {
      id: '1',
      packageId: '#PAKO-2024-001',
      date: '15 Jan 2024',
      status: 'delivered',
      destination: 'Gare du Nord',
      description: 'Colis livré avec succès',
    },
    {
      id: '2',
      packageId: '#PAKO-2024-002',
      date: '12 Jan 2024',
      status: 'delivered',
      destination: 'Gare de Lyon',
      description: 'Colis récupéré par le destinataire',
    },
    {
      id: '3',
      packageId: '#PAKO-2024-003',
      date: '10 Jan 2024',
      status: 'delivered',
      destination: 'Gare Montparnasse',
      description: 'Livraison effectuée',
    },
    {
      id: '4',
      packageId: '#PAKO-2024-004',
      date: '8 Jan 2024',
      status: 'delivered',
      destination: 'Gare Saint-Lazare',
      description: 'Colis déposé à la gare',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return COLORS.primary;
      case 'in_transit':
        return '#FFD700';
      case 'pending':
        return '#FF6B35';
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Livré';
      case 'in_transit':
        return 'En cours';
      case 'pending':
        return 'En attente';
      default:
        return status;
    }
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.packageId}>{item.packageId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.destination}>📍 {item.destination}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.date}>{item.date}</Text>
    </TouchableOpacity>
  );

  const handleRefresh = async () => {
    if (isRefreshing || isLoading) return; // Empêcher les clics multiples
    
    setIsRefreshing(true);
    setIsLoading(true);
    
    // Démarrer l'animation de rotation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();
    
    try {
      // Simuler un délai d'actualisation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ici vous pouvez ajouter la logique pour recharger les données
      // Par exemple, refetch des données depuis l'API
      console.log('Données actualisées');
      
    } catch (error) {
      console.error('Erreur lors de l\'actualisation:', error);
    } finally {
      // Arrêter l'animation
      spinAnimation.stop();
      spinValue.setValue(0);
      
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  const renderHomeContent = () => (
    <View style={styles.content}>
      {/* Boutons d'action principaux */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryActionButton]}
          onPress={() => navigation.navigate('MultiStepPackageRegistration' as any)}
        >
          <Text style={styles.actionButtonIcon}>📦</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.primaryActionButtonText}>Recevoir mon colis</Text>
            <Text style={styles.actionButtonSubtext}>Livraison à domicile</Text>
          </View>
        </TouchableOpacity>

      </View>

    </View>
  );

  const renderPackagesContent = () => (
    <View style={[styles.content, (isRefreshing || isLoading) && styles.contentLoading]}>
      <View style={styles.packagesHeader}>
        <View style={styles.packagesTitleContainer}>
          <View style={styles.packagesIconContainer}>
            <Text style={styles.packagesIcon}>📦</Text>
          </View>
          <Text style={styles.packagesTitle}>Mes colis enregistrés</Text>
        </View>
        <TouchableOpacity 
          onPress={handleRefresh} 
          disabled={isRefreshing || isLoading}
          style={[styles.refreshButton, (isRefreshing || isLoading) && styles.refreshButtonDisabled]}
        >
          <Animated.Text 
            style={[
              styles.refreshIcon, 
              {
                transform: [{
                  rotate: spinValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }]
              }
            ]}
          >
            🔄
          </Animated.Text>
        </TouchableOpacity>
      </View>
      
      {/* Section Gérez vos colis */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Gérez vos colis</Text>
        <Text style={styles.welcomeSubtitle}>
          Consultez le statut de vos colis et suivez leur livraison
        </Text>
      </View>

      {/* Options des colis */}
      <View style={styles.optionsContainer}>
        {/* Ligne du haut - 2 cartes */}
        <View style={styles.topRow}>
          <TouchableOpacity 
            style={[
              styles.optionCard, 
              styles.halfCard, 
              { borderLeftColor: '#4CAF50' },
              pressedCard === 'received' && styles.pressedCard
            ]}
            onPress={() => navigation.navigate('PackageList' as any, { category: 'received' })}
            onPressIn={() => setPressedCard('received')}
            onPressOut={() => setPressedCard(null)}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>📥 Colis reçus</Text>
                <Text style={styles.optionDescription}>Colis livrés avec succès</Text>
              </View>
              <View style={[styles.countBadge, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.countText}>3</Text>
              </View>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.optionCard, 
              styles.halfCard, 
              { borderLeftColor: '#FF9800' },
              pressedCard === 'in_transit' && styles.pressedCard
            ]}
            onPress={() => navigation.navigate('PackageList' as any, { category: 'in_transit' })}
            onPressIn={() => setPressedCard('in_transit')}
            onPressOut={() => setPressedCard(null)}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>🚚 Colis en cours</Text>
                <Text style={styles.optionDescription}>Colis en transit</Text>
              </View>
              <View style={[styles.countBadge, { backgroundColor: '#FF9800' }]}>
                <Text style={styles.countText}>2</Text>
              </View>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Ligne du bas - 1 carte */}
        <View style={styles.bottomRow}>
          <TouchableOpacity 
            style={[
              styles.optionCard, 
              styles.fullCard, 
              { borderLeftColor: '#F44336' },
              pressedCard === 'cancelled' && styles.pressedCard
            ]}
            onPress={() => navigation.navigate('PackageList' as any, { category: 'cancelled' })}
            onPressIn={() => setPressedCard('cancelled')}
            onPressOut={() => setPressedCard(null)}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>❌ Colis annulés</Text>
                <Text style={styles.optionDescription}>Colis annulés ou retournés</Text>
              </View>
              <View style={[styles.countBadge, { backgroundColor: '#F44336' }]}>
                <Text style={styles.countText}>1</Text>
              </View>
            </View>
            <Text style={styles.optionArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section Besoin d'aide */}
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
    </View>
  );


  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'packages':
        return renderPackagesContent();
      default:
        return renderHomeContent();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header personnalisé - affiché seulement sur l'onglet Accueil */}
      {activeTab === 'home' && (
        <CustomHeader 
          onProfilePress={() => navigation.navigate('Profile')}
          onNotificationPress={() => {
            console.log('Notifications pressed');
          }}
        />
      )}
      
      {renderContent()}

      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'home' && styles.activeNavItem]}
          onPress={() => setActiveTab('home')}
        >
          <Image 
            source={require('../assets/maison.png')} 
            style={[styles.navIconHome, activeTab === 'home' && styles.activeNavIcon]} 
            resizeMode="contain"
          />
          <Text style={[styles.navLabel, activeTab === 'home' && styles.activeNavLabel]}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'packages' && styles.activeNavItem]}
          onPress={() => setActiveTab('packages')}
        >
            <Image 
              source={require('../assets/paquet.gif')} 
              style={[styles.navIcon, activeTab === 'packages' && styles.activeNavIcon]} 
              resizeMode="contain"
            />
          <Text style={[styles.navLabel, activeTab === 'packages' && styles.activeNavLabel]}>Mes colis</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile' as any)}
        >
          <Image 
            source={require('../assets/profil.gif')} 
            style={styles.navIconHome} 
            resizeMode="contain"
          />
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>

      {/* Overlay de chargement */}
      <Modal
        transparent={true}
        visible={isRefreshing || isLoading}
        animationType="fade"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <Animated.Text 
              style={[
                styles.loadingIcon,
                {
                  transform: [{
                    rotate: spinValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    })
                  }]
                }
              ]}
            >
              🔄
            </Animated.Text>
            <Text style={styles.loadingTitle}>Actualisation en cours...</Text>
            <Text style={styles.loadingSubtitle}>Chargement de vos colis</Text>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  contentLoading: {
    opacity: 0.7,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF8C42',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 32,
    letterSpacing: 0.3,
  },
  infoCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  searchContainer: {
    marginBottom: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    marginBottom: 5,
    gap: 12,
  },
  actionButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
  primaryActionButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionButtonContent: {
    alignItems: 'center',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 2,
  },
  actionButtonSubtext: {
    fontSize: 10,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  calendarIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  scheduleText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  packageCard: {
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
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageTime: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  packageDestination: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  packageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  packageActionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  evaluateButton: {
    backgroundColor: COLORS.secondary,
  },
  packageActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  addPackageButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addPackageIcon: {
    fontSize: 32,
    color: COLORS.primary,
    marginBottom: 8,
  },
  addPackageText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    // Style pour l'élément actif
  },
  navIcon: {
    width: 40,
    height: 40,
    marginBottom: 4,
    opacity: 0.6,
    alignSelf: 'center',
  },
  navIconHome: {
    width: 32,
    height: 32,
    marginBottom: 4,
    opacity: 0.6,
    alignSelf: 'center',
  },
  activeNavIcon: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeNavLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  packagesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingTop: 20,
  },
  packagesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  packagesIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  packagesIcon: {
    fontSize: 20,
    color: COLORS.white,
  },
  packagesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  refreshButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonDisabled: {
    opacity: 0.7,
  },
  refreshIcon: {
    fontSize: 26,
    color: '#FF6B35',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    minWidth: 200,
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    opacity: 0.8,
  },
  refreshIconSpinning: {
    // L'animation sera gérée par React Native Animated si nécessaire
    opacity: 0.7,
  },
  historySection: {
    marginTop: 20,
  },
  historySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    marginLeft: 4,
  },
  historyListContainer: {
    paddingBottom: 10,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  destination: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bottomRow: {
    width: '100%',
  },
  halfCard: {
    width: '48%',
    marginBottom: 0,
  },
  fullCard: {
    width: '100%',
  },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  countBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  optionArrow: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  // Styles pour les états actifs des boutons
  activeCard: {
    backgroundColor: '#F8F9FA',
    borderColor: '#007AFF',
    shadowOpacity: 0.15,
    elevation: 5,
  },
  pressedCard: {
    backgroundColor: '#F0F0F0',
    transform: [{ scale: 0.98 }],
  },
  helpSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  helpButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  helpButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
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
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  startShoppingButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startShoppingText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen;
