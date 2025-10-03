import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { ProfileScreenProps } from '../types';
import { COLORS } from '../constants';
import { useAuth, useProfilePhoto } from '../hooks';
import { LogoutModal } from '../components';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { selectedImage, pickImage, isPicking } = useProfilePhoto();

  const handleLogoutPress = (): void => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async (): Promise<void> => {
    try {
      setShowLogoutModal(false);
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleLogoutCancel = (): void => {
    setShowLogoutModal(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section Mon Profil */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage} disabled={isPicking}>
              <View style={styles.profileImage}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.profileImagePhoto} />
                ) : (
                  <Text style={styles.profileImageIcon}>📷</Text>
                )}
                <View style={styles.cameraIconOverlay}>
                  <Text style={styles.cameraIcon}>{isPicking ? '...' : '+'}</Text>
                </View>
              </View>
            </TouchableOpacity>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
              </Text>
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

        {/* Section Déconnexion */}
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
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    position: 'relative',
  },
  profileImageIcon: {
    fontSize: 24,
    color: '#6C757D',
  },
  profileImagePhoto: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cameraIcon: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
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

export default ProfileScreen;
