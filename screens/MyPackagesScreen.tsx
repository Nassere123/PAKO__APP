// ============================================================================
// IMPORTATIONS
// ============================================================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';

// ============================================================================
// INTERFACES ET TYPES
// ============================================================================

/**
 * Interface définissant la structure d'un élément d'historique de colis
 * Utilisée pour afficher les colis dans l'historique
 */
interface HistoryItem {
  id: string;           // Identifiant unique du colis
  packageId: string;    // Numéro de suivi du colis (ex: #PAKO-2024-001)
  date: string;         // Date de l'événement
  status: 'delivered' | 'in_transit' | 'pending';  // Statut du colis
  destination: string;  // Lieu de destination
  description: string;  // Description de l'événement
}

/**
 * Type pour les props du composant MyPackagesScreen
 * Définit la navigation et les paramètres reçus
 */
type MyPackagesScreenProps = StackScreenProps<RootStackParamList, 'MyPackages'>;

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

/**
 * Écran affichant l'historique des colis de l'utilisateur
 * Permet de consulter tous les colis livrés, en cours et en attente
 */
const MyPackagesScreen: React.FC<MyPackagesScreenProps> = ({ navigation }) => {
  
  // ============================================================================
  // ÉTAT LOCAL (STATE)
  // ============================================================================
  
  /**
   * Données d'historique des colis (statiques pour le moment)
   * TODO: Remplacer par des données provenant de l'API
   */
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

  // ============================================================================
  // FONCTIONS UTILITAIRES
  // ============================================================================
  
  /**
   * Retourne la couleur appropriée selon le statut du colis
   * @param status - Statut du colis ('delivered', 'in_transit', 'pending')
   * @returns Couleur hexadécimale pour l'affichage
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return COLORS.primary;    // Orange pour les colis livrés
      case 'in_transit':
        return '#FFD700';         // Jaune pour les colis en cours
      case 'pending':
        return '#FF6B35';         // Orange foncé pour les colis en attente
      default:
        return COLORS.textSecondary; // Gris par défaut
    }
  };

  /**
   * Convertit le statut technique en texte lisible en français
   * @param status - Statut technique du colis
   * @returns Texte en français pour l'affichage utilisateur
   */
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

  // ============================================================================
  // FONCTIONS DE RENDU
  // ============================================================================
  
  /**
   * Composant de rendu pour un élément de l'historique des colis
   * Affiche les informations d'un colis sous forme de carte
   * @param item - Données du colis à afficher
   */
  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity style={styles.historyCard}>
      {/* En-tête de la carte avec ID du colis et statut */}
      <View style={styles.historyHeader}>
        <Text style={styles.packageId}>{item.packageId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      {/* Informations détaillées du colis */}
      <Text style={styles.destination}>📍 {item.destination}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.date}>{item.date}</Text>
    </TouchableOpacity>
  );

  // ============================================================================
  // CONFIGURATION DES OPTIONS
  // ============================================================================
  
  /**
   * Configuration des options de navigation pour les différents types de colis
   * Chaque option définit un bouton cliquable avec ses propriétés d'affichage
   */
  const packageOptions = [
    {
      id: 'received',
      title: '📥 Colis reçus',
      description: 'Colis livrés avec succès',
      count: 3,
      color: '#4CAF50',    // Vert pour les colis reçus
      onPress: () => navigation.navigate('PackageList' as any, { category: 'received' })
    },
    {
      id: 'in_transit',
      title: '🚚 Colis en cours de livraison',
      description: 'Colis actuellement en transit',
      count: 2,
      color: '#FF9800',    // Orange pour les colis en cours
      onPress: () => navigation.navigate('PackageList' as any, { category: 'in_transit' })
    },
    {
      id: 'cancelled',
      title: '❌ Colis annulés',
      description: 'Colis annulés ou retournés',
      count: 1,
      color: '#F44336',    // Rouge pour les colis annulés
      onPress: () => navigation.navigate('PackageList' as any, { category: 'cancelled' })
    }
  ];

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================
  
  return (
    <View style={styles.container}>
      {/* En-tête de l'écran avec titre et bouton d'actualisation */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.headerIcon}>📦</Text>
            </View>
            <View style={styles.titleTextContainer}>
              <Text style={styles.headerTitle}>Mes réservations</Text>
              <Text style={styles.headerSubtitle}>Gérez vos réservations</Text>
            </View>
          </View>
          {/* Bouton d'actualisation (actuellement sans fonctionnalité) */}
          <TouchableOpacity style={styles.refreshButton}>
            <Image 
              source={require('../assets/refresh.png')}
              style={styles.refreshIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenu scrollable de l'écran */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section de bienvenue avec titre et description */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Gérez vos colis</Text>
          <Text style={styles.welcomeSubtitle}>
            Consultez le statut de vos colis et suivez leur livraison
          </Text>
        </View>

        {/* Container des options de navigation vers les différents types de colis */}
        <View style={styles.optionsContainer}>
          {packageOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, { borderLeftColor: option.color }]}
              onPress={option.onPress}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <View style={[styles.countBadge, { backgroundColor: option.color }]}>
                  <Text style={styles.countText}>{option.count}</Text>
                </View>
              </View>
              <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section Historique */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historique des colis</Text>
          
          <View style={styles.historyListContainer}>
            {historyItems.map((item) => (
              <View key={item.id}>
                {renderHistoryItem({ item })}
              </View>
            ))}
          </View>
        </View>

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
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

/**
 * Définition de tous les styles utilisés dans le composant
 * Organisés par sections : container, header, content, cards, etc.
 */
const styles = StyleSheet.create({
  // ============================================================================
  // STYLES DU CONTAINER PRINCIPAL
  // ============================================================================
  
  /** Style du conteneur principal de l'écran */
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  
  // ============================================================================
  // STYLES DE L'EN-TÊTE
  // ============================================================================
  
  /** Style de l'en-tête avec padding et bordure */
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
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  countText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionArrow: {
    fontSize: 24,
    color: COLORS.textSecondary,
    marginLeft: 16,
  },
  helpSection: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    marginLeft: 4,
  },
});

// ============================================================================
// EXPORT DU COMPOSANT
// ============================================================================

/**
 * Export du composant MyPackagesScreen comme export par défaut
 * Ce composant peut être utilisé dans la navigation de l'application
 */
export default MyPackagesScreen;

