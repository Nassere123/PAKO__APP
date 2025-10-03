import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth, useProfilePhoto } from '../hooks';
import { COLORS } from '../constants';

interface UserHeaderProps {
  title?: string;
  showUserInfo?: boolean;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  userType?: 'customer' | 'admin' | 'driver';
}

const UserHeader: React.FC<UserHeaderProps> = ({ 
  title = 'PAKO Client', 
  showUserInfo = true,
  onProfilePress,
  onNotificationPress,
  userType = 'customer'
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

  const getHeaderColor = () => {
    switch (userType) {
      case 'admin':
        return '#8B4513'; // Marron pour admin
      case 'driver':
        return '#228B22'; // Vert pour driver
      default:
        return COLORS.primary; // Orange pour customer
    }
  };

  const getHeaderIcon = () => {
    switch (userType) {
      case 'admin':
        return '👑';
      case 'driver':
        return '🚚';
      default:
        return '📦';
    }
  };

  const getStatusText = () => {
    switch (userType) {
      case 'admin':
        return 'Panel d\'administration';
      case 'driver':
        return 'Mode chauffeur actif';
      default:
        return 'Prêt à recevoir vos colis';
    }
  };

  const getInfoItems = () => {
    switch (userType) {
      case 'admin':
        return [
          { icon: '👥', text: 'Gestion utilisateurs' },
          { icon: '📊', text: 'Statistiques' },
          { icon: '⚙️', text: 'Configuration' }
        ];
      case 'driver':
        return [
          { icon: '🚚', text: '0 livraisons' },
          { icon: '📍', text: 'En ligne' },
          { icon: '⭐', text: '4.8/5' }
        ];
      default:
        return [
          { icon: '📦', text: '0 colis en cours' },
          { icon: '🚚', text: 'Livraison gratuite' },
          { icon: '⭐', text: 'Service 5 étoiles' }
        ];
    }
  };

  const headerColor = getHeaderColor();

  return (
    <View style={[styles.container, { backgroundColor: headerColor }]}>
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
          <Text style={styles.userTypeIcon}>{getHeaderIcon()}</Text>
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
            {userType !== 'customer' && (
              <View style={styles.userTypeBadge}>
                <Text style={styles.userTypeText}>
                  {userType === 'admin' ? 'Administrateur' : 'Chauffeur'}
                </Text>
              </View>
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
                <Text style={styles.badgeText}>
                  {userType === 'admin' ? '5' : userType === 'driver' ? '2' : '3'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Avatar utilisateur */}
            {showUserInfo && (
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={onProfilePress}
              >
                <View style={[styles.avatar, { borderColor: headerColor === COLORS.primary ? COLORS.white : 'rgba(255,255,255,0.3)' }]}>
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage }} style={styles.avatarPhoto} />
                  ) : (
                    <Text style={styles.avatarIcon}>{getUserProfileIcon()}</Text>
                  )}
                </View>
                {isConnected && (
                  <View style={[styles.onlineIndicator, { backgroundColor: userType === 'driver' ? '#FFD700' : '#4CAF50' }]} />
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
              {getStatusText()}
            </Text>
          )}
        </View>

        {/* Barre d'informations spécifique au type d'utilisateur */}
        {isConnected && (
          <View style={styles.infoBar}>
            {getInfoItems().map((item, index) => (
              <View key={index} style={styles.infoItem}>
                <Text style={styles.infoIcon}>{item.icon}</Text>
                <Text style={styles.infoText}>{item.text}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingTop: 0,
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  userTypeIcon: {
    fontSize: 16,
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
    marginBottom: 4,
  },
  userTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  userTypeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
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

export default UserHeader;
