import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ProfileScreenProps } from '../types';
import { COLORS } from '../constants';
import { useAuth } from '../hooks';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section Mon Profil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}></Text>
          
          <View style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Text style={styles.profileImageText}>👤</Text>
              </View>
              <TouchableOpacity style={styles.cameraButton}>
                <Text style={styles.cameraIcon}>📷</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
              </Text>
              <TouchableOpacity style={styles.editProfileButton}>
                <Text style={styles.editProfileText}>Modifier le profil</Text>
              </TouchableOpacity>
              
              <View style={styles.contactInfo}>
                {user?.email && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactIcon}>📧</Text>
                    <Text style={styles.contactText}>{user.email}</Text>
                  </View>
                )}
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>📱</Text>
                  <Text style={styles.contactText}>{user?.phone || 'Non défini'}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>📍</Text>
                  <Text style={styles.contactText}>{user?.address || 'Adresse non définie'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Section Statistiques */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <Text style={styles.chartIcon}>📊</Text>
          </View>
          
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
            <Text style={styles.actionIcon}>🔒</Text>
            <Text style={styles.actionText}>Changer votre mot de passe</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section Historique et Adresses */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Historique des colis</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionText}>Mes adresses</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section Paiement */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>💳</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionText}>Modes de paiement</Text>
              <Text style={styles.actionSubtext}>Espèces</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>🎁</Text>
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
            <Text style={styles.actionIcon}>🎧</Text>
            <Text style={styles.actionText}>Assistance</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>ℹ️</Text>
            <Text style={styles.actionText}>Informations</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section Sécurité */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>🛡️</Text>
            <Text style={styles.actionText}>Sécurité</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>Paramètres</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section Déconnexion */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 40,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  chartIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
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
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 40,
    color: COLORS.textSecondary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 14,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  editProfileButton: {
    marginBottom: 16,
  },
  editProfileText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  contactInfo: {
    width: '100%',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  actionItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
  },
  actionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionArrow: {
    fontSize: 20,
    color: COLORS.textSecondary,
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
