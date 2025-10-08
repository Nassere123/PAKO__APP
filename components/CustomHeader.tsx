import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth, useProfilePhoto } from '../hooks';
import { COLORS } from '../constants';

interface CustomHeaderProps {
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ 
  onNotificationPress,
  onProfilePress 
}) => {
  const { user, isConnected } = useAuth();
  const { selectedImage, pickImage, isPicking } = useProfilePhoto();

  const getUserInitials = (): string => {
    if (!user) return 'U';
    const first = (user.firstName || '').trim();
    const last = (user.lastName || '').trim();
    const firstInitial = first ? first[0].toUpperCase() : '';
    const lastInitial = last ? last[0].toUpperCase() : '';
    return (firstInitial + lastInitial) || 'U';
  };

  const getAvatarColor = () => {
    if (!user) return '#E0E0E0';
    // Générer une couleur basée sur le nom de l'utilisateur
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const index = user.firstName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getUserDisplayName = () => {
    if (!user) return 'Utilisateur';
    return `${user.firstName} ${user.lastName}`;
  };

  return (
    <View style={styles.container}>
      {/* Icône de notification */}
      <TouchableOpacity 
        style={styles.notificationContainer}
        onPress={onNotificationPress}
      >
        <Image source={require('../assets/notification.png')} style={styles.notificationIcon} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  avatarInitials: {
    fontSize: 18,
    color: '#6C757D',
    fontWeight: '700',
  },
  avatarPhoto: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  // camera overlay removed
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary, // Orange comme dans l'image
    marginBottom: 2,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666666', // Gris foncé comme dans l'image
    fontWeight: '500',
  },
  notificationContainer: {
    padding: 8,
  },
  bellIcon: {
    fontSize: 24,
    color: COLORS.primary, // Orange pour l'icône
  },
  notificationIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.primary,
  },
});

export default CustomHeader;
