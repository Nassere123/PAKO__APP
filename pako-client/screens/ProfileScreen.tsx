// ============================================================================
// IMPORTATIONS
// ============================================================================
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileScreenProps } from '../types';
import { COLORS } from '../constants';
import { useAuth, useTheme, useTranslation } from '../hooks';

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
  const { user } = useAuth();
  
  /** Hook pour gérer le thème de l'application */
  const { colors } = useTheme();
  
  /** Hook pour les traductions */
  const { t } = useTranslation();

  // ============================================================================
  // RENDU PRINCIPAL
  // ============================================================================
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Contenu scrollable de l'écran de profil */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section principale du profil utilisateur */}
        <View style={styles.section}>
          <View style={[styles.profileCard, { backgroundColor: colors.white, shadowColor: colors.shadow, borderColor: colors.border }]}>
            <View style={styles.profileInfo}>
              <View style={styles.userNameContainer}>
                <Text style={[styles.userName, { color: colors.textPrimary }]}>
                  {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
                </Text>
                <View style={[styles.userInitialsContainer, { backgroundColor: COLORS.primary }]}>
                  <Text style={styles.userInitials}>
                    {user ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}` : 'U'}
                  </Text>
                </View>
              </View>
              {user?.email && (
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
              )}
            </View>
          </View>
        </View>



        {/* Section Adresses */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.actionItem, { backgroundColor: colors.white, shadowColor: colors.shadow, borderColor: colors.border }]}
            onPress={() => navigation.navigate('FavoriteLocations' as any)}
          >
            <Ionicons name="location-outline" size={24} color={COLORS.primary} style={styles.iconOnly} />
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>{t('my_addresses')}</Text>
            <Text style={[styles.actionArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section Paiement */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.actionItem, { backgroundColor: colors.white, shadowColor: colors.shadow, borderColor: colors.border }]}>
            <Ionicons name="card-outline" size={24} color={COLORS.primary} style={styles.iconOnly} />
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionText, { color: colors.textPrimary }]}>{t('payment_methods')}</Text>
              <Text style={[styles.actionSubtext, { color: colors.textSecondary }]}>Espèces</Text>
            </View>
            <Text style={[styles.actionArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section Assistance */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.actionItem, { backgroundColor: colors.white, shadowColor: colors.shadow, borderColor: colors.border }]}>
            <Ionicons name="headset-outline" size={24} color={COLORS.primary} style={styles.iconOnly} />
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>{t('assistance')}</Text>
            <Text style={[styles.actionArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionItem, { backgroundColor: colors.white, shadowColor: colors.shadow, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} style={styles.iconOnly} />
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>{t('information')}</Text>
            <Text style={[styles.actionArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section Paramètres */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.actionItem, { backgroundColor: colors.white, shadowColor: colors.shadow, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Settings' as any)}
          >
            <Ionicons name="settings-outline" size={24} color={COLORS.primary} style={styles.iconOnly} />
            <Text style={[styles.actionText, { color: colors.textPrimary }]}>{t('settings')}</Text>
            <Text style={[styles.actionArrow, { color: colors.textSecondary }]}>›</Text>
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
 * Définition de tous les styles utilisés dans le composant ProfileScreen
 * Organisés par sections : container, profile, actions, modals, etc.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 12,
    marginLeft: 4,
  },
  profileCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    flex: 1,
  },
  userInitialsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  },
  actionItem: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconOnly: {
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    flex: 1,
  },
  actionArrow: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: 8,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionSubtext: {
    fontSize: 12,
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
