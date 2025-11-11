import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SettingsScreenProps } from '../types';
import { COLORS } from '../constants';
import { useAuth, useTheme, useTranslation } from '../hooks';
import { LogoutConfirmModal, LanguageModal } from '../components';

/**
 * Écran de paramètres de l'application
 */
const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { t, i18n } = useTranslation();
  
  // États pour les toggles
  const [deliveryNotifications, setDeliveryNotifications] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Obtenir le nom de la langue actuelle
  const getCurrentLanguageName = () => {
    const languages: { [key: string]: string } = {
      fr: 'Français',
      en: 'English',
      de: 'Deutsch',
      es: 'Español',
    };
    return languages[i18n.language] || 'Français';
  };

  /**
   * Affiche le modal de confirmation de déconnexion
   */
  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  /**
   * Confirme et exécute la déconnexion de l'utilisateur
   */
  const handleLogoutConfirm = async () => {
    try {
      console.log('\n🎯 ===== DÉCONNEXION DEPUIS PARAMÈTRES =====');
      console.log('👤 Utilisateur:', user ? `${user.firstName} ${user.lastName}` : 'Aucun');
      console.log('🆔 ID utilisateur:', user?.id || 'Non défini');
      
      setShowLogoutModal(false);
      
      console.log('📞 Appel de la fonction logout()...');
      await logout();
      console.log('✅ Fonction logout() terminée');
      
      console.log('🧭 Navigation vers écran Auth...');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
      console.log('✅ Navigation terminée');
      
      console.log('✅ DÉCONNEXION PARAMÈTRES TERMINÉE');
      console.log('======================================\n');
      
    } catch (error) {
      console.error('\n❌ ERREUR DÉCONNEXION PARAMÈTRES:', error);
      console.error('Stack trace:', error);
      
      console.log('🚨 Navigation d\'urgence vers Auth...');
      try {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      } catch (navError) {
        console.error('❌ Erreur navigation urgence:', navError);
      }
    }
  };

  /**
   * Annule la déconnexion et ferme le modal
   */
  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </ TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('settings')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Contenu scrollable */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section Informations du compte */}
        <View style={styles.section}>
          <View style={[styles.sectionContent, { backgroundColor: colors.white }]}>
            <TouchableOpacity style={[styles.itemRow, { borderBottomColor: colors.border }]}>
              <View style={styles.itemContent}>
                <View style={styles.itemMain}>
                  <Text style={[styles.itemPrimaryText, { color: colors.textPrimary }]}>{user?.firstName || ''}</Text>
                  <Text style={[styles.itemSecondaryText, { color: colors.textSecondary }]}>{t('name')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.itemRow, { borderBottomColor: colors.border }]}>
              <View style={styles.itemContent}>
                <View style={styles.itemMain}>
                  <Text style={[styles.itemPrimaryText, { color: colors.textPrimary }]}>{user?.phone || ''}</Text>
                  <Text style={[styles.itemSecondaryText, { color: colors.textSecondary }]}>{t('phone')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.itemRow, { borderBottomColor: colors.border }]}>
              <View style={styles.itemContent}>
                <View style={styles.itemMain}>
                  <Text style={[styles.itemPrimaryText, { color: colors.textPrimary }]}>{t('add_address')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Thème et carte */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('theme_and_map')}</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.white }]}>
            <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
              <View style={styles.itemContent}>
                <View style={styles.itemMain}>
                  <Text style={[styles.itemPrimaryText, { color: colors.textPrimary }]}>{t('dark_mode')}</Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#D3D3D3', true: COLORS.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section Langue */}
        <View style={styles.section}>
          <View style={[styles.sectionContent, { backgroundColor: colors.white }]}>
            <TouchableOpacity 
              style={[styles.itemRow, { borderBottomColor: colors.border }]}
              onPress={() => setShowLanguageModal(true)}
            >
              <View style={styles.itemContent}>
                <View style={styles.itemMain}>
                  <Text style={[styles.itemPrimaryText, { color: colors.textPrimary }]}>{t('language')}</Text>
                </View>
                <Text style={[styles.itemStatus, { color: colors.textSecondary }]}>{getCurrentLanguageName()}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('notifications')}</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.white }]}>
            <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
              <View style={styles.itemContent}>
                <View style={styles.itemMain}>
                  <Text style={[styles.itemPrimaryText, { color: colors.textPrimary }]}>{t('delivery_notifications')}</Text>
                  <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>
                    {t('delivery_notifications_desc')}
                  </Text>
                </View>
              </View>
              <Switch
                value={deliveryNotifications}
                onValueChange={setDeliveryNotifications}
                trackColor={{ false: '#D3D3D3', true: COLORS.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Section Déconnexion */}
        <View style={styles.section}>
          <View style={[styles.sectionContent, { backgroundColor: colors.white }]}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogoutPress}
            >
              <Text style={[styles.logoutText, { color: COLORS.danger }]}>{t('logout')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de confirmation de déconnexion */}
      <LogoutConfirmModal
        visible={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        userName={user ? `${user.firstName} ${user.lastName}` : undefined}
      />

      {/* Modal de sélection de langue */}
      <LanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemMain: {
    flex: 1,
  },
  itemPrimaryText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemSecondaryText: {
    fontSize: 14,
  },
  itemDescription: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  itemStatus: {
    fontSize: 14,
    marginRight: 8,
  },
  logoutButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SettingsScreen;

