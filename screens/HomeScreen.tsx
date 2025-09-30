import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { HomeScreenProps } from '../types';
import { COLORS } from '../constants';

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'packages' | 'profile'>('home');

  const renderHomeContent = () => (
    <View style={styles.content}>
      <Text style={styles.title}>Enregistrez votre colis avant qu'il arrive en gare</Text>
      
      

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

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('MyPackages' as any)}
        >
          <Text style={styles.actionButtonIcon}>📋</Text>
          <Text style={styles.actionButtonText}>Historique</Text>
        </TouchableOpacity>
      </View>

      {/* Avantages */}
      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>Pourquoi choisir PAKO ?</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>💰</Text>
            <Text style={styles.benefitText}>Économisez le coût de l'aller-retour en gare</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>⏰</Text>
            <Text style={styles.benefitText}>Gagnez du temps, recevez à domicile</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🚚</Text>
            <Text style={styles.benefitText}>Suivi en temps réel de votre livraison</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPackagesContent = () => (
    <View style={styles.content}>
      <Text style={styles.title}>Mes colis enregistrés</Text>
      
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>
          Aucun colis enregistré pour le moment
        </Text>
        
        <TouchableOpacity 
          style={styles.startShoppingButton}
          onPress={() => navigation.navigate('MultiStepPackageRegistration' as any)}
        >
          <Text style={styles.startShoppingText}>Enregistrer un colis</Text>
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
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 32,
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
    marginTop: 20,
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
  benefitsSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
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
  packageId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statusBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  waitingBadge: {
    backgroundColor: COLORS.textSecondary,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
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
