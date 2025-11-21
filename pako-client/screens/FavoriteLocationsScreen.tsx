import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FavoriteLocationsScreenProps } from '../types';
import { COLORS } from '../constants';
import { useTheme, useTranslation } from '../hooks';

interface Location {
  id: string;
  name: string;
  type: 'home' | 'work' | 'other';
  address: string;
}

/**
 * Écran de gestion des lieux de livraison favoris
 * Permet aux utilisateurs d'ajouter et gérer leurs adresses de livraison courantes
 */
const FavoriteLocationsScreen: React.FC<FavoriteLocationsScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  
  // État pour stocker les lieux favoris
  const [locations, setLocations] = useState<Location[]>([
    { id: '1', name: t('work'), type: 'work', address: '' },
  ]);

  // État pour gérer le mode édition
  const [isEditing, setIsEditing] = useState(false);
  
  // État pour le modal d'ajout de domicile
  const [showHomeModal, setShowHomeModal] = useState(false);
  const [homeAddress, setHomeAddress] = useState('');

  // État pour le modal d'ajout de lieu personnalisé
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', address: '' });

  /**
   * Bascule le mode édition
   */
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  /**
   * Gère le clic sur "Ajouter votre domicile"
   */
  const handleAddHome = () => {
    if (locations.some(loc => loc.type === 'home')) {
      Alert.alert(t('information'), t('already_home_added'));
    } else {
      setShowHomeModal(true);
    }
  };

  /**
   * Confirme l'ajout du domicile
   */
  const handleConfirmHome = () => {
    if (homeAddress.trim()) {
      const newHome: Location = {
        id: Date.now().toString(),
        name: t('home_location'),
        type: 'home',
        address: homeAddress.trim(),
      };
      setLocations([newHome, ...locations]);
      setHomeAddress('');
      setShowHomeModal(false);
      Alert.alert(t('success'), t('home_added_success'));
    } else {
      Alert.alert(t('error'), t('please_enter_address'));
    }
  };

  /**
   * Gère le clic sur un lieu existant
   */
  const handleLocationPress = (location: Location) => {
    if (isEditing) {
      // Mode édition : possibilité de supprimer
      Alert.alert(
        t('delete_location'),
        `${t('want_to_delete')} "${location.name}" ?`,
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('delete'),
            style: 'destructive',
            onPress: () => handleDeleteLocation(location.id),
          },
        ]
      );
    } else {
      // Mode normal : navigate to map or details
      Alert.alert(t('information'), `Adresse : ${location.address || 'Non définie'}`);
    }
  };

  /**
   * Supprime un lieu favori
   */
  const handleDeleteLocation = (id: string) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  /**
   * Ouvre le modal d'ajout de lieu personnalisé
   */
  const handleAddLocation = () => {
    setNewLocation({ name: '', address: '' });
    setShowAddModal(true);
  };

  /**
   * Confirme l'ajout d'un lieu personnalisé
   */
  const handleConfirmAdd = () => {
    if (newLocation.name.trim() && newLocation.address.trim()) {
      const customLocation: Location = {
        id: Date.now().toString(),
        name: newLocation.name.trim(),
        type: 'other',
        address: newLocation.address.trim(),
      };
      setLocations([...locations, customLocation]);
      setShowAddModal(false);
      Alert.alert(t('success'), t('location_added_success'));
    } else {
      Alert.alert(t('error'), t('please_fill_all_fields'));
    }
  };

  /**
   * Retourne l'icône appropriée selon le type de lieu
   */
  const getLocationIcon = (type: 'home' | 'work' | 'other') => {
    switch (type) {
      case 'home':
        return 'home-outline';
      case 'work':
        return 'briefcase-outline';
      default:
        return 'location-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('favorite_locations')}</Text>
        <TouchableOpacity onPress={handleToggleEdit} style={styles.editButton}>
          <Text style={[styles.editButtonText, { color: colors.textPrimary }]}>{isEditing ? t('terminer') : t('modifer_button')}</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu scrollable */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Liste des lieux */}
        {locations.map((location) => {
          // Ne pas afficher le domicile s'il n'a pas encore été ajouté
          if (location.type === 'home' && !location.address) {
            return null;
          }
          
          return (
            <TouchableOpacity
              key={location.id}
              style={[styles.locationItem, { backgroundColor: colors.white, shadowColor: colors.shadow }]}
              onPress={() => handleLocationPress(location)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={getLocationIcon(location.type)}
                size={24}
                color={COLORS.primary}
                style={styles.locationIcon}
              />
              <View style={styles.locationInfo}>
                <Text style={[styles.locationName, { color: colors.textPrimary }]}>{location.name}</Text>
                {location.address ? (
                  <Text style={[styles.locationAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                    {location.address}
                  </Text>
                ) : null}
              </View>
              <Ionicons
                name={isEditing && location.type !== 'work' ? 'trash-outline' : 'chevron-forward'}
                size={24}
                color={isEditing && location.type !== 'work' ? COLORS.danger : colors.textSecondary}
              />
            </TouchableOpacity>
          );
        })}

        {/* Bouton ajouter domicile si pas encore ajouté */}
        {!locations.some(loc => loc.type === 'home' && loc.address) && (
          <TouchableOpacity
            style={[styles.locationItem, { backgroundColor: colors.white, shadowColor: colors.shadow }]}
            onPress={handleAddHome}
            activeOpacity={0.7}
          >
            <Ionicons name="home-outline" size={24} color={COLORS.primary} style={styles.locationIcon} />
            <Text style={[styles.locationName, { color: colors.textPrimary }]}>{t('add_home')}</Text>
            <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Bouton Ajouter un lieu (en bas) */}
      <View style={[styles.bottomContainer, { backgroundColor: colors.white, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.lightGray }]}
          onPress={handleAddLocation}
          activeOpacity={0.7}
        >
          <Text style={[styles.addButtonText, { color: colors.textPrimary }]}>{t('add_location')}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal d'ajout de domicile */}
      <Modal
        visible={showHomeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHomeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('add_home')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder={t('enter_home_address')}
              placeholderTextColor={colors.textSecondary}
              value={homeAddress}
              onChangeText={setHomeAddress}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowHomeModal(false)}
              >
                <Text style={[styles.modalButtonTextCancel, { color: colors.textSecondary }]}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleConfirmHome}
              >
                <Text style={styles.modalButtonTextConfirm}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal d'ajout de lieu personnalisé */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('add_location')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder={t('nom_du_lieu')}
              placeholderTextColor={colors.textSecondary}
              value={newLocation.name}
              onChangeText={(text) => setNewLocation({ ...newLocation, name: text })}
            />
            <TextInput
              style={[styles.input, styles.inputMultiline, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder={t('adresse')}
              placeholderTextColor={colors.textSecondary}
              value={newLocation.address}
              onChangeText={(text) => setNewLocation({ ...newLocation, address: text })}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={[styles.modalButtonTextCancel, { color: colors.textSecondary }]}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleConfirmAdd}
              >
                <Text style={styles.modalButtonTextConfirm}>{t('ajouter')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  locationItem: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  locationIcon: {
    marginRight: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
  },
  locationAddress: {
    fontSize: 12,
    marginTop: 4,
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  addButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.primary,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default FavoriteLocationsScreen;

