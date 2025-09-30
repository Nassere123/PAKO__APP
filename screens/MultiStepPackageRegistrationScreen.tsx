import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import PhoneInput from '../components/PhoneInput';

type MultiStepPackageRegistrationScreenProps = StackScreenProps<RootStackParamList, 'MultiStepPackageRegistration'>;

interface PackageData {
  packageCode: string;
  packageDescription: string;
  packageType: string;
  estimatedValue: string;
  specialInstructions: string;
}

interface OrderData {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  destinationStation: string;
  packages: PackageData[];
}

const MultiStepPackageRegistrationScreen: React.FC<MultiStepPackageRegistrationScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const packageTypes = [
    { value: 'alimentaire', label: '🍎 Colis alimentaire', description: 'Riz, huile, conserve, attiéké, garba séché, etc.' },
    { value: 'vestimentaire', label: '👕 Colis vestimentaire', description: 'Habits, chaussures, sacs.' },
    { value: 'electronique', label: '📱 Colis électronique', description: 'Téléphones, ordinateurs, accessoires.' },
    { value: 'documentaire', label: '📚 Colis documentaire', description: 'Dossiers, papiers administratifs, livres.' },
    { value: 'cosmetique', label: '💄 Colis cosmétique', description: 'Crèmes, parfums, maquillage.' },
    { value: 'piece_detachee', label: '⚙️ Colis pièce détachée', description: 'Pièces pour voiture, moto, ou machines.' },
    { value: 'cadeau', label: '🎁 Colis cadeau', description: 'Emballages cadeaux, paquets surprises.' },
    { value: 'mobilier', label: '🪑 Colis mobilier', description: 'Meubles, tables, chaises, etc.' },
    { value: 'autre', label: '📦 Autre', description: 'Autres types de colis non listés.' },
  ];

  const partnerStations = [
    { value: 'gare_nord', label: '🚉 Gare du Nord', description: 'Abidjan - Gare principale' },
    { value: 'gare_lyon', label: '🚉 Gare de Lyon', description: 'Abidjan - Plateau' },
    { value: 'gare_ouest', label: '🚉 Gare de l\'Ouest', description: 'Abidjan - Yopougon' },
    { value: 'gare_sud', label: '🚉 Gare du Sud', description: 'Abidjan - Marcory' },
    { value: 'gare_est', label: '🚉 Gare de l\'Est', description: 'Abidjan - Cocody' },
    { value: 'gare_bouake', label: '🚉 Gare de Bouaké', description: 'Bouaké - Centre ville' },
    { value: 'gare_san_pedro', label: '🚉 Gare de San-Pédro', description: 'San-Pédro - Port' },
    { value: 'gare_korhogo', label: '🚉 Gare de Korhogo', description: 'Korhogo - Nord' },
    { value: 'gare_man', label: '🚉 Gare de Man', description: 'Man - Ouest' },
    { value: 'gare_daloa', label: '🚉 Gare de Daloa', description: 'Daloa - Centre-Ouest' },
  ];
  
  const [orderData, setOrderData] = useState<OrderData>({
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    receiverName: '',
    receiverPhone: '',
    deliveryAddress: '',
    destinationStation: '',
    packages: [],
  });

  const [currentPackage, setCurrentPackage] = useState<PackageData>({
    packageCode: '',
    packageDescription: '',
    packageType: '',
    estimatedValue: '',
    specialInstructions: '',
  });

  const [showPackageTypeSelector, setShowPackageTypeSelector] = useState(false);
  const [showStationSelector, setShowStationSelector] = useState(false);

  const totalSteps = 3;

  const handleInputChange = (field: keyof PackageData, value: string) => {
    setCurrentPackage(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOrderInputChange = (field: keyof OrderData, value: string) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePackageTypeSelect = (type: string) => {
    setCurrentPackage(prev => ({
      ...prev,
      packageType: type
    }));
    setShowPackageTypeSelector(false);
  };

  const handleStationSelect = (station: string) => {
    setOrderData(prev => ({
      ...prev,
      destinationStation: station
    }));
    setShowStationSelector(false);
  };

  const handleAddPackage = () => {
    if (!currentPackage.packageCode || !currentPackage.packageDescription || !currentPackage.packageType) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setOrderData(prev => ({
      ...prev,
      packages: [...prev.packages, currentPackage]
    }));

    setCurrentPackage({
      packageCode: '',
      packageDescription: '',
      packageType: '',
      estimatedValue: '',
      specialInstructions: '',
    });
  };

  const handleRemovePackage = (index: number) => {
    setOrderData(prev => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index)
    }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!orderData.senderName || !orderData.senderPhone || !orderData.receiverName || !orderData.receiverPhone || !orderData.deliveryAddress || !orderData.destinationStation) {
          Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
          return false;
        }
        break;
      case 2:
        if (orderData.packages.length === 0) {
          Alert.alert('Erreur', 'Veuillez ajouter au moins un colis');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleGetCurrentLocation = async () => {
    // Ne déclencher la géolocalisation que si le champ est vide
    if (orderData.deliveryAddress.trim() !== '') {
      return;
    }

    try {
      // Demander les permissions de géolocalisation
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permission de géolocalisation',
            message: 'PAKO a besoin d\'accéder à votre position pour faciliter la livraison',
            buttonNeutral: 'Demander plus tard',
            buttonNegative: 'Annuler',
            buttonPositive: 'OK',
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission refusée', 'La géolocalisation est nécessaire pour obtenir votre adresse');
          return;
        }
      }

      // Simulation de géolocalisation (remplacer par une vraie API de géolocalisation)
      Alert.alert(
        'Géolocalisation',
        'Récupération de votre position...',
        [{ text: 'OK' }]
      );

      // Simulation d'une adresse récupérée
      setTimeout(() => {
        const mockAddress = "Cocody, Abidjan - Côte d'Ivoire";
        setOrderData(prev => ({
          ...prev,
          deliveryAddress: mockAddress
        }));
        
        Alert.alert(
          'Position détectée',
          `Adresse détectée : ${mockAddress}\n\nVoulez-vous utiliser cette adresse ?`,
          [
            { text: 'Non', style: 'cancel' },
            { 
              text: 'Oui', 
              onPress: () => {
                // L'adresse est déjà mise à jour
                Alert.alert('Succès', 'Adresse de livraison mise à jour !');
              }
            }
          ]
        );
      }, 2000);

    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'obtenir votre position. Veuillez saisir manuellement votre adresse.');
    }
  };

  const handleSubmit = () => {
    if (!validateCurrentStep()) return;
    
    setLoading(true);
    
    // Simulation d'enregistrement
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Succès',
        `${orderData.packages.length} colis enregistrés avec succès !\nGare : ${orderData.destinationStation}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    }, 2000);
  };

  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View key={index} style={styles.progressStep}>
          <View style={[
            styles.progressCircle,
            index + 1 <= currentStep && styles.progressCircleActive
          ]}>
            <Text style={[
              styles.progressText,
              index + 1 <= currentStep && styles.progressTextActive
            ]}>
              {index + 1}
            </Text>
          </View>
          {index < totalSteps - 1 && (
            <View style={[
              styles.progressLine,
              index + 1 < currentStep && styles.progressLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Étape 1/3 - Informations générales</Text>
      
      {/* Section Expéditeur */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>📤 Informations expéditeur</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nom de l'expéditeur *"
          value={orderData.senderName}
          onChangeText={(value) => handleOrderInputChange('senderName', value)}
        />
        
        <PhoneInput
          placeholder="Téléphone de l'expéditeur *"
          value={orderData.senderPhone}
          onChangeText={(value) => handleOrderInputChange('senderPhone', value)}
          style={styles.phoneInput}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Renseigner la provenance"
          value={orderData.senderAddress}
          onChangeText={(value) => handleOrderInputChange('senderAddress', value)}
        />
      </View>

      {/* Section Destinataire */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>📥 Informations destinataire</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nom du destinataire *"
          value={orderData.receiverName}
          onChangeText={(value) => handleOrderInputChange('receiverName', value)}
        />
        
        <PhoneInput
          placeholder="Téléphone du destinataire *"
          value={orderData.receiverPhone}
          onChangeText={(value) => handleOrderInputChange('receiverPhone', value)}
          style={styles.phoneInput}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Adresse de livraison *"
          value={orderData.deliveryAddress}
          onChangeText={(value) => handleOrderInputChange('deliveryAddress', value)}
          onFocus={handleGetCurrentLocation}
        />
      </View>

      {/* Sélecteur de gare */}
      <TouchableOpacity 
        style={styles.stationSelector}
        onPress={() => setShowStationSelector(!showStationSelector)}
      >
        <Text style={[
          styles.stationSelectorText,
          !orderData.destinationStation && styles.placeholderText
        ]}>
          {orderData.destinationStation 
            ? partnerStations.find(station => station.value === orderData.destinationStation)?.label 
            : 'Gare de destination *'
          }
        </Text>
        <Text style={styles.dropdownIcon}>
          {showStationSelector ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      
      {showStationSelector && (
        <View style={styles.stationOptions}>
          {partnerStations.map((station) => (
            <TouchableOpacity
              key={station.value}
              style={[
                styles.stationOption,
                orderData.destinationStation === station.value && styles.selectedStation
              ]}
              onPress={() => handleStationSelect(station.value)}
            >
              <Text style={styles.stationOptionLabel}>{station.label}</Text>
              <Text style={styles.stationOptionDescription}>{station.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Étape 2/3 - Ajouter un colis</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Code du colis * (ex: ABC123)"
        value={currentPackage.packageCode}
        onChangeText={(value) => handleInputChange('packageCode', value.toUpperCase())}
        autoCapitalize="characters"
      />
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description du colis *"
        value={currentPackage.packageDescription}
        onChangeText={(value) => handleInputChange('packageDescription', value)}
        multiline
        numberOfLines={3}
      />
      
      {/* Sélecteur de type de colis */}
      <TouchableOpacity 
        style={styles.packageTypeSelector}
        onPress={() => setShowPackageTypeSelector(!showPackageTypeSelector)}
      >
        <Text style={[
          styles.packageTypeSelectorText,
          !currentPackage.packageType && styles.placeholderText
        ]}>
          {currentPackage.packageType 
            ? packageTypes.find(type => type.value === currentPackage.packageType)?.label 
            : 'Nature du colis *'
          }
        </Text>
        <Text style={styles.dropdownIcon}>
          {showPackageTypeSelector ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      
      {showPackageTypeSelector && (
        <View style={styles.packageTypeOptions}>
          <ScrollView 
            style={styles.packageTypeScrollView}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {packageTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.packageTypeOption,
                  currentPackage.packageType === type.value && styles.selectedPackageType
                ]}
                onPress={() => handlePackageTypeSelect(type.value)}
              >
                <Text style={styles.packageTypeOptionLabel}>{type.label}</Text>
                <Text style={styles.packageTypeOptionDescription}>{type.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Valeur estimée (FCFA)"
        value={currentPackage.estimatedValue}
        onChangeText={(value) => handleInputChange('estimatedValue', value)}
        keyboardType="numeric"
      />
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Instructions spéciales"
        value={currentPackage.specialInstructions}
        onChangeText={(value) => handleInputChange('specialInstructions', value)}
        multiline
        numberOfLines={2}
      />
      
      <TouchableOpacity style={styles.addToCartButton} onPress={handleAddPackage}>
        <Text style={styles.addToCartButtonText}>Ajouter à la commande</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Étape 3/3 - Récapitulatif</Text>
      
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Informations générales</Text>
        <Text style={styles.summaryText}>Expéditeur: {orderData.senderName}</Text>
        <Text style={styles.summaryText}>Téléphone: {orderData.senderPhone}</Text>
        <Text style={styles.summaryText}>Destinataire: {orderData.receiverName}</Text>
        <Text style={styles.summaryText}>Téléphone: {orderData.receiverPhone}</Text>
        <Text style={styles.summaryText}>Adresse: {orderData.deliveryAddress}</Text>
        <Text style={styles.summaryText}>Gare: {partnerStations.find(station => station.value === orderData.destinationStation)?.label}</Text>
      </View>

      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Colis ({orderData.packages.length})</Text>
        {orderData.packages.map((pkg, index) => (
          <View key={index} style={styles.packageSummary}>
            <Text style={styles.packageSummaryText}>• {pkg.packageCode} - {pkg.packageDescription}</Text>
            <Text style={styles.packageSummaryText}>  Type: {packageTypes.find(type => type.value === pkg.packageType)?.label}</Text>
            {pkg.estimatedValue && (
              <Text style={styles.packageSummaryText}>  Valeur: {pkg.estimatedValue} FCFA</Text>
            )}
            <TouchableOpacity 
              style={styles.removePackageButton}
              onPress={() => handleRemovePackage(index)}
            >
              <Text style={styles.removePackageText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enregistrer un colis</Text>
        <View style={styles.headerSpacer} />
      </View>

      {renderProgressIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
              <Text style={styles.previousButtonText}>Précédent</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < totalSteps ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Suivant</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.nextButton, loading && styles.loadingButton]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.nextButtonText}>
                {loading ? 'Enregistrement...' : 'Valider la commande'}
              </Text>
            </TouchableOpacity>
          )}
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
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 60,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.lightGray,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleActive: {
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  progressTextActive: {
    color: COLORS.white,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
    paddingLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: COLORS.white,
  },
  phoneInput: {
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  stationSelector: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  stationSelectorText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
  },
  stationOptions: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    maxHeight: 200,
    overflow: 'hidden',
  },
  stationOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedStation: {
    backgroundColor: COLORS.primary + '20',
  },
  stationOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  stationOptionDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  packageTypeSelector: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  packageTypeSelectorText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  dropdownIcon: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  packageTypeOptions: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    maxHeight: 200,
    overflow: 'hidden',
  },
  packageTypeScrollView: {
    maxHeight: 150,
  },
  packageTypeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedPackageType: {
    backgroundColor: COLORS.primary + '20',
  },
  packageTypeOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  packageTypeOptionDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  addToCartButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  summarySection: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  packageSummary: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  packageSummaryText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  removePackageButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  removePackageText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  previousButton: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 10,
  },
  previousButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 10,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingButton: {
    opacity: 0.7,
  },
});

export default MultiStepPackageRegistrationScreen;