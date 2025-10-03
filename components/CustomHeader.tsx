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

  const getUserProfileIcon = () => {
    return '📷'; // Icône de photo de profil
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
      {/* Avatar utilisateur */}
      <TouchableOpacity 
        style={styles.avatarContainer}
        onPress={pickImage}
        disabled={isPicking}
      >
        <View style={styles.avatar}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.avatarPhoto} />
          ) : (
            <Text style={styles.avatarIcon}>{getUserProfileIcon()}</Text>
          )}
          <View style={styles.cameraIconOverlay}>
            <Text style={styles.cameraIcon}>{isPicking ? '...' : '+'}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Informations utilisateur */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{getUserDisplayName()}</Text>
        <Text style={styles.welcomeText}>Bonjour</Text>
      </View>

      {/* Icône de notification */}
      <TouchableOpacity 
        style={styles.notificationContainer}
        onPress={onNotificationPress}
      >
        <Text style={styles.bellIcon}>🔔</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 40, // Ajouter plus d'espace en haut
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  avatarIcon: {
    fontSize: 18,
    color: '#6C757D',
  },
  avatarPhoto: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cameraIcon: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: 'bold',
  },
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
    marginLeft: 16,
    padding: 8,
  },
  bellIcon: {
    fontSize: 24,
    color: COLORS.primary, // Orange pour l'icône
  },
});

export default CustomHeader;
