// ============================================================================
// IMPORTATIONS
// ============================================================================
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ProfileScreenProps } from '../types';
import { COLORS } from '../constants';
import { useAuth } from '../hooks';
import { LogoutModal } from '../components';

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

/**
 * Écran de profil utilisateur
 * Affiche les informations personnelles, statistiques et options de compte
 */
const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  
  // ============================================================================
  // HOOKS ET ÉTAT LOCAL
  // ============================================================================
  
  /** Hook d'authentification pour récupérer les données utilisateur */
  const { user, logout } = useAuth();
  
  /** État pour contrôler l'affichage du modal de déconnexion */
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  

  // ============================================================================
  // GESTIONNAIRES D'ÉVÉNEMENTS
  // ============================================================================
  
  /**
   * Affiche le modal de confirmation de déconnexion
   */
  const handleLogoutPress = (): void => {
    setShowLogoutModal(true);
  };

  /**
   * Confirme et exécute la déconnexion de l'utilisateur
   * Redirige vers l'écran d'authentification après déconnexion
   */
  const handleLogoutConfirm = async (): Promise<void> => {
    try {
      setShowLogoutModal(false);
      await logout();
      // Réinitialise la pile de navigation pour éviter le retour
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  /**
   * Annule la déconnexion et ferme le modal
   */
  const handleLogoutCancel = (): void => {
    setShowLogoutModal(false);
  };

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================
  
  return (
    <View style={styles.container}>
      {/* Contenu scrollable de l'écran de profil */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section principale du profil utilisateur */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <View style={styles.userNameContainer}>
                <Text style={styles.userName}>
                  {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
                </Text>
                <View style={styles.userInitialsContainer}>
                  <Text style={styles.userInitials}>
                    {user ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}` : 'U'}
                  </Text>
                </View>
              </View>
              {user?.email && (
                <Text style={styles.userEmail}>{user.email}</Text>
              )}
            </View>
          </View>
        </View>


        {/* Section Statistiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🚗</Text>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>❌</Text>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Annulées</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📦</Text>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>En cours</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Validées</Text>
            </View>
          </View>
        </View>

        {/* Section Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>🔒</Text>
            </View>
            <Text style={styles.actionText}>Changer votre mot de passe</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section Historique et Adresses */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>📋</Text>
            </View>
            <Text style={styles.actionText}>Historique des colis</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>📍</Text>
            </View>
            <Text style={styles.actionText}>Mes adresses</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section Paiement */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>💳</Text>
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionText}>Modes de paiement</Text>
              <Text style={styles.actionSubtext}>Espèces</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>🎁</Text>
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionText}>Réductions et cadeaux</Text>
              <Text style={styles.actionSubtext}>Saisir un code promotionnel</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section Assistance */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>🎧</Text>
            </View>
            <Text style={styles.actionText}>Assistance</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>ℹ️</Text>
            </View>
            <Text style={styles.actionText}>Informations</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section Sécurité */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>🛡️</Text>
            </View>
            <Text style={styles.actionText}>Sécurité</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>⚙️</Text>
            </View>
            <Text style={styles.actionText}>Paramètres</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section de déconnexion avec bouton principal */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogoutPress}
          >
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de confirmation de déconnexion */}
      <LogoutModal
        visible={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        userName={user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
      />
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

/**
 * Définition de tous les styles utilisés dans le composant ProfileScreen
 * Organisés par sections : container, profile, actions, modals, etc.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
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
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  userInitialsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  userInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
  },
  actionItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 18,
    color: '#FF6B35',
  },
  actionText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  actionArrow: {
    fontSize: 18,
    color: '#CCCCCC',
    fontWeight: 'bold',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
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
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionSubtext: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

// ============================================================================
// EXPORT DU COMPOSANT
// ============================================================================

/**
 * Export du composant ProfileScreen comme export par défaut
 * Ce composant peut être utilisé dans la navigation de l'application
 */
export default ProfileScreen;
