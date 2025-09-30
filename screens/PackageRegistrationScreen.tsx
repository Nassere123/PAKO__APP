import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { COLORS } from '../constants';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type PackageRegistrationScreenProps = StackScreenProps<RootStackParamList, 'PackageRegistration'>;

const PackageRegistrationScreen: React.FC<PackageRegistrationScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    receiverName: '',
    receiverPhone: '',
    deliveryAddress: '',
    packageDescription: '',
    destinationStation: '',
    estimatedValue: '',
    packagePhotoOpen: '',
    packagePhotoClosed: '',
    specialInstructions: '',
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.senderName || !formData.receiverName || !formData.packageDescription || !formData.deliveryAddress) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation des photos obligatoires
    if (!formData.packagePhotoOpen || !formData.packagePhotoClosed) {
      Alert.alert('Erreur', 'Les photos du colis (ouvert et fermé) sont obligatoires pour la sécurité');
      return;
    }

    setLoading(true);
    
    // Simulation d'enregistrement
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Succès',
        'Votre colis a été enregistré avec succès !\nNuméro de suivi : #PAKO-2024-001',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('PackageTracking', { packageId: '#PAKO-2024-001' })
          }
        ]
      );
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image 
            source={require('../assets/8bedea66-f318-404b-8ffd-73beacaa06c5.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>PAKO Client</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Enregistrer un colis</Text>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Informations de l'expéditeur</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nom de l'expéditeur *"
            value={formData.senderName}
            onChangeText={(value) => handleInputChange('senderName', value)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Téléphone expéditeur"
            value={formData.senderPhone}
            onChangeText={(value) => handleInputChange('senderPhone', value)}
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Adresse de l'expéditeur"
            value={formData.senderAddress}
            onChangeText={(value) => handleInputChange('senderAddress', value)}
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Vos informations</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Votre nom complet *"
            value={formData.receiverName}
            onChangeText={(value) => handleInputChange('receiverName', value)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Votre téléphone"
            value={formData.receiverPhone}
            onChangeText={(value) => handleInputChange('receiverPhone', value)}
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Votre adresse complète de livraison *"
            value={formData.deliveryAddress}
            onChangeText={(value) => handleInputChange('deliveryAddress', value)}
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Détails du colis</Text>
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description du colis *"
            value={formData.packageDescription}
            onChangeText={(value) => handleInputChange('packageDescription', value)}
            multiline
            numberOfLines={3}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Gare de destination *"
            value={formData.destinationStation}
            onChangeText={(value) => handleInputChange('destinationStation', value)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Valeur estimée (FCFA)"
            value={formData.estimatedValue}
            onChangeText={(value) => handleInputChange('estimatedValue', value)}
            keyboardType="numeric"
          />
          
          {/* Section photos du colis - OBLIGATOIRES */}
          <View style={styles.photoSection}>
            <Text style={styles.photoLabel}>Photos du colis * (obligatoires pour la sécurité)</Text>
            <Text style={styles.photoSubtext}>
              📋 Prenez 2 photos : une du colis ouvert (contenu visible) et une du colis fermé
            </Text>
            
            <View style={styles.photoButtonsContainer}>
              <TouchableOpacity style={[styles.photoButton, styles.photoButtonHalf]}>
                <Text style={styles.photoIcon}>📦</Text>
                <Text style={styles.photoText}>Colis ouvert</Text>
                <Text style={styles.photoSubtext}>Contenu visible</Text>
                {formData.packagePhotoOpen && (
                  <View style={styles.photoStatus}>
                    <Text style={styles.photoStatusText}>✓ Ajoutée</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.photoButton, styles.photoButtonHalf]}>
                <Text style={styles.photoIcon}>📦</Text>
                <Text style={styles.photoText}>Colis fermé</Text>
                <Text style={styles.photoSubtext}>Emballage final</Text>
                {formData.packagePhotoClosed && (
                  <View style={styles.photoStatus}>
                    <Text style={styles.photoStatusText}>✓ Ajoutée</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.securityNotice}>
              <Text style={styles.securityIcon}>⚠️</Text>
              <Text style={styles.securityText}>
                Ces photos sont obligatoires pour vérifier le contenu et éviter le transport de produits interdits
              </Text>
            </View>
          </View>
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Instructions spéciales"
            value={formData.specialInstructions}
            onChangeText={(value) => handleInputChange('specialInstructions', value)}
            multiline
            numberOfLines={2}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Enregistrement...' : 'Enregistrer le colis'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: '#2C3E50',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  logoImage: {
    width: 80,
    height: 40,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: COLORS.textSecondary,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  photoSection: {
    marginBottom: 16,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  photoSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 16,
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  photoButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    minHeight: 100,
  },
  photoButtonHalf: {
    width: '48%',
  },
  photoIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  photoText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  photoStatus: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    padding: 4,
    marginTop: 4,
  },
  photoStatusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  securityNotice: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
});

export default PackageRegistrationScreen;
