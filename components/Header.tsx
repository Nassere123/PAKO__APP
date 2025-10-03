import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth, useProfilePhoto } from '../hooks';
import { COLORS } from '../constants';

interface HeaderProps {
  title?: string;
  showUserInfo?: boolean;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'PAKO Client', 
  showUserInfo = true,
  onProfilePress,
  onNotificationPress 
}) => {
  const { user, isConnected } = useAuth();
  const { selectedImage } = useProfilePhoto();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getUserProfileIcon = () => {
    return '📷'; // Icône de photo de profil
  };

  const getUserDisplayName = () => {
    if (!user) return 'Utilisateur';
    return `${user.firstName} ${user.lastName}`;
  };

  return (
    <View style={styles.container}>
      {/* Barre de statut personnalisée */}
      <View style={styles.statusBar}>
        <View style={styles.statusLeft}>
          <Text style={styles.statusTime}>
            {new Date().toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        <View style={styles.statusRight}>
          <Text style={styles.statusText}>PAKO</Text>
        </View>
      </View>

      {/* En-tête principal */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            {showUserInfo && isConnected && (
              <Text style={styles.userName}>{getUserDisplayName()}</Text>
            )}
          </View>
          
          <View style={styles.headerRight}>
            {/* Bouton de notification */}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={onNotificationPress}
            >
              <Text style={styles.iconText}>🔔</Text>
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>

            {/* Avatar utilisateur */}
            {showUserInfo && (
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={onProfilePress}
              >
                <View style={styles.avatar}>
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage }} style={styles.avatarPhoto} />
                  ) : (
                    <Text style={styles.avatarIcon}>{getUserProfileIcon()}</Text>
                  )}
                </View>
                {isConnected && (
                  <View style={styles.onlineIndicator} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Titre de la page */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {isConnected && user && (
            <Text style={styles.subtitle}>
              Prêt à recevoir vos colis
            </Text>
          )}
        </View>

        {/* Barre de progression ou informations supplémentaires */}
        {isConnected && (
          <View style={styles.infoBar}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📦</Text>
              <Text style={styles.infoText}>0 colis en cours</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>🚚</Text>
              <Text style={styles.infoText}>Livraison gratuite</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>⭐</Text>
              <Text style={styles.infoText}>Service 5 étoiles</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingTop: 0, // Pour la barre de statut
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  statusLeft: {
    flex: 1,
  },
  statusTime: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statusRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    position: 'relative',
    padding: 8,
  },
  iconText: {
    fontSize: 20,
    color: COLORS.white,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarIcon: {
    fontSize: 20,
  },
  avatarPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 10,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
  },
});

export default Header;
