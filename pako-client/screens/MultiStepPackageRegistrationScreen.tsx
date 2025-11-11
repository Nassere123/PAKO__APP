import React, { useState, useEffect } from 'react';
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
  Modal,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import PhoneInput from '../components/PhoneInput';
import OSMSearchMap from '../components/OSMSearchMap';
import { PricingCalculator, PricingResult } from '../utils/pricingCalculator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderService } from '../services/orderService';
import { useAuth, useTranslation } from '../hooks';

type MultiStepPackageRegistrationScreenProps = StackScreenProps<RootStackParamList, 'MultiStepPackageRegistration'>;

interface PackageData {
  packageCode: string;
  packageDescription: string;
  packageType: string;
  specialInstructions: string;
}

interface OrderData {
  senderName: string;
  senderPhone: string;
  senderCity: string;
  senderDistrict: string;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  destinationStation: string;
  stationLatitude?: number;
  stationLongitude?: number;
  distanceKm?: number;
  deliveryType?: 'standard' | 'express';
  paymentMethod?: 'cash' | 'wave' | 'orange';
  packageCode?: string;
  packages: PackageData[];
  selectedRecipientPhone: string;
  selectedRecipientName: string;
  isSelectingSenderPhone?: boolean;
}

const MultiStepPackageRegistrationScreen: React.FC<MultiStepPackageRegistrationScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [osmStations, setOsmStations] = useState<any[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [packageCount, setPackageCount] = useState(0); // Compteur de colis

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return orderData.destinationStation && orderData.deliveryAddress && orderData.senderCity && 
               (orderData.selectedRecipientPhone || orderData.selectedRecipientName === 'Moi') && 
               orderData.packageCode && orderData.senderPhone;
      case 2:
        return orderData.packages.length > 0;
      default:
        return true;
    }
  };
  
  const removePackage = (index: number) => {
    // Décrémenter le compteur de colis
    setPackageCount(prev => Math.max(0, prev - 1));
    
    setOrderData(prev => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index)
    }));
  };
  
  const packageTypes = [
    { value: 'alimentaire', label: 'Colis alimentaire', description: 'Riz, huile, conserve, attiéké, garba séché, etc.' },
    { value: 'vestimentaire', label: 'Colis vestimentaire', description: 'Habits, chaussures, sacs.' },
    { value: 'electronique', label: 'Colis électronique', description: 'Téléphones, ordinateurs, accessoires.' },
    { value: 'documentaire', label: 'Colis documentaire', description: 'Dossiers, papiers administratifs, livres.' },
    { value: 'cosmetique', label: 'Colis cosmétique', description: 'Crèmes, parfums, maquillage.' },
    { value: 'piece_detachee', label: 'Colis pièce détachée', description: 'Pièces pour voiture, moto, ou machines.' },
    { value: 'cadeau', label: 'Colis cadeau', description: 'Emballages cadeaux, paquets surprises.' },
    { value: 'mobilier', label: 'Colis mobilier', description: 'Meubles, tables, chaises, etc.' },
    { value: 'autre', label: 'Autre', description: 'Autres types de colis non listés.' },
  ];

  const partnerStations = [
    { value: 'sbta_adjame', label: 'SBTA - Adjame', description: 'Adjame - Gare principale interurbaine' },
    { value: 'utb_cocody', label: 'UTB - Cocody', description: 'Cocody - Gare UTB' },
    { value: 'alino_yopougon', label: 'Alino - Yopougon', description: 'Yopougon - Gare Alino' },
    { value: 'sbta_marcory', label: 'SBTA - Marcory', description: 'Marcory - Gare SBTA' },
    { value: 'utb_plateau', label: 'UTB - Plateau', description: 'Plateau - Gare UTB' },
    { value: 'alino_abobo', label: 'Alino - Abobo', description: 'Abobo - Gare Alino' },
    { value: 'sbta_koumassi', label: 'SBTA - Koumassi', description: 'Koumassi - Gare SBTA' },
    { value: 'utb_bingerville', label: 'UTB - Bingerville', description: 'Bingerville - Gare UTB' },
    { value: 'alino_anyama', label: 'Alino - Anyama', description: 'Anyama - Gare Alino' },
    { value: 'sbta_songon', label: 'SBTA - Songon', description: 'Songon - Gare SBTA' },
    { value: 'avs_adjame', label: 'AVS - Adjame', description: 'Adjame - Gare AVS' },
    { value: 'staf_koumassi', label: 'STAF - Koumassi', description: 'Koumassi - Gare STAF' },
    { value: 'stc_intercity', label: 'STC Intercity', description: 'Abidjan - Gare STC Intercity' },
    { value: 'bassam_treichville', label: 'Bassam - Treichville', description: 'Treichville - Gare de Bassam' },
    { value: 'guinee_adjame', label: 'Guinée - Adjame', description: 'Adjame - Gare de Guinée' },
    { value: 'internationale_abobo', label: 'Internationale - Abobo', description: 'Abobo - Gare Internationale' },
    { value: 'lagunaire_koumassi', label: 'Lagunaire - Koumassi', description: 'Koumassi - Gare Lagunaire' },
    { value: 'nord_adjame', label: 'Nord - Adjame', description: 'Adjame - Gare Nord' },
    { value: 'st_adjame', label: 'ST - Adjame', description: 'Adjame - Gare ST' },
    { value: 'sotra_marcory', label: 'SOTRA - Marcory', description: 'Marcory - Gare SOTRA' },
  ];

  // Gares d'Abidjan pour le sélecteur de gare
  const abidjanStations = [
    { value: 'sbta_adjame', label: 'SBTA - Adjame', description: 'Adjame - Gare principale interurbaine', lat: 5.3536, lon: -4.0206 },
    { value: 'utb_cocody', label: 'UTB - Cocody', description: 'Cocody - Gare UTB', lat: 5.3583, lon: -3.9872 },
    { value: 'alino_yopougon', label: 'Alino - Yopougon', description: 'Yopougon - Gare Alino', lat: 5.3364, lon: -4.0889 },
    { value: 'sbta_marcory', label: 'SBTA - Marcory', description: 'Marcory - Gare SBTA', lat: 5.3017, lon: -4.0094 },
    { value: 'utb_plateau', label: 'UTB - Plateau', description: 'Plateau - Gare UTB', lat: 5.3267, lon: -4.0305 },
    { value: 'alino_abobo', label: 'Alino - Abobo', description: 'Abobo - Gare Alino', lat: 5.4247, lon: -4.0150 },
    { value: 'sbta_koumassi', label: 'SBTA - Koumassi', description: 'Koumassi - Gare SBTA', lat: 5.3017, lon: -4.0094 },
    { value: 'utb_bingerville', label: 'UTB - Bingerville', description: 'Bingerville - Gare UTB', lat: 5.3556, lon: -3.8944 },
    { value: 'alino_anyama', label: 'Alino - Anyama', description: 'Anyama - Gare Alino', lat: 5.4953, lon: -4.0517 },
    { value: 'sbta_songon', label: 'SBTA - Songon', description: 'Songon - Gare SBTA', lat: 5.2969, lon: -4.2644 },
    { value: 'utb_attecoube', label: 'UTB - Attécoubé', description: 'Attécoubé - Gare UTB', lat: 5.3364, lon: -4.0889 },
    { value: 'alino_port_bouet', label: 'Alino - Port-Bouët', description: 'Port-Bouët - Gare Alino', lat: 5.2547, lon: -3.9242 },
    { value: 'avs_adjame', label: 'AVS - Adjame', description: 'Adjame - Gare AVS', lat: 5.3536, lon: -4.0206 },
    { value: 'staf_koumassi', label: 'STAF - Koumassi', description: 'Koumassi - Gare STAF', lat: 5.3017, lon: -4.0094 },
    { value: 'stc_intercity', label: 'STC Intercity', description: 'Abidjan - Gare STC Intercity', lat: 5.3267, lon: -4.0305 },
    { value: 'bassam_treichville', label: 'Bassam - Treichville', description: 'Treichville - Gare de Bassam', lat: 5.3017, lon: -4.0094 },
    { value: 'guinee_adjame', label: 'Guinée - Adjame', description: 'Adjame - Gare de Guinée', lat: 5.3536, lon: -4.0206 },
    { value: 'internationale_abobo', label: 'Internationale - Abobo', description: 'Abobo - Gare Internationale', lat: 5.4247, lon: -4.0150 },
    { value: 'lagunaire_koumassi', label: 'Lagunaire - Koumassi', description: 'Koumassi - Gare Lagunaire', lat: 5.3017, lon: -4.0094 },
    { value: 'nord_adjame', label: 'Nord - Adjame', description: 'Adjame - Gare Nord', lat: 5.3536, lon: -4.0206 },
    { value: 'st_adjame', label: 'ST - Adjame', description: 'Adjame - Gare ST', lat: 5.3536, lon: -4.0206 },
    { value: 'sotra_marcory', label: 'SOTRA - Marcory', description: 'Marcory - Gare SOTRA', lat: 5.3017, lon: -4.0094 },
  ];

  // Fonction pour récupérer les grandes gares routières (lignes nationales) depuis OpenStreetMap
  const fetchStationsFromOSM = async () => {
    setLoadingStations(true);
    try {
      // Requête Overpass API pour les grandes gares routières de transport interurbain en Côte d'Ivoire
      const overpassQuery = `
        [out:json][timeout:25];
        area["ISO3166-1"="CI"][admin_level=2];
        (
          node["amenity"="bus_station"]["bus"="yes"](area);
          node["amenity"="bus_station"]["route"="bus"](area);
          way["amenity"="bus_station"]["bus"="yes"](area);
          way["amenity"="bus_station"]["route"="bus"](area);
        );
        out center body;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Vérifier si la réponse est OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseText = await response.text();
      
      // Vérifier si la réponse contient du HTML (erreur)
      if (responseText.trim().startsWith('<')) {
        throw new Error('API returned HTML instead of JSON. Possible server error.');
      }
      
      const data = JSON.parse(responseText);
      
      // Liste des mots-clés pour identifier les grandes gares de transport national
      const nationalStationKeywords = [
        'utb', 'stb', 'sbta', 'sotra',
        'gare routière', 'gare de', 'terminal',
        'transport', 'voyageur', 'interurbain'
      ];
      
      // Transformer les données OSM en format utilisable
      const stations = data.elements
        .map((element: any) => {
          const lat = element.lat || element.center?.lat;
          const lon = element.lon || element.center?.lon;
          const city = element.tags?.['addr:city'] || element.tags?.['addr:suburb'] || element.tags?.['addr:district'] || 'Ville';
          let name = element.tags?.name || 'Gare sans nom';
          
          // Nettoyer le nom pour enlever les préfixes "Ville - " ou "Commune - "
          name = name.replace(/^(Ville|Commune|District)\s*-\s*/i, '').trim();
          
          return {
            value: `osm_${element.id}`,
            label: name,
            description: `${city} - Transport interurbain`,
            lat: lat,
            lon: lon,
            type: element.tags?.amenity,
            operator: element.tags?.operator || '',
            city: city,
            originalName: name,
          };
        })
        .filter((station: any) => {
          // Filtrer pour garder uniquement les grandes gares de transport national
          if (station.originalName === 'Gare sans nom') return false;
          
          const name = station.originalName.toLowerCase();
          const operator = station.operator.toLowerCase();
          
          // Vérifier si le nom ou l'opérateur contient des mots-clés de gares nationales
          return nationalStationKeywords.some(keyword => 
            name.includes(keyword) || operator.includes(keyword)
          );
        });
      
      setOsmStations(stations);
    } catch (error) {
      console.error('Erreur lors de la récupération des gares:', error);
      
      // Fallback avec des gares statiques en cas d'échec de l'API
      const fallbackStations = [
        { value: 'sbta_adjame', label: 'SBTA - Adjame', description: 'Adjame - Transport interurbain', lat: 5.3536, lon: -4.0206 },
        { value: 'utb_cocody', label: 'UTB - Cocody', description: 'Cocody - Transport interurbain', lat: 5.3583, lon: -3.9872 },
        { value: 'alino_yopougon', label: 'Alino - Yopougon', description: 'Yopougon - Transport interurbain', lat: 5.3364, lon: -4.0889 },
        { value: 'sbta_marcory', label: 'SBTA - Marcory', description: 'Marcory - Transport interurbain', lat: 5.3017, lon: -4.0094 },
        { value: 'utb_plateau', label: 'UTB - Plateau', description: 'Plateau - Transport interurbain', lat: 5.3267, lon: -4.0305 },
        { value: 'alino_abobo', label: 'Alino - Abobo', description: 'Abobo - Transport interurbain', lat: 5.4247, lon: -4.0150 },
        { value: 'sbta_koumassi', label: 'SBTA - Koumassi', description: 'Koumassi - Transport interurbain', lat: 5.3017, lon: -4.0094 },
        { value: 'utb_bingerville', label: 'UTB - Bingerville', description: 'Bingerville - Transport interurbain', lat: 5.3556, lon: -3.8944 },
        { value: 'alino_anyama', label: 'Alino - Anyama', description: 'Anyama - Transport interurbain', lat: 5.4953, lon: -4.0517 },
        { value: 'sbta_songon', label: 'SBTA - Songon', description: 'Songon - Transport interurbain', lat: 5.2969, lon: -4.2644 },
        { value: 'bassam_gare', label: 'Gare de Bassam', description: 'Bassam - Transport interurbain', lat: 5.345317, lon: -4.024429 },
        { value: 'grand_marche', label: 'Gare routière du grand marché', description: 'Abidjan - Transport interurbain', lat: 5.345317, lon: -4.024429 },
      ];
      
      setOsmStations(fallbackStations);
      console.log('Utilisation des gares de fallback');
    } finally {
      setLoadingStations(false);
    }
  };

  // Charger les gares au montage du composant
  useEffect(() => {
    fetchStationsFromOSM();
  }, []);

  const coteIvoireCities = [
    { value: 'abidjan', label: 'Abidjan', description: 'District autonome' },
    { value: 'bouake', label: 'Bouaké', description: 'Vallée du Bandama' },
    { value: 'daloa', label: 'Daloa', description: 'Haut-Sassandra' },
    { value: 'san_pedro', label: 'San-Pédro', description: 'Bas-Sassandra' },
    { value: 'korhogo', label: 'Korhogo', description: 'Poro' },
    { value: 'man', label: 'Man', description: 'Tonkpi' },
    { value: 'gagnoa', label: 'Gagnoa', description: 'Gôh' },
    { value: 'yamoussoukro', label: 'Yamoussoukro', description: 'Yamoussoukro' },
    { value: 'divo', label: 'Divo', description: 'Lôh-Djiboua' },
    { value: 'anyama', label: 'Anyama', description: 'Lagunes' },
    { value: 'abengourou', label: 'Abengourou', description: 'Indénié-Djuablin' },
    { value: 'bondoukou', label: 'Bondoukou', description: 'Gontougo' },
    { value: 'odienne', label: 'Odienné', description: 'Kabadougou' },
    { value: 'seguela', label: 'Séguéla', description: 'Worodougou' },
    { value: 'touba', label: 'Touba', description: 'Bafing' },
    { value: 'bangolo', label: 'Bangolo', description: 'Guémon' },
    { value: 'duékoué', label: 'Duékoué', description: 'Cavally' },
    { value: 'guiglo', label: 'Guiglo', description: 'Cavally' },
    { value: 'tabou', label: 'Tabou', description: 'Nawa' },
    { value: 'soubre', label: 'Soubré', description: 'Nawa' },
  ];
  
  const [orderData, setOrderData] = useState<OrderData>({
    senderName: '',
    senderPhone: '',
    senderCity: '',
    senderDistrict: '',
    receiverName: '',
    receiverPhone: '',
    deliveryAddress: '',
    deliveryLatitude: undefined,
    deliveryLongitude: undefined,
    destinationStation: '',
    stationLatitude: undefined,
    stationLongitude: undefined,
    distanceKm: undefined,
    deliveryType: 'standard',
    packageCode: '',
    packages: [],
    selectedRecipientPhone: '',
    selectedRecipientName: 'Moi',
    isSelectingSenderPhone: false,
  });

  const [currentPackage, setCurrentPackage] = useState<PackageData>({
    packageCode: '',
    packageDescription: '',
    packageType: '',
    specialInstructions: '',
  });

  const [showPackageTypeSelector, setShowPackageTypeSelector] = useState(false);
  const [showStationSelector, setShowStationSelector] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [showAbidjanStationSelector, setShowAbidjanStationSelector] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSearchText, setContactSearchText] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [isTypingAddress, setIsTypingAddress] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [pricingInfo, setPricingInfo] = useState<PricingResult | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const successSlideAnim = useState(new Animated.Value(Dimensions.get('window').height))[0];
  const [currentPopupStep, setCurrentPopupStep] = useState(0);
  const [showPopupModal, setShowPopupModal] = useState(false);
  const popupSlideAnim = useState(new Animated.Value(Dimensions.get('window').height))[0];
  const [currentPackageStep, setCurrentPackageStep] = useState(0);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const packageSlideAnim = useState(new Animated.Value(Dimensions.get('window').height))[0];
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Nouveaux états pour les popups optimisés
  const [showLocationModal, setShowLocationModal] = useState(false);
  const locationSlideAnim = useState(new Animated.Value(Dimensions.get('window').height))[0];
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const detailsSlideAnim = useState(new Animated.Value(Dimensions.get('window').height))[0];
  const [showStationModal, setShowStationModal] = useState(false);
  const [stationSearchText, setStationSearchText] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);
  const [showPackageChoiceModal, setShowPackageChoiceModal] = useState(false);
  const packageChoiceSlideAnim = useState(new Animated.Value(Dimensions.get('window').height))[0];

  const totalSteps = 3;

  // Recalculer le prix quand la distance, le nombre de colis ou le type de livraison change
  useEffect(() => {
    calculateDeliveryPricing();
  }, [orderData.distanceKm, orderData.packages.length, orderData.packageCode, orderData.deliveryType]);

  // Lancer automatiquement le popup quand on arrive à l'étape 1
  useEffect(() => {
    if (currentStep === 1) {
      showLocationModalPopup();
    }
  }, [currentStep]);

  // Gestion du clavier pour éviter la fermeture des modals
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // Empêcher la fermeture automatique des modals quand le clavier apparaît
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Optionnel: actions à effectuer quand le clavier se ferme
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Lancer automatiquement le popup de colis quand on arrive à l'étape 2
  useEffect(() => {
    if (currentStep === 2) {
      showPackageModalPopup();
    }
  }, [currentStep]);

  // Les gares sont déjà chargées par fetchStationsFromOSM() plus haut

  // Charger les contacts au montage du composant
  useEffect(() => {
    loadContactsOnce();
  }, []);

  // Les gares sont chargées par fetchStationsFromOSM() qui inclut des gares de fallback

  // Fonction pour calculer la distance entre deux points GPS (formule de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance en kilomètres
    return Math.round(distance * 100) / 100; // Arrondir à 2 décimales
  };

  // Fonction pour calculer le prix de livraison
  const calculateDeliveryPricing = () => {
    if (orderData.distanceKm && orderData.distanceKm > 0) {
      const totalPackages = orderData.packages.length + (orderData.packageCode ? 1 : 0);
      const pricing = PricingCalculator.calculateDeliveryPrice(
        orderData.distanceKm,
        totalPackages, // Nombre total de colis
        orderData.deliveryType === 'express'
      );
      setPricingInfo(pricing);
    } else {
      setPricingInfo(null);
    }
  };

  // Fonctions pour le popup de succès
  const showSuccessModalPopup = () => {
    setShowSuccessModal(true);
    Animated.timing(successSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideSuccessModal = () => {
    Animated.timing(successSlideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowSuccessModal(false);
      navigation.navigate('Home');
    });
  };

  // Fonctions pour les popups séquentiels
  const showNextPopup = () => {
    // Fermer tous les sélecteurs ouverts
    setShowCitySelector(false);
    setShowStationSelector(false);
    setShowAbidjanStationSelector(false);
    
    if (currentPopupStep < 5) {
      setCurrentPopupStep(currentPopupStep + 1);
    } else {
      // Toutes les étapes sont terminées, passer à l'étape 2 et ouvrir le modal de type de livraison
      setShowPopupModal(false);
      setCurrentStep(2);
      // Ouvrir directement le modal de type de livraison
      setTimeout(() => {
        showPackageModalPopup();
      }, 100);
    }
  };

  const showPreviousPopup = () => {
    // Fermer tous les sélecteurs ouverts
    setShowCitySelector(false);
    setShowStationSelector(false);
    setShowAbidjanStationSelector(false);
    
    if (currentPopupStep > 0) {
      setCurrentPopupStep(currentPopupStep - 1);
    } else {
      setShowPopupModal(false);
    }
  };

  // Fonction pour gérer la sélection d'une gare d'Abidjan
  const handleAbidjanStationSelect = (stationValue: string) => {
    const selectedStation = abidjanStations.find(station => station.value === stationValue);
    if (selectedStation) {
      setOrderData(prev => {
        const newData = {
          ...prev,
          senderName: selectedStation.label,
          destinationStation: selectedStation.value,
          stationLatitude: selectedStation.lat,
          stationLongitude: selectedStation.lon,
        };
        
        // Calculer la distance si l'adresse de livraison a déjà été saisie
        if (prev.deliveryLatitude && prev.deliveryLongitude && selectedStation.lat && selectedStation.lon) {
          newData.distanceKm = calculateDistance(
            selectedStation.lat,
            selectedStation.lon,
            prev.deliveryLatitude,
            prev.deliveryLongitude
          );
        }
        
        return newData;
      });
    }
    setShowAbidjanStationSelector(false);
  };

  // Fonction pour sélectionner un contact (comme Yango)
  const selectContact = () => {
    // Le sélecteur natif gère automatiquement les permissions
    openContactPicker();
  };

  const openContactPicker = async () => {
    console.log('Ouverture du sélecteur de contacts...');
    
    try {
      // Demander la permission avec expo-contacts
      const { status } = await Contacts.requestPermissionsAsync();
      console.log('Statut permission contacts:', status);
      
      if (status === 'granted') {
        fetchAndShowContacts();
      } else {
        Alert.alert(t('permission_refusee'), t('autoriser_acces_contacts'));
      }
    } catch (error) {
      console.error('Erreur demande permission:', error);
      Alert.alert(t('erreur'), t('erreur_demande_permission'));
    }
  };

  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [contactModalType, setContactModalType] = useState<'sender' | 'recipient'>('sender');
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Charger les contacts une seule fois au démarrage
  const loadContactsOnce = async () => {
    if (contactsLoaded || loadingContacts) return;
    
    setLoadingContacts(true);
    console.log('Chargement initial des contacts...');
    
    try {
      const { data: contacts } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });
      
      console.log('Contacts récupérés:', contacts.length);
      
      // Filtrer les contacts qui ont un numéro de téléphone
      const contactsWithPhone = contacts.filter(contact => 
        contact && contact.phoneNumbers && contact.phoneNumbers.length > 0
      );

      console.log('Contacts avec téléphone:', contactsWithPhone.length);
      setAllContacts(contactsWithPhone);
      setContactsLoaded(true);
    } catch (error: any) {
      console.error('Erreur lors du chargement des contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchAndShowContacts = async (type: 'sender' | 'recipient' = 'sender') => {
    // Ouvrir immédiatement le modal pour une meilleure réactivité
      setContactModalType(type);
      setShowContactModal(true);
    
    // Charger les contacts si pas encore fait
    if (!contactsLoaded && !loadingContacts) {
      await loadContactsOnce();
    }
  };

  const handleContactSelect = (contact: any) => {
    const phoneNumber = contact.phoneNumbers?.[0]?.number;
    if (phoneNumber) {
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, ''); // Supprimer les caractères non numériques
      console.log('Numéro sélectionné:', cleanPhoneNumber);
      
      setOrderData(prev => {
        if (prev.isSelectingSenderPhone) {
          // Sélection du téléphone de l'expéditeur
          return {
        ...prev,
            senderPhone: cleanPhoneNumber,
            isSelectingSenderPhone: false
          };
        } else {
          // Sélection du destinataire
          return {
            ...prev,
            selectedRecipientPhone: cleanPhoneNumber,
            selectedRecipientName: contact.name || contact.firstName || 'Contact'
          };
        }
      });
      
      setShowContactModal(false);
      setContactSearchText('');
      
      // Ne plus passer automatiquement à l'étape suivante
      // L'utilisateur devra cliquer sur "Suivant"
    }
  };

  const handleRecipientSelect = (name: string, phone: string) => {
    const cleanPhoneNumber = phone.replace(/\D/g, ''); // Supprimer les caractères non numériques
    console.log('Destinataire sélectionné:', name, cleanPhoneNumber);
    setOrderData(prev => ({
      ...prev,
      selectedRecipientName: name,
      selectedRecipientPhone: cleanPhoneNumber,
      // Si on sélectionne "Moi", utiliser les informations de l'expéditeur
      ...(name === 'Moi' && {
        receiverName: prev.senderName,
        receiverPhone: prev.senderPhone
      })
    }));
    setContactSearchText('');
    
    // Fermer le modal de sélection de contact
    setShowContactModal(false);
    
    // Ne plus passer automatiquement à l'étape suivante
    // L'utilisateur devra cliquer sur "Suivant"
  };

  // Filtrer les contacts selon le texte de recherche
  const filteredContacts = allContacts.filter(contact => {
    const searchLower = contactSearchText.toLowerCase();
    const name = (contact.name || contact.firstName || '').toLowerCase();
    const phone = contact.phoneNumbers?.[0]?.number || '';
    return name.includes(searchLower) || phone.includes(searchLower);
  });

  const showPopupModalPopup = () => {
    setCurrentPopupStep(0);
    setShowPopupModal(true);
    Animated.timing(popupSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Nouveaux popups optimisés
  const showLocationModalPopup = () => {
    setShowLocationModal(true);
    Animated.timing(locationSlideAnim, {
      toValue: 0,
      duration: 200, // Réduit de 300ms à 200ms
      useNativeDriver: true,
    }).start();
  };

  const hideLocationModalPopup = () => {
    Animated.timing(locationSlideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 150, // Réduit de 300ms à 150ms
      useNativeDriver: true,
    }).start(() => {
      setShowLocationModal(false);
      // Rediriger vers la page d'accueil
      navigation.navigate('Home');
    });
  };

  const closeLocationModalPopup = () => {
    Animated.timing(locationSlideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 150, // Réduit de 300ms à 150ms
      useNativeDriver: true,
    }).start(() => {
      setShowLocationModal(false);
    });
  };

  const hideStationModal = () => {
    setShowStationModal(false);
    setStationSearchText(''); // Réinitialiser la recherche
  };

  const showDetailsModalPopup = () => {
    setShowDetailsModal(true);
    Animated.timing(detailsSlideAnim, {
      toValue: 0,
      duration: 200, // Réduit de 300ms à 200ms
      useNativeDriver: true,
    }).start();
  };

  const hideDetailsModalPopup = () => {
    Animated.timing(detailsSlideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 150, // Réduit de 300ms à 150ms
      useNativeDriver: true,
    }).start(() => {
      setShowDetailsModal(false);
      // Rediriger vers la page d'accueil
      navigation.navigate('Home');
    });
  };

  const closeDetailsModalPopup = () => {
    Animated.timing(detailsSlideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 150, // Réduit de 300ms à 150ms
      useNativeDriver: true,
    }).start(() => {
      setShowDetailsModal(false);
    });
  };

  // Validation pour le popup de localisation
  const validateLocationModal = () => {
    if (!orderData.destinationStation) {
      setErrorMessage('Veuillez sélectionner une gare');
      setShowErrorModal(true);
      return false;
    }
    if (!orderData.deliveryAddress) {
      setErrorMessage('Veuillez sélectionner un lieu de livraison');
      setShowErrorModal(true);
      return false;
    }
    if (!orderData.senderCity) {
      setErrorMessage('Veuillez indiquer d\'où vient le colis');
      setShowErrorModal(true);
      return false;
    }
    return true;
  };

  // Validation pour le popup de détails
  const validateDetailsModal = () => {
    if (!orderData.selectedRecipientPhone && orderData.selectedRecipientName !== 'Moi') {
      setErrorMessage('Veuillez sélectionner qui va recevoir le colis');
      setShowErrorModal(true);
      return false;
    }
    // Vérifier s'il y a au moins un colis (ajouté ou dans le champ)
    const hasPackages = packageCount > 0 || orderData.packages.length > 0 || !!orderData.packageCode;
    if (!hasPackages) {
      setErrorMessage('Veuillez ajouter au moins un colis');
      setShowErrorModal(true);
      return false;
    }
    if (!orderData.senderPhone) {
      setErrorMessage('Veuillez sélectionner le numéro de l\'expéditeur');
      setShowErrorModal(true);
      return false;
    }
    return true;
  };

  // Navigation entre les popups optimisés
  const handleLocationModalNext = () => {
    if (validateLocationModal()) {
      closeLocationModalPopup();
      setTimeout(() => {
        showDetailsModalPopup();
      }, 150); // Réduit de 300ms à 150ms
    }
  };

  const handleDetailsModalNext = async () => {
    if (validateDetailsModal()) {
      // Si il y a un code de colis dans le champ mais qu'il n'a pas été ajouté, l'ajouter automatiquement
      if (orderData.packageCode && !orderData.packages.some(pkg => pkg.packageCode === orderData.packageCode)) {
        await handleAddPackageFromCode(orderData.packageCode);
        // Vider le champ après l'ajout automatique
        setOrderData(prev => ({ ...prev, packageCode: '' }));
      }
      
      closeDetailsModalPopup();
      // Aller directement au modal de type de livraison
      setTimeout(() => {
        showPackageModalPopup();
      }, 150); // Réduit de 300ms à 150ms
    }
  };

  const hidePopupModal = () => {
    Animated.timing(popupSlideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowPopupModal(false);
      // Rediriger vers la page d'accueil quand on annule
      navigation.navigate('Home');
    });
  };

  const validatePopupStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(orderData.senderName);
      case 1:
        return !!(orderData.deliveryAddress);
      case 2:
        return !!(orderData.selectedRecipientPhone || orderData.selectedRecipientName === 'Moi');
      case 3:
        return !!(orderData.senderCity);
      case 4:
        // Permettre de passer si on a au moins 1 colis ajouté (peu importe si le champ est vide)
        return packageCount > 0 || orderData.packages.length > 0 || !!orderData.packageCode;
      case 5:
        return !!(orderData.senderPhone);
      default:
        return true;
    }
  };

  // Fonctions pour les popups de colis
  const showNextPackagePopup = () => {
    if (currentPackageStep < 2) {
      setCurrentPackageStep(currentPackageStep + 1);
    } else {
      // Toutes les étapes sont terminées, ajouter le colis et proposer les options
      handleAddPackage();
      setShowPackageModal(false);
      // Afficher le popup de choix après ajout du colis
      showPackageChoiceModalPopup();
    }
  };

  const showPreviousPackagePopup = () => {
    if (currentPackageStep > 0) {
      setCurrentPackageStep(currentPackageStep - 1);
    } else {
      setShowPackageModal(false);
    }
  };

  const showPackageModalPopup = () => {
    setCurrentPackageStep(0);
    setShowPackageModal(true);
    Animated.timing(packageSlideAnim, {
      toValue: 0,
      duration: 200, // Réduit de 300ms à 200ms
      useNativeDriver: true,
    }).start();
  };

  const hidePackageModal = () => {
    Animated.timing(packageSlideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 150, // Réduit de 300ms à 150ms
      useNativeDriver: true,
    }).start(() => {
      setShowPackageModal(false);
    });
  };

  const validatePackageStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(currentPackage.packageCode);
      case 1:
        return !!(currentPackage.packageDescription);
      case 2:
        return !!(currentPackage.packageType);
      default:
        return true;
    }
  };

  // Fonctions pour le popup de choix après ajout de colis
  const showPackageChoiceModalPopup = () => {
    setShowPackageChoiceModal(true);
    Animated.timing(packageChoiceSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hidePackageChoiceModal = () => {
    Animated.timing(packageChoiceSlideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowPackageChoiceModal(false);
    });
  };

  const handleValidateOrder = async () => {
    console.log('🎯 === DÉBUT handleValidateOrder ===');
    console.log('Utilisateur:', user);
    console.log('ID utilisateur:', user?.id);
    console.log('Type d\'ID:', typeof user?.id);
    
    hidePackageChoiceModal();
    
    if (!user?.id) {
      console.log('❌ Utilisateur non connecté - arrêt du processus');
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }
    
    console.log('✅ Utilisateur connecté, continuation...');

    setLoading(true);
    
    try {
      console.log('=== DEBUG MultiStepPackageRegistrationScreen ===');
      console.log('Données de commande:', orderData);
      console.log('Informations de prix:', pricingInfo);
      console.log('Utilisateur:', user);

      // Préparer les données pour l'API backend avec la structure simplifiée
      const orderDataForBackend = {
        customerId: user.id,
        destinationStation: orderData.destinationStation,
        deliveryAddress: orderData.deliveryAddress,
        deliveryLatitude: orderData.deliveryLatitude,
        deliveryLongitude: orderData.deliveryLongitude,
        pickupAddress: `${orderData.senderCity}, ${orderData.senderDistrict}`, // Lieu d'origine
        stationLatitude: orderData.stationLatitude,
        stationLongitude: orderData.stationLongitude,
        distanceKm: orderData.distanceKm,
        receiverPhone: orderData.selectedRecipientPhone || orderData.receiverPhone,
        senderPhone: orderData.senderPhone,
        deliveryType: orderData.deliveryType || 'standard',
        paymentMethod: orderData.paymentMethod || 'cash',
        packages: orderData.packages.map(pkg => ({
          packageCode: pkg.packageCode,
        })),
        totalPrice: pricingInfo?.totalPrice || 0,
      };

      console.log('=== DONNÉES POUR LE BACKEND ===');
      console.log('Structure simplifiée:', orderDataForBackend);
      console.log('Utilisateur connecté:', user);

      // Appeler l'API backend
      console.log('🚀 Appel de OrderService.createOrder...');
      const createdOrder = await OrderService.createOrder(orderDataForBackend, user.id);
      console.log('✅ OrderService.createOrder terminé avec succès');

      console.log('=== COMMANDE CRÉÉE AVEC SUCCÈS ===');
      console.log('Numéro de commande:', createdOrder.orderNumber);
      console.log('ID de commande:', createdOrder.id);
      console.log('Statut:', createdOrder.status);
      console.log('Prix total:', createdOrder.totalPrice);
      console.log('Nombre de colis:', createdOrder.packages?.length || 0);
      console.log('Détails complets:', createdOrder);

      console.log('✅ Commande créée avec succès dans la base de données');
      console.log('📦 La commande sera récupérée automatiquement via l\'API lors du prochain chargement de "Mes colis"');

      setLoading(false);

      // Afficher un message de confirmation et naviguer vers Mes colis
      Alert.alert(
        'Commande validée !',
        `Votre commande ${createdOrder.orderNumber} a été confirmée et sera traitée sous peu.`,
        [
          {
            text: 'Voir mes colis',
            onPress: () => {
              navigation.navigate('MyPackages');
            }
          },
          {
            text: 'Suivre le colis',
            onPress: () => navigation.navigate('PackageTracking', { packageId: createdOrder.orderNumber })
          }
        ]
      );
    } catch (error) {
      setLoading(false);
      console.error('Erreur lors de la création de la commande:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la validation de votre commande. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleAddAnotherPackage = () => {
    hidePackageChoiceModal();
    // Incrémenter le compteur de colis
    setPackageCount(prev => prev + 1);
    // Réinitialiser le formulaire de colis et relancer le popup
    setCurrentPackage({
      packageCode: '',
      packageDescription: '',
      packageType: '',
      specialInstructions: '',
    });
    showPackageModalPopup();
  };

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

  const handleStationSelect = (stationValue: string) => {
    // Trouver la gare sélectionnée pour récupérer ses coordonnées
    const selectedStation = osmStations.find(s => s.value === stationValue);
    
    setOrderData(prev => {
      const newData = {
        ...prev,
        destinationStation: stationValue,
        stationLatitude: selectedStation?.lat,
        stationLongitude: selectedStation?.lon,
      };
      
      // Calculer la distance si l'adresse de livraison a déjà été saisie
      if (prev.deliveryLatitude && prev.deliveryLongitude && selectedStation?.lat && selectedStation?.lon) {
        newData.distanceKm = calculateDistance(
          selectedStation.lat,
          selectedStation.lon,
          prev.deliveryLatitude,
          prev.deliveryLongitude
        );
      }
      
      return newData;
    });
    setShowStationSelector(false);
  };

  const handleCitySelect = (city: string) => {
    setOrderData(prev => ({
      ...prev,
      senderCity: city
    }));
    setShowCitySelector(false);
  };

  // Base de données des zones de livraison de la Côte d'Ivoire
  const deliveryZones = [
    // ABIDJAN - COCODY
    "Cocody, Riviera 2, Abidjan",
    "Cocody, Riviera 3, Abidjan", 
    "Cocody, Riviera 4, Abidjan",
    "Cocody, Angré 8ème Tranche, Abidjan",
    "Cocody, Angré 7ème Tranche, Abidjan",
    "Cocody, 2 Plateaux, Abidjan",
    "Cocody, 7ème Tranche, Abidjan",
    "Cocody, Ambassade, Abidjan",
    "Cocody, Cité des Arts, Abidjan",
    "Cocody, Les Jardins, Abidjan",
    "Cocody, Mermoz, Abidjan",
    "Cocody, Zone 4, Abidjan",
    
    // ABIDJAN - PLATEAU
    "Plateau, Boulevard Lagunaire, Abidjan",
    "Plateau, Avenue Franchet d'Esperey, Abidjan",
    "Plateau, Rue du Commerce, Abidjan",
    "Plateau, Avenue Delafosse, Abidjan",
    "Plateau, Avenue Noguès, Abidjan",
    "Plateau, Avenue Binger, Abidjan",
    "Plateau, Rue des Jardins, Abidjan",
    "Plateau, Avenue Chardy, Abidjan",
    
    // ABIDJAN - MARCORY
    "Marcory, Zone 4, Abidjan",
    "Marcory, Résidentiel, Abidjan",
    "Marcory, Zone 3, Abidjan",
    "Marcory, Zone 2, Abidjan",
    "Marcory, Zone 1, Abidjan",
    "Marcory, Riviera Palmeraie, Abidjan",
    
    // ABIDJAN - YOPOUGON
    "Yopougon, Sicogi, Abidjan",
    "Yopougon, Andokoi, Abidjan",
    "Yopougon, Toit Rouge, Abidjan",
    "Yopougon, Gesco, Abidjan",
    "Yopougon, Niangon, Abidjan",
    "Yopougon, Sagbé, Abidjan",
    "Yopougon, Koweït, Abidjan",
    "Yopougon, Cité An 2000, Abidjan",
    
    // ABIDJAN - ADJAMÉ
    "Adjamé, Gare du Nord, Abidjan",
    "Adjamé, Rond-point de la Paix, Abidjan",
    "Adjamé, Rond-point de l'Indépendance, Abidjan",
    "Adjamé, Rond-point de l'Unité, Abidjan",
    "Adjamé, Rond-point de la République, Abidjan",
    "Adjamé, Rond-point de la Fraternité, Abidjan",
    
    // ABIDJAN - KOUMASSI
    "Koumassi, Zone Industrielle, Abidjan",
    "Koumassi, Remblais, Abidjan",
    "Koumassi, Sicogi, Abidjan",
    "Koumassi, Cité An 2000, Abidjan",
    "Koumassi, Rond-point de la Paix, Abidjan",
    
    // ABIDJAN - PORT-BOUËT
    "Port-Bouët, Aéroport, Abidjan",
    "Port-Bouët, Vridi, Abidjan",
    "Port-Bouët, Zone Industrielle, Abidjan",
    "Port-Bouët, Rond-point de la Paix, Abidjan",
    "Port-Bouët, Cité An 2000, Abidjan",
    
    // ABIDJAN - AUTRES COMMUNES
    "Bingerville, Centre, Abidjan",
    "Bingerville, Rond-point de la Paix, Abidjan",
    "Anyama, Centre, Abidjan",
    "Anyama, Rond-point de la Paix, Abidjan",
    "Songon, Centre, Abidjan",
    "Songon, Rond-point de la Paix, Abidjan",
    "Attécoubé, Centre, Abidjan",
    "Attécoubé, Rond-point de la Paix, Abidjan",
    "Treichville, Centre, Abidjan",
    "Treichville, Rond-point de la Paix, Abidjan",
    
    // BOUAKÉ
    "Bouaké, Centre-ville",
    "Bouaké, Air France",
    "Bouaké, Belleville",
    "Bouaké, Rond-point de la Paix",
    "Bouaké, Rond-point de l'Indépendance",
    "Bouaké, Rond-point de l'Unité",
    "Bouaké, Rond-point de la République",
    "Bouaké, Rond-point de la Fraternité",
    
    // DALOA
    "Daloa, Centre-ville",
    "Daloa, Air France",
    "Daloa, Rond-point de la Paix",
    "Daloa, Rond-point de l'Indépendance",
    "Daloa, Rond-point de l'Unité",
    "Daloa, Rond-point de la République",
    "Daloa, Rond-point de la Fraternité",
    
    // SAN-PÉDRO
    "San-Pédro, Centre-ville",
    "San-Pédro, Port",
    "San-Pédro, Rond-point de la Paix",
    "San-Pédro, Rond-point de l'Indépendance",
    "San-Pédro, Rond-point de l'Unité",
    "San-Pédro, Rond-point de la République",
    "San-Pédro, Rond-point de la Fraternité",
    
    // KORHOGO
    "Korhogo, Centre-ville",
    "Korhogo, Rond-point de la Paix",
    "Korhogo, Rond-point de l'Indépendance",
    "Korhogo, Rond-point de l'Unité",
    "Korhogo, Rond-point de la République",
    "Korhogo, Rond-point de la Fraternité",
    
    // MAN
    "Man, Centre-ville",
    "Man, Rond-point de la Paix",
    "Man, Rond-point de l'Indépendance",
    "Man, Rond-point de l'Unité",
    "Man, Rond-point de la République",
    "Man, Rond-point de la Fraternité",
    
    // GAGNOA
    "Gagnoa, Centre-ville",
    "Gagnoa, Rond-point de la Paix",
    "Gagnoa, Rond-point de l'Indépendance",
    "Gagnoa, Rond-point de l'Unité",
    "Gagnoa, Rond-point de la République",
    "Gagnoa, Rond-point de la Fraternité",
    
    // YAMOUSSOUKRO
    "Yamoussoukro, Centre-ville",
    "Yamoussoukro, Rond-point de la Paix",
    "Yamoussoukro, Rond-point de l'Indépendance",
    "Yamoussoukro, Rond-point de l'Unité",
    "Yamoussoukro, Rond-point de la République",
    "Yamoussoukro, Rond-point de la Fraternité",
    
    // DIVO
    "Divo, Centre-ville",
    "Divo, Rond-point de la Paix",
    "Divo, Rond-point de l'Indépendance",
    "Divo, Rond-point de l'Unité",
    "Divo, Rond-point de la République",
    "Divo, Rond-point de la Fraternité",
    
    // AUTRES VILLES
    "Abengourou, Centre-ville",
    "Bondoukou, Centre-ville",
    "Odienné, Centre-ville",
    "Séguéla, Centre-ville",
    "Touba, Centre-ville",
    "Bangolo, Centre-ville",
    "Duékoué, Centre-ville",
    "Guiglo, Centre-ville",
    "Tabou, Centre-ville",
    "Soubré, Centre-ville"
  ];

  // Fonction pour générer des suggestions d'adresses basées sur les zones de livraison
  const generateAddressSuggestions = (query: string): string[] => {
    if (!query || query.length < 1) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    
    // Recherche intelligente : priorité aux correspondances exactes, puis partielles
    const exactMatches = deliveryZones.filter(zone => 
      zone.toLowerCase().startsWith(normalizedQuery)
    );
    
    const partialMatches = deliveryZones.filter(zone => 
      zone.toLowerCase().includes(normalizedQuery) && 
      !zone.toLowerCase().startsWith(normalizedQuery)
    );
    
    // Combiner les résultats avec priorité aux correspondances exactes
    const suggestions = [...exactMatches, ...partialMatches];
    
    return suggestions.slice(0, 6); // Limiter à 6 suggestions
  };

  const handleAddressInputChange = (text: string) => {
    setOrderData(prev => ({
      ...prev,
      deliveryAddress: text
    }));
    
    // Déclencher les suggestions dès la première lettre tapée
    if (text.length >= 1) {
      const suggestions = generateAddressSuggestions(text);
      setAddressSuggestions(suggestions);
      setShowAddressSuggestions(suggestions.length > 0);
    } else {
      setShowAddressSuggestions(false);
      setAddressSuggestions([]);
    }
  };

  const handleAddressSuggestionSelect = (address: string) => {
    setOrderData(prev => ({
      ...prev,
      deliveryAddress: address
    }));
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
    setIsTypingAddress(false);
  };

  const canAddPackage = () => {
    return !!(currentPackage.packageCode && currentPackage.packageDescription && currentPackage.packageType);
  };

  const handleAddPackage = async () => {
    if (!currentPackage.packageCode || !currentPackage.packageDescription || !currentPackage.packageType) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires');
      setShowErrorModal(true);
      return;
    }

    // Incrémenter le compteur de colis
    setPackageCount(prev => prev + 1);

    const newOrderData = {
      ...orderData,
      packages: [...orderData.packages, currentPackage]
    };

    setOrderData(newOrderData);

    // Sauvegarder en brouillon
    try {
      await AsyncStorage.setItem('@pako_draft_order', JSON.stringify(newOrderData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du brouillon:', error);
    }

    setCurrentPackage({
      packageCode: '',
      packageDescription: '',
      packageType: '',
      specialInstructions: '',
    });
  };

  // Nouvelle fonction pour ajouter un colis à partir d'un code colis uniquement
  const handleAddPackageFromCode = async (packageCode: string) => {
    if (!packageCode.trim()) {
      setErrorMessage('Veuillez saisir un code colis');
      setShowErrorModal(true);
      return;
    }

    // Incrémenter le compteur de colis
    setPackageCount(prev => prev + 1);

    // Créer automatiquement un colis avec le code saisi
    const newPackage: PackageData = {
      packageCode: packageCode.toUpperCase(),
      packageDescription: 'Colis standard',
      packageType: 'standard',
      specialInstructions: '',
    };

    const newOrderData = {
      ...orderData,
      packages: [...orderData.packages, newPackage]
    };

    setOrderData(newOrderData);

    // Sauvegarder en brouillon
    try {
      await AsyncStorage.setItem('@pako_draft_order', JSON.stringify(newOrderData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du brouillon:', error);
    }
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
        // Validation pour les nouveaux popups optimisés
        if (!orderData.destinationStation || !orderData.deliveryAddress || !orderData.senderCity || 
            (!orderData.selectedRecipientPhone && orderData.selectedRecipientName !== 'Moi') || 
            !orderData.packageCode || !orderData.senderPhone) {
          setErrorMessage('Veuillez remplir tous les champs obligatoires');
          setShowErrorModal(true);
          return false;
        }
        break;
      case 2:
        if (orderData.packages.length === 0) {
          setErrorMessage('Veuillez ajouter au moins un colis');
          setShowErrorModal(true);
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
    setShowMapModal(true);
  };

  const handleMapSelection = (address: string, latitude?: number, longitude?: number) => {
    setOrderData(prev => {
      const newData = {
        ...prev,
        deliveryAddress: address,
        deliveryLatitude: latitude,
        deliveryLongitude: longitude,
      };
      
      // Calculer la distance si la gare a déjà été sélectionnée
      if (prev.stationLatitude && prev.stationLongitude && latitude && longitude) {
        newData.distanceKm = calculateDistance(
          prev.stationLatitude,
          prev.stationLongitude,
          latitude,
          longitude
        );
      }
      
      return newData;
    });
    setShowMapModal(false);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setLoading(true);
    
    try {
      console.log('🎯 === DÉBUT handleSubmit ===');
      console.log('Utilisateur:', user);
      console.log('Données de commande:', orderData);
      console.log('Informations de prix:', pricingInfo);
      
      if (!user?.id || !user?.phone) {
        console.log('❌ Utilisateur non connecté - arrêt du processus');
        Alert.alert('Erreur', 'Utilisateur non connecté');
        return;
      }
      
      // Récupérer l'UUID backend si nécessaire
      let customerId = user.id;
      
      // Si l'ID est un timestamp local, récupérer l'UUID backend
      if (!user.id.includes('-')) { // UUID contient toujours des tirets
        console.log('⚠️ ID local détecté, récupération de l\'UUID backend...');
        try {
          const { AuthService } = await import('../services/authService');
          const userResult = await AuthService.getUserByPhone(user.phone);
          if (userResult.success && userResult.user?.id) {
            customerId = userResult.user.id;
            console.log('✅ UUID backend récupéré:', customerId);
          } else {
            console.log('⚠️ Impossible de récupérer l\'UUID, utilisation de l\'ID local');
          }
        } catch (error) {
          console.log('⚠️ Erreur lors de la récupération de l\'UUID:', error);
          // Continuer avec l'ID local
        }
      } else {
        console.log('✅ UUID backend déjà présent:', customerId);
      }
      
      // Déterminer le numéro du destinataire
      let receiverPhoneValue = orderData.selectedRecipientPhone || orderData.receiverPhone;
      
      // Si le destinataire est "Moi", utiliser le numéro de l'utilisateur connecté
      if (orderData.selectedRecipientName === 'Moi' && user?.phone) {
        receiverPhoneValue = user.phone;
      }

      // Préparer les données pour l'API backend avec la structure simplifiée
      const orderDataForBackend = {
        customerId,
        destinationStation: orderData.destinationStation,
        deliveryAddress: orderData.deliveryAddress,
        deliveryLatitude: orderData.deliveryLatitude,
        deliveryLongitude: orderData.deliveryLongitude,
        pickupAddress: `${orderData.senderCity}, ${orderData.senderDistrict}`,
        stationLatitude: orderData.stationLatitude,
        stationLongitude: orderData.stationLongitude,
        distanceKm: orderData.distanceKm,
        receiverPhone: receiverPhoneValue,
        senderPhone: orderData.senderPhone,
        deliveryType: orderData.deliveryType || 'standard',
        paymentMethod: orderData.paymentMethod || 'cash',
        packages: orderData.packages.map(pkg => ({
          packageCode: pkg.packageCode,
        })),
        totalPrice: pricingInfo?.totalPrice || 0,
      };

      console.log('=== DONNÉES POUR LE BACKEND ===');
      console.log('Structure simplifiée:', orderDataForBackend);

      // Appeler l'API backend
      console.log('🚀 Appel de OrderService.createOrder...');
      console.log('📋 Customer ID envoyé:', customerId);
      const createdOrder = await OrderService.createOrder(orderDataForBackend, customerId);
      console.log('✅ OrderService.createOrder terminé avec succès');
      console.log('Commande créée:', createdOrder);

      // Afficher le modal de succès
      showSuccessModalPopup();
    } catch (error) {
      console.error('❌ Erreur lors de la création de la commande:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la validation de votre commande. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View key={index} style={styles.progressStep}>
          <View style={[
            styles.progressCircle,
            index + 1 <= currentStep && styles.progressCircleActive
          ]} />
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

  const renderStep1 = () => {
    return null; // Ne rien afficher, juste lancer le popup
  };

  const renderStep1Old = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Étape 1/3 - Informations générales</Text>
      
      {/* Section Expéditeur */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Informations expéditeur</Text>
        
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
        
        {/* Sélecteur de ville */}
        <TouchableOpacity 
          style={styles.citySelector}
          onPress={() => setShowCitySelector(!showCitySelector)}
        >
          <Text style={[
            styles.citySelectorText,
            !orderData.senderCity && styles.placeholderText
          ]}>
            {orderData.senderCity 
              ? coteIvoireCities.find(city => city.value === orderData.senderCity)?.label 
              : 'Ville de provenance *'
            }
          </Text>
          <Text style={styles.dropdownIcon}>
            {showCitySelector ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
        
        {showCitySelector && (
          <View style={styles.cityOptions}>
            <ScrollView 
              style={styles.cityScrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {coteIvoireCities.map((city) => (
                <TouchableOpacity
                  key={city.value}
                  style={[
                    styles.cityOption,
                    orderData.senderCity === city.value && styles.selectedCity
                  ]}
                  onPress={() => handleCitySelect(city.value)}
                >
                  <Text style={styles.cityOptionLabel}>{city.label}</Text>
                  <Text style={styles.cityOptionDescription}>{city.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Champ quartier */}
        <TextInput
          style={styles.input}
          placeholder="Quartier de provenance"
          value={orderData.senderDistrict}
          onChangeText={(value) => handleOrderInputChange('senderDistrict', value)}
        />
      </View>

      {/* Section Destinataire */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Informations expéditeur</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Choisissez la gare *"
          value={orderData.receiverName}
          onChangeText={(value) => handleOrderInputChange('receiverName', value)}
        />
        
        <PhoneInput
          placeholder="Téléphone de l'expéditeur *"
          value={orderData.receiverPhone}
          onChangeText={(value) => handleOrderInputChange('receiverPhone', value)}
          style={styles.phoneInput}
        />
        
        {/* Sélecteur d'adresse de livraison sur carte */}
        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>Adresse de livraison *</Text>
          <TouchableOpacity 
            style={styles.addressSelector}
            onPress={handleGetCurrentLocation}
          >
            <Text style={[
              styles.addressSelectorText,
              !orderData.deliveryAddress && styles.placeholderText
            ]}>
              {orderData.deliveryAddress || 'Sélectionner sur la carte'}
            </Text>
            <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
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
            ? osmStations.find(station => station.value === orderData.destinationStation)?.label 
            : 'Gare de destination *'
          }
        </Text>
        <Text style={styles.dropdownIcon}>
          {showStationSelector ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      
      {showStationSelector && (
        <ScrollView style={styles.stationOptions} nestedScrollEnabled={true}>
          {loadingStations && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Chargement des gares depuis OpenStreetMap...</Text>
            </View>
          )}
          
          {/* Gares de transport interurbain (lignes nationales) */}
          {osmStations.length > 0 ? (
            <>
              <View style={styles.stationCategoryHeader}>
                <MaterialCommunityIcons name="bus" size={20} color={COLORS.primary} />
                <Text style={styles.stationCategoryTitle}>Gares Transport National ({osmStations.length})</Text>
              </View>
              {osmStations.map((station) => (
                <TouchableOpacity
                  key={station.value}
                  style={[
                    styles.stationOption,
                    orderData.destinationStation === station.value && styles.selectedStation
                  ]}
                  onPress={() => handleStationSelect(station.value)}
                >
                  <View style={styles.stationOptionHeader}>
                    <MaterialCommunityIcons name="bus" size={16} color={COLORS.primary} />
                    <Text style={styles.stationOptionLabel}>{station.label}</Text>
                  </View>
                  <Text style={styles.stationOptionDescription}>{station.description}</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : !loadingStations && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Aucune gare trouvée</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );

  const renderStep2 = () => {
    return null; // Ne rien afficher pour l'étape 2
  };

  const renderStep2Old = () => (
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
        style={[styles.input, styles.textArea]}
        placeholder="Instructions spéciales (facultatif)"
        value={currentPackage.specialInstructions}
        onChangeText={(value) => handleInputChange('specialInstructions', value)}
        multiline
        numberOfLines={2}
      />
      
      <TouchableOpacity style={styles.addToCartButton} onPress={handleAddPackage}>
        <Text style={styles.addToCartButtonText}>Enregistrer colis</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('etape_3_recap')}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('info_generales')}</Text>

        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>{t('expediteur')}</Text>
          <Text style={styles.kvValue}>{orderData.senderName || '-'}</Text>
        </View>
        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>{t('qui_expedie_colis')}</Text>
          <Text style={styles.kvValue}>{orderData.senderPhone || '-'}</Text>
        </View>
        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>{t('ville')}</Text>
          <Text style={styles.kvValue}>{coteIvoireCities.find(city => city.value === orderData.senderCity)?.label || '-'}</Text>
        </View>
        {!!orderData.senderDistrict && (
          <View style={styles.kvRow}>
            <Text style={styles.kvLabel}>{t('quartier')}</Text>
            <Text style={styles.kvValue}>{orderData.senderDistrict}</Text>
          </View>
        )}
        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>Code du colis</Text>
          <Text style={styles.kvValue}>{orderData.packageCode || '-'}</Text>
        </View>
        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>Gare</Text>
          <Text style={styles.kvValue}>{orderData.senderName || '-'}</Text>
        </View>
        <View style={styles.kvDivider} />
        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>{t('adresse_livraison')}</Text>
          <Text style={styles.kvValue}>{orderData.deliveryAddress || '-'}</Text>
        </View>
        {orderData.distanceKm && (
          <View style={styles.kvRow}>
            <Text style={styles.kvLabel}>{t('distance_gare_livraison')}</Text>
            <Text style={[styles.kvValue, styles.distanceValue]}>{orderData.distanceKm} {t('km')}</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {packageCount} colis ajouté{packageCount !== 1 ? 's' : ''}
        </Text>

        {/* Affichage du code du colis principal */}
        {orderData.packageCode && (
          <View style={styles.packageCodeSection}>
            <Text style={styles.packageCodeLabel}>Code du colis :</Text>
            <Text style={styles.packageCodeValue}>{orderData.packageCode}</Text>
          </View>
        )}

        {orderData.packages.map((pkg, index) => {
          const pkgTypeLabel = packageTypes.find(type => type.value === pkg.packageType)?.label;
          return (
            <View key={index} style={styles.packageCard}>
              <View style={styles.packageHeader}>
                <Text style={styles.packageCode}>{pkg.packageCode}</Text>
                <TouchableOpacity onPress={() => handleRemovePackage(index)}>
                  <Text style={styles.removeLink}>Supprimer</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.packageDescription}>{pkg.packageDescription}</Text>
              <View style={styles.badgesRow}>
                {!!pkgTypeLabel && (
                  <View style={[styles.badge, styles.badgeInfo]}>
                    <Text style={styles.badgeText}>{pkgTypeLabel}</Text>
                  </View>
                )}
              </View>
              {!!pkg.specialInstructions && (
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>{pkg.specialInstructions}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Section de prix simplifiée */}
      {pricingInfo && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('prix_livraison')}</Text>
          
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>{t('type_livraison')}</Text>
            <View style={styles.pricingValueWithIcon}>
              {orderData.deliveryType === 'express' ? (
                <>
                  <MaterialCommunityIcons name="lightning-bolt" size={16} color="#FFD700" />
                  <Text style={styles.pricingValue}>{t('express_24h')}</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="truck-delivery" size={16} color={COLORS.primary} />
                  <Text style={styles.pricingValue}>{t('standard_72h')}</Text>
                </>
              )}
            </View>
          </View>
          
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>{t('distance')}</Text>
            <Text style={styles.pricingValue}>{pricingInfo.distanceKm} {t('km')}</Text>
          </View>
          
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>{t('prix_base')}</Text>
            <Text style={styles.pricingValue}>{PricingCalculator.formatPrice(pricingInfo.basePrice)}</Text>
          </View>

          {pricingInfo.expressCharge > 0 && (
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>{t('supplement_express')}</Text>
              <Text style={styles.pricingValue}>+{PricingCalculator.formatPrice(pricingInfo.expressCharge)}</Text>
            </View>
          )}

          <View style={styles.pricingDivider} />
          
          <View style={styles.pricingRow}>
            <Text style={styles.pricingTotalLabel}>{t('total_payer')}</Text>
            <Text style={styles.pricingTotalValue}>{PricingCalculator.formatPrice(pricingInfo.totalPrice)}</Text>
          </View>
          
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {currentStep > 1 && currentStep !== 2 && !showPackageModal && !showPackageChoiceModal && (
          <View style={styles.modernButtonContainer}>
            <TouchableOpacity style={styles.modernPreviousButton} onPress={handlePrevious}>
              <MaterialCommunityIcons name="chevron-left" size={18} color={COLORS.textSecondary} />
              <Text style={styles.modernPreviousButtonText}>{t('precedent')}</Text>
            </TouchableOpacity>
            
            {currentStep < totalSteps ? (
              <TouchableOpacity 
                style={[
                  styles.modernNextButton, 
                  !isStepValid() && styles.modernDisabledButton
                ]} 
                onPress={handleNext}
                disabled={!isStepValid()}
              >
                <Text style={[
                  styles.modernNextButtonText,
                  !isStepValid() && styles.modernDisabledButtonText
                ]}>{t('suivant')}</Text>
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={18} 
                  color={!isStepValid() ? COLORS.textSecondary : COLORS.white} 
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.modernNextButton, loading && styles.modernLoadingButton]} 
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />
                    <Text style={styles.modernNextButtonText}>Enregistrement...</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.white} />
                    <Text style={styles.modernNextButtonText}>{t('valider_commande')}</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal de sélection d'adresse sur carte */}
      <Modal
        visible={showMapModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity 
              style={styles.mapModalCloseButton}
              onPress={() => setShowMapModal(false)}
            >
              <MaterialCommunityIcons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.mapModalTitle}>Sélectionner l'adresse de livraison</Text>
            <View style={styles.mapModalSpacer} />
          </View>
            <OSMSearchMap 
              fullscreen={true}
              onLocationSelect={handleMapSelection}
              showLocationCards={true}
            />
        </View>
      </Modal>

      {/* Modal optimisé - Localisation (Gare + Lieu de livraison + Provenance) */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="none"
        onRequestClose={hideLocationModalPopup}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.popupModalContainer,
              { transform: [{ translateY: locationSlideAnim }] }
            ]}
          >
            <View style={styles.popupContent}>
              {/* Logo PAKO */}
              <View style={styles.pakoLogoContainer}>
                <Text style={styles.pakoLogoText}>PAKO</Text>
              </View>
              
              <View style={styles.popupHeader}>
                <Text style={styles.popupTitle}>Informations de localisation</Text>
                <Text style={styles.popupSubtitle}>{t('remplissez_info_localisation')}</Text>
              </View>

              <ScrollView style={styles.popupScrollView} showsVerticalScrollIndicator={false}>
                {/* Section Gare */}
                <View style={styles.popupSection}>
                  <Text style={styles.popupSectionTitle}>Gare de récupération</Text>
                  <TouchableOpacity 
                    style={styles.stationSelector}
                    onPress={() => {
                      // Ouvrir le modal de sélection de gare
                      setShowStationModal(true);
                    }}
                  >
                    <Text style={[
                      styles.stationSelectorText,
                      orderData.destinationStation ? styles.stationSelectorTextSelected : styles.stationSelectorTextPlaceholder
                    ]}>
                      {orderData.destinationStation || 'Sélectionner une gare'}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Section Lieu de livraison */}
                <View style={styles.popupSection}>
                  <Text style={styles.popupSectionTitle}>Lieu de livraison</Text>
                  <TouchableOpacity 
                    style={styles.addressSelector}
                    onPress={handleGetCurrentLocation}
                  >
                    <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
                    <Text style={[
                      styles.addressSelectorText,
                      orderData.deliveryAddress ? styles.addressSelectorTextSelected : styles.addressSelectorTextPlaceholder
                    ]}>
                      {orderData.deliveryAddress || 'Sélectionner le lieu de livraison'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Section Provenance */}
                <View style={styles.popupSection}>
                  <Text style={styles.popupSectionTitle}>D'où vient le colis ?</Text>
                  <TouchableOpacity 
                    style={styles.citySelector}
                    onPress={() => setShowCityModal(true)}
                  >
                    <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
                    <Text style={[
                      styles.citySelectorText,
                      orderData.senderCity ? styles.citySelectorTextSelected : styles.citySelectorTextPlaceholder
                    ]}>
                      {orderData.senderCity || 'Sélectionner la localité'}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <View style={styles.popupButtonContainer}>
                <TouchableOpacity 
                  style={styles.popupCancelButton} 
                  onPress={hideLocationModalPopup}
                >
                  <Text style={styles.popupCancelButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.popupNextButton} 
                  onPress={handleLocationModalNext}
                >
                  <Text style={styles.popupNextButtonText}>{t('suivant')}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal optimisé - Détails (Destinataire + Code colis + Téléphone expéditeur) */}
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="none"
        onRequestClose={hideDetailsModalPopup}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.popupModalContainer,
              { transform: [{ translateY: detailsSlideAnim }] }
            ]}
          >
            <View style={styles.popupContent}>
              {/* Logo PAKO */}
              <View style={styles.pakoLogoContainer}>
                <Text style={styles.pakoLogoText}>PAKO</Text>
              </View>
              
              <View style={styles.popupHeader}>
                <Text style={styles.popupTitle}>Détails de la commande</Text>
                <Text style={styles.popupSubtitle}>{t('completez_info_commande')}</Text>
              </View>

              <ScrollView style={styles.popupScrollView} showsVerticalScrollIndicator={false}>
                {/* Section Destinataire */}
                <View style={styles.popupSection}>
                  <Text style={styles.popupSectionTitle}>Qui va recevoir le colis ?</Text>
                  <TouchableOpacity 
                    style={styles.recipientSelector}
                    onPress={() => {
                      // Marquer qu'on sélectionne le destinataire (pas l'expéditeur)
                      setOrderData(prev => ({ ...prev, isSelectingSenderPhone: false }));
                      setShowContactModal(true);
                    }}
                  >
                    <MaterialCommunityIcons name="account" size={20} color={COLORS.primary} />
                    <Text style={[
                      styles.recipientSelectorText,
                      (orderData.selectedRecipientName || orderData.selectedRecipientName === 'Moi') ? styles.recipientSelectorTextSelected : styles.recipientSelectorTextPlaceholder
                    ]}>
                      {orderData.selectedRecipientName || 'Sélectionner qui va recevoir le colis'}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Section Code colis */}
                <View style={styles.popupSection}>
                  <Text style={styles.popupSectionTitle}>Code du colis</Text>
                  <TextInput
                    style={styles.popupInput}
                    placeholder="Code du colis * (ex: ABC123)"
                    value={orderData.packageCode}
                    onChangeText={(value) => setOrderData(prev => ({ ...prev, packageCode: value.toUpperCase() }))}
                    autoCapitalize="characters"
                  />
                  
                  {/* Bouton Ajouter un autre colis */}
                  <TouchableOpacity 
                    style={[
                      styles.addAnotherPackageButton,
                      !orderData.packageCode && styles.addAnotherPackageButtonDisabled
                    ]}
                    onPress={() => {
                      if (orderData.packageCode) {
                        handleAddPackageFromCode(orderData.packageCode);
                        // Vider le champ après chaque ajout car la validation ne dépend plus du champ
                        setOrderData(prev => ({ ...prev, packageCode: '' }));
                      }
                    }}
                    disabled={!orderData.packageCode}
                  >
                    <MaterialCommunityIcons name="plus-circle" size={20} color={orderData.packageCode ? COLORS.white : '#ccc'} />
                    <Text style={[
                      styles.addAnotherPackageButtonText,
                      !orderData.packageCode && styles.addAnotherPackageButtonTextDisabled
                    ]}>
                      {t('ajouter_autre_colis')} ({packageCount + 1})
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Section Téléphone expéditeur */}
                <View style={styles.popupSection}>
                  <Text style={styles.popupSectionTitle}>Qui expédie le colis?</Text>
                  <TouchableOpacity 
                    style={styles.senderPhoneSelector}
                    onPress={() => {
                      // Marquer qu'on sélectionne le téléphone de l'expéditeur
                      setOrderData(prev => ({ ...prev, isSelectingSenderPhone: true }));
                      setShowContactModal(true);
                    }}
                  >
                    <MaterialCommunityIcons name="phone" size={20} color={COLORS.primary} />
                    <Text style={[
                      styles.senderPhoneSelectorText,
                      orderData.senderPhone ? styles.senderPhoneSelectorTextSelected : styles.senderPhoneSelectorTextPlaceholder
                    ]}>
                      {orderData.senderPhone || 'Sélectionner un contact'}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <View style={styles.detailsButtonContainer}>
                <TouchableOpacity 
                  style={styles.detailsPreviousButton} 
                  onPress={() => {
                    closeDetailsModalPopup();
                    setTimeout(() => {
                      showLocationModalPopup();
                    }, 300);
                  }}
                >
                  <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.primary} />
                  <Text style={styles.detailsPreviousButtonText}>Retour</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.detailsNextButton} 
                  onPress={handleDetailsModalNext}
                >
                  <Text style={styles.detailsNextButtonText}>Terminer</Text>
                  <MaterialCommunityIcons name="check-circle" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal de sélection de gare - Design amélioré */}
      <Modal
        visible={showStationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={hideStationModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.stationModalContainer}>
            {/* Header avec gradient */}
            <View style={styles.stationModalHeader}>
              <View style={styles.stationModalTitleContainer}>
                <MaterialCommunityIcons name="train" size={24} color={COLORS.primary} />
                <Text style={styles.stationModalTitle}>Choisir votre gare</Text>
              </View>
              <TouchableOpacity 
                style={styles.stationModalCloseButton}
                onPress={hideStationModal}
              >
                <MaterialCommunityIcons name="close-circle" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher une gare..."
                placeholderTextColor={COLORS.textSecondary}
                value={stationSearchText}
                onChangeText={setStationSearchText}
              />
            </View>
            
            {/* Liste des gares avec design moderne */}
            <ScrollView style={styles.stationModalContent} showsVerticalScrollIndicator={false}>
              {loadingStations ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Chargement des gares...</Text>
                </View>
              ) : osmStations.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="train-variant" size={64} color={COLORS.textSecondary} />
                  <Text style={styles.emptyText}>Aucune gare disponible</Text>
                  <Text style={styles.emptySubtext}>Vérifiez votre connexion internet</Text>
                </View>
              ) : (
                osmStations
                  .filter(station => 
                    station.label.toLowerCase().includes(stationSearchText.toLowerCase()) ||
                    station.description.toLowerCase().includes(stationSearchText.toLowerCase())
                  )
                  .map((station, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.stationCard}
                    onPress={() => {
                      setOrderData(prev => ({
                        ...prev,
                        destinationStation: station.label,
                        stationLatitude: station.latitude || station.lat,
                        stationLongitude: station.longitude || station.lon,
                      }));
                      hideStationModal();
                    }}
                  >
                    <View style={styles.stationCardLeft}>
                      <View style={styles.stationIconContainer}>
                        <MaterialCommunityIcons name="train" size={28} color="white" />
                      </View>
                    </View>
                    
                    <View style={styles.stationCardContent}>
                      <Text style={styles.stationCardTitle}>{station.label}</Text>
                      {station.description && (
                        <Text style={styles.stationCardDescription}>{station.description}</Text>
                      )}
                      <View style={styles.stationCardFooter}>
                        <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.primary} />
                        <Text style={styles.stationCardLocation}>Abidjan, Côte d'Ivoire</Text>
                      </View>
                    </View>
                    
                    <View style={styles.stationCardRight}>
                      <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
                    </View>
                  </TouchableOpacity>
                  ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de sélection de ville */}
      <Modal
        visible={showCityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cityModalContainer}>
            {/* Header */}
            <View style={styles.cityModalHeader}>
              <View style={styles.cityModalTitleContainer}>
                <MaterialCommunityIcons name="map-marker" size={24} color={COLORS.primary} />
                <Text style={styles.cityModalTitle}>Choisir la localité</Text>
              </View>
              <TouchableOpacity 
                style={styles.cityModalCloseButton}
                onPress={() => setShowCityModal(false)}
              >
                <MaterialCommunityIcons name="close-circle" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {/* Liste des villes */}
            <ScrollView style={styles.cityModalContent} showsVerticalScrollIndicator={false}>
              {coteIvoireCities.map((city, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.cityCard}
                  onPress={() => {
                    setOrderData(prev => ({
                      ...prev,
                      senderCity: city.label,
                    }));
                    setShowCityModal(false);
                  }}
                >
                  <View style={styles.cityCardLeft}>
                    <View style={styles.cityIconContainer}>
                      <MaterialCommunityIcons name="city" size={24} color="white" />
                    </View>
                  </View>
                  
                  <View style={styles.cityCardContent}>
                    <Text style={styles.cityCardTitle}>{city.label}</Text>
                    <Text style={styles.cityCardDescription}>{city.description}</Text>
                  </View>
                  
                  <View style={styles.cityCardRight}>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal d'erreur personnalisé */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Erreur</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de succès animé */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="none"
        onRequestClose={hideSuccessModal}
      >
        <View style={styles.successModalOverlay}>
          <TouchableOpacity 
            style={styles.successModalBackdrop} 
            activeOpacity={1} 
            onPress={hideSuccessModal}
          />
          <Animated.View 
            style={[
              styles.successModalContainer,
              {
                transform: [{ translateY: successSlideAnim }]
              }
            ]}
          >
            <View style={styles.successModalHeader}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={60} 
                color="#4CAF50" 
                style={styles.successIcon}
              />
              <Text style={styles.successModalTitle}>Félicitations !</Text>
            </View>
            
            <View style={styles.successModalContent}>
              <Text style={styles.successModalMessage}>Votre commande a été prise en compte.</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.successModalButton}
              onPress={hideSuccessModal}
            >
              <Text style={styles.successModalButtonText}>OK</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal des popups séquentiels */}
      <Modal
        visible={showPopupModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => {}}
        presentationStyle="overFullScreen"
      >
        <KeyboardAvoidingView 
          style={styles.popupModalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <Animated.View 
            style={[
              styles.popupModalContainer,
              {
                transform: [{ translateY: popupSlideAnim }]
              }
            ]}
          >
            {/* Handle du drawer */}
            <View style={styles.drawerHandle} />
            
            {/* Logo PAKO */}
            <View style={styles.pakoLogoContainer}>
              <Text style={styles.pakoLogoText}>PAKO</Text>
            </View>
            
            {/* Étape 0: Nom expéditeur */}
            {currentPopupStep === 0 && (
              <>
                <View style={styles.popupHeader}>
                  <Text style={styles.popupTitle}>Gare où l'on va récupérer le colis</Text>
                  <Text style={styles.popupStep}>1/6</Text>
                </View>
                <View style={styles.popupContent}>
                  <TouchableOpacity 
                    style={styles.popupInput}
                    onPress={() => setShowAbidjanStationSelector(!showAbidjanStationSelector)}
                  >
                    <Text style={[
                      styles.popupInputText,
                      !orderData.senderName && styles.placeholderText
                    ]}>
                      {orderData.senderName || 'Choisissez la gare'}
                    </Text>
                    <Text style={styles.dropdownIcon}>
                      {showAbidjanStationSelector ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>
                  
                  {showAbidjanStationSelector && (
                    <ScrollView style={styles.abidjanStationOptions} nestedScrollEnabled={true}>
                      <View style={styles.stationCategoryHeader}>
                        <MaterialCommunityIcons name="bus" size={20} color={COLORS.primary} />
                        <Text style={styles.stationCategoryTitle}>Gares d'Abidjan</Text>
                      </View>
                      {abidjanStations.map((station) => (
                        <TouchableOpacity
                          key={station.value}
                          style={[
                            styles.stationOption,
                            orderData.senderName === station.label && styles.selectedStation
                          ]}
                          onPress={() => handleAbidjanStationSelect(station.value)}
                        >
                          <View style={styles.stationOptionHeader}>
                    <MaterialCommunityIcons name="bus" size={16} color={COLORS.primary} />
                    <Text style={styles.stationOptionLabel}>{station.label}</Text>
                  </View>
                          <Text style={styles.stationOptionDescription}>{station.description}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
                <View style={styles.popupActions}>
                  <TouchableOpacity 
                    style={styles.popupBackButton}
                    onPress={hidePopupModal}
                  >
                    <Text style={styles.popupBackButtonText}>{t('cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.popupNextButton,
                      !validatePopupStep(0) && styles.popupNextButtonDisabled
                    ]}
                    onPress={showNextPopup}
                    disabled={!validatePopupStep(0)}
                  >
                    <Text style={[
                      styles.popupNextButtonText,
                      !validatePopupStep(0) && styles.popupNextButtonTextDisabled
                    ]}>
                      {t('suivant')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Étape 1: Lieu de livraison */}
            {currentPopupStep === 1 && (
              <>
                <View style={styles.popupHeader}>
                  <Text style={styles.popupTitle}>Lieu de livraison</Text>
                  <Text style={styles.popupStep}>3/6</Text>
                </View>
                <View style={styles.popupContent}>
                  <TouchableOpacity 
                    style={styles.popupSelector}
                    onPress={() => setShowMapModal(true)}
                  >
                    <Text style={[
                      styles.popupSelectorText,
                      !orderData.deliveryAddress && styles.popupPlaceholderText
                    ]}>
                      {orderData.deliveryAddress || 'Sélectionner l\'adresse de livraison'}
                    </Text>
                    <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} style={styles.popupSelectorIcon} />
                  </TouchableOpacity>
                </View>
                <View style={styles.popupActions}>
                  <TouchableOpacity 
                    style={styles.popupBackButton}
                    onPress={showPreviousPopup}
                  >
                    <Text style={styles.popupBackButtonText}>{t('precedent')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.popupNextButton,
                      !validatePopupStep(1) && styles.popupNextButtonDisabled
                    ]}
                    onPress={showNextPopup}
                    disabled={!validatePopupStep(1)}
                  >
                    <Text style={[
                      styles.popupNextButtonText,
                      !validatePopupStep(1) && styles.popupNextButtonTextDisabled
                    ]}>
                      {t('suivant')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Étape 2: Sélection du destinataire */}
            {currentPopupStep === 2 && (
              <>
                <View style={styles.popupHeader}>
                  <Text style={styles.popupTitle}>Qui va recevoir le colis ?</Text>
                  <Text style={styles.popupStep}>2/6</Text>
                </View>
                <View style={styles.popupContent}>
                  {/* Bouton pour sélectionner un contact */}
                  <TouchableOpacity 
                    style={styles.popupContactSelector}
                    onPress={() => {
                      fetchAndShowContacts('recipient');
                    }}
                  >
                    <Text style={styles.popupContactSelectorText}>
                      {orderData.selectedRecipientPhone ? 
                        `${orderData.selectedRecipientName} - ${orderData.selectedRecipientPhone}` : 
                        'Sélectionner un contact'}
                    </Text>
                    <Text style={styles.popupContactSelectorIcon}>👤</Text>
                  </TouchableOpacity>

                  {/* Placeholder "Moi" */}
                  <TouchableOpacity 
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: orderData.selectedRecipientName === 'Moi' ? '#4CAF50' : '#e8f5e8',
                      borderRadius: 8,
                      paddingHorizontal: 15,
                      paddingVertical: 12,
                      marginTop: 10,
                      marginBottom: 10,
                      borderWidth: 2,
                      borderColor: orderData.selectedRecipientName === 'Moi' ? '#2E7D32' : '#4CAF50',
                    }}
                    onPress={() => handleRecipientSelect('Moi', orderData.senderPhone || 'moi')}
                  >
                    <Text style={{
                      flex: 1,
                      fontSize: 16,
                      color: orderData.selectedRecipientName === 'Moi' ? '#FFFFFF' : '#2E7D32',
                      fontWeight: '600',
                    }}>Moi</Text>
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: orderData.selectedRecipientName === 'Moi' ? '#FFFFFF' : '#2E7D32',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      {orderData.selectedRecipientName === 'Moi' && (
                        <View style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: '#FFFFFF',
                        }} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Message d'information */}
                  <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
                    <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 }}>
                      Choisissez qui va recevoir le colis ou sélectionnez "Moi"
                    </Text>
                  </View>
                </View>
                <View style={styles.popupActions}>
                  <TouchableOpacity 
                    style={styles.popupBackButton}
                    onPress={showPreviousPopup}
                  >
                    <Text style={styles.popupBackButtonText}>{t('precedent')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.popupNextButton,
                      !validatePopupStep(2) && styles.popupNextButtonDisabled
                    ]}
                    onPress={showNextPopup}
                    disabled={!validatePopupStep(2)}
                  >
                    <Text style={[
                      styles.popupNextButtonText,
                      !validatePopupStep(2) && styles.popupNextButtonTextDisabled
                    ]}>
                      {t('suivant')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Étape 3: Ville de provenance */}
            {currentPopupStep === 3 && (
              <>
                <View style={styles.popupHeader}>
                  <Text style={styles.popupTitle}>D'où vient le colis ?</Text>
                  <Text style={styles.popupStep}>4/6</Text>
                </View>
                <View style={styles.popupContent}>
                  <TouchableOpacity 
                    style={styles.popupSelector}
                    onPress={() => setShowCitySelector(!showCitySelector)}
                  >
                    <Text style={[
                      styles.popupSelectorText,
                      !orderData.senderCity && styles.popupPlaceholderText
                    ]}>
                      {orderData.senderCity 
                        ? coteIvoireCities.find(city => city.value === orderData.senderCity)?.label 
                        : t('ville_origine_colis')
                      }
                    </Text>
                    <Text style={styles.popupSelectorIcon}>
                      {showCitySelector ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>
                  
                  {showCitySelector && (
                    <View style={styles.popupOptionsContainer}>
                      <ScrollView 
                        style={styles.popupOptionsScroll}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                      >
                        {coteIvoireCities.map((city) => (
                          <TouchableOpacity
                            key={city.value}
                            style={[
                              styles.popupOption,
                              orderData.senderCity === city.value && styles.popupOptionSelected
                            ]}
                            onPress={() => {
                              handleCitySelect(city.value);
                              setShowCitySelector(false);
                            }}
                          >
                            <Text style={styles.popupOptionText}>{city.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
                <View style={styles.popupActions}>
                  <TouchableOpacity 
                    style={styles.popupBackButton}
                    onPress={showPreviousPopup}
                  >
                    <Text style={styles.popupBackButtonText}>{t('precedent')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.popupNextButton,
                      !validatePopupStep(3) && styles.popupNextButtonDisabled
                    ]}
                    onPress={showNextPopup}
                    disabled={!validatePopupStep(3)}
                  >
                    <Text style={[
                      styles.popupNextButtonText,
                      !validatePopupStep(3) && styles.popupNextButtonTextDisabled
                    ]}>
                      {t('suivant')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Étape 4: Code du colis */}
            {currentPopupStep === 4 && (
              <>
                <View style={styles.popupHeader}>
                  <Text style={styles.popupTitle}>Code du colis</Text>
                  <View style={styles.popupHeaderRight}>
                    <Text style={styles.packageCounter}>
                      {packageCount} colis ajouté{packageCount !== 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.popupStep}>5/6</Text>
                  </View>
                </View>
                <View style={[styles.popupContent, styles.popupContentLarge]}>
                  <Text style={styles.popupDescription}>
                    Entrez le code de votre colis. Un code = 1 colis.
                  </Text>
                  <TextInput
                    style={[styles.popupInput, styles.popupInputLarge]}
                    placeholder="Entrez le code du colis (ex: ABC123)"
                    value={orderData.packageCode || ''}
                    onChangeText={(value) => handleOrderInputChange('packageCode', value.toUpperCase())}
                    autoCapitalize="characters"
                  />
                  
                  {/* Bouton Ajouter un autre colis */}
                  <TouchableOpacity 
                    style={styles.addAnotherPackageButton}
                    onPress={() => {
                      if (orderData.packageCode) {
                        handleAddPackageFromCode(orderData.packageCode);
                        handleOrderInputChange('packageCode', '');
                      }
                    }}
                    disabled={!orderData.packageCode}
                  >
                    <MaterialCommunityIcons name="plus-circle" size={20} color={orderData.packageCode ? COLORS.primary : '#ccc'} />
                    <Text style={[
                      styles.addAnotherPackageButtonText,
                      !orderData.packageCode && styles.addAnotherPackageButtonTextDisabled
                    ]}>
                      {t('ajouter_autre_colis')} ({packageCount + 1})
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.popupActions}>
                  <TouchableOpacity 
                    style={styles.popupBackButton}
                    onPress={showPreviousPopup}
                  >
                    <Text style={styles.popupBackButtonText}>{t('precedent')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.popupNextButton,
                      !validatePopupStep(4) && styles.popupNextButtonDisabled
                    ]}
                    onPress={showNextPopup}
                    disabled={!validatePopupStep(4)}
                  >
                    <Text style={[
                      styles.popupNextButtonText,
                      !validatePopupStep(4) && styles.popupNextButtonTextDisabled
                    ]}>
                      {t('suivant')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Étape 5: Téléphone expéditeur */}
            {currentPopupStep === 5 && (
              <>
                <View style={styles.popupHeader}>
                  <Text style={styles.popupTitle}>Qui expédie le colis?</Text>
                  <Text style={styles.popupStep}>6/6</Text>
                </View>
                <View style={styles.popupContent}>
                  <TouchableOpacity 
                    style={styles.popupInput}
                    onPress={() => {
                      fetchAndShowContacts('sender');
                    }}
                  >
                    <MaterialCommunityIcons name="contacts" size={20} color={COLORS.primary} style={styles.contactSelectorIcon} />
                    <Text style={[
                      styles.popupInputText,
                      !orderData.senderPhone && styles.placeholderText
                    ]}>
                      {orderData.senderPhone || 'Sélectionner un contact'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.popupActions}>
                  <TouchableOpacity 
                    style={styles.popupBackButton}
                    onPress={showPreviousPopup}
                  >
                    <Text style={styles.popupBackButtonText}>{t('precedent')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.popupNextButton,
                      !validatePopupStep(5) && styles.popupNextButtonDisabled
                    ]}
                    onPress={showNextPopup}
                    disabled={!validatePopupStep(5)}
                  >
                    <Text style={[
                      styles.popupNextButtonText,
                      !validatePopupStep(5) && styles.popupNextButtonTextDisabled
                    ]}>
                      {t('suivant')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal des popups de colis */}
      <Modal
        visible={showPackageModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => {}}
        presentationStyle="overFullScreen"
      >
        <KeyboardAvoidingView 
          style={styles.popupModalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <Animated.View 
            style={[
              styles.popupModalContainer,
              {
                transform: [{ translateY: packageSlideAnim }]
              }
            ]}
          >
            {/* Handle du drawer */}
            <View style={styles.drawerHandle} />
            
            {/* Logo PAKO */}
            <View style={styles.pakoLogoContainer}>
              <Text style={styles.pakoLogoText}>PAKO</Text>
            </View>
            
            {/* Étape 0: Type de livraison */}
            {currentPackageStep === 0 && (
              <>
                <View style={styles.popupHeader}>
                  <Text style={styles.popupTitle}>{t('type_livraison')}</Text>
                </View>
                <View style={styles.popupContent}>
                  <Text style={styles.deliveryTypeLabel}>Choisissez le type de livraison :</Text>
                  
                  {/* Option Standard */}
                  <TouchableOpacity 
                    style={[
                      styles.deliveryTypeOption,
                      orderData.deliveryType === 'standard' && styles.deliveryTypeOptionSelected
                    ]}
                    onPress={() => {
                      setOrderData(prev => ({ ...prev, deliveryType: 'standard' }));
                    }}
                  >
                    <View style={styles.deliveryTypeInfo}>
                      <View style={styles.deliveryTypeHeader}>
                        <View style={styles.deliveryTypeNameContainer}>
                          <MaterialCommunityIcons name="truck-delivery" size={20} color={COLORS.primary} />
                          <Text style={styles.deliveryTypeName}>{t('standard')}</Text>
                        </View>
                        <Text style={styles.deliveryTypePrice}>{t('prix_normal')}</Text>
                      </View>
                      <Text style={styles.deliveryTypeDescription}>Livraison en 72h</Text>
                    </View>
                    <View style={styles.radioButton}>
                      {orderData.deliveryType === 'standard' && (
                        <View style={styles.radioButtonSelected} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Option Express */}
                  <TouchableOpacity 
                    style={[
                      styles.deliveryTypeOption,
                      orderData.deliveryType === 'express' && styles.deliveryTypeOptionSelected
                    ]}
                    onPress={() => {
                      setOrderData(prev => ({ ...prev, deliveryType: 'express' }));
                    }}
                  >
                    <View style={styles.deliveryTypeInfo}>
                      <View style={styles.deliveryTypeHeader}>
                        <View style={styles.deliveryTypeNameContainer}>
                          <MaterialCommunityIcons name="lightning-bolt" size={20} color="#FFD700" />
                          <Text style={styles.deliveryTypeName}>{t('express')}</Text>
                        </View>
                        <Text style={styles.deliveryTypePriceExtra}>+2000 FCFA</Text>
                      </View>
                      <Text style={styles.deliveryTypeDescription}>Livraison en moins de 24h</Text>
                    </View>
                    <View style={styles.radioButton}>
                      {orderData.deliveryType === 'express' && (
                        <View style={styles.radioButtonSelected} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Section Mode de paiement */}
                  <View style={styles.paymentSection}>
                    <Text style={styles.paymentLabel}>Mode de paiement :</Text>
                    
                    <TouchableOpacity 
                      style={styles.paymentSelector}
                      onPress={() => setShowPaymentModal(true)}
                    >
                      <Text style={[
                        styles.paymentSelectorText,
                        orderData.paymentMethod ? styles.paymentSelectorTextSelected : styles.paymentSelectorTextPlaceholder
                      ]}>
                        {orderData.paymentMethod ? 
                          (orderData.paymentMethod === 'cash' ? 'Espèces' : 
                           orderData.paymentMethod === 'wave' ? 'Wave' : 'Orange Money') 
                          : 'Sélectionner un mode de paiement'
                        }
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.popupActions}>
                  <TouchableOpacity 
                    style={styles.popupBackButton}
                    onPress={() => {
                      hidePackageModal();
                      setCurrentStep(2);
                      setTimeout(() => {
                        showDetailsModalPopup();
                      }, 150); // Réduit de 300ms à 150ms
                    }}
                  >
                    <Text style={styles.popupBackButtonText}>Retour</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.popupNextButton,
                      (!orderData.deliveryType || !orderData.paymentMethod) && styles.popupNextButtonDisabled
                    ]}
                    onPress={() => {
                      if (orderData.deliveryType && orderData.paymentMethod) {
                        hidePackageModal();
                        setCurrentStep(3);
                      }
                    }}
                    disabled={!orderData.deliveryType || !orderData.paymentMethod}
                  >
                    <Text style={[
                      styles.popupNextButtonText,
                      (!orderData.deliveryType || !orderData.paymentMethod) && styles.popupNextButtonTextDisabled
                    ]}>
                      {t('suivant')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de choix après ajout de colis */}
      <Modal
        visible={showPackageChoiceModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => {}}
      >
        <View style={styles.popupModalOverlay}>
          <View style={styles.popupModalBackdrop} />
          <Animated.View 
            style={[
              styles.popupModalContainer,
              {
                transform: [{ translateY: packageChoiceSlideAnim }]
              }
            ]}
          >
            {/* Handle du drawer */}
            <View style={styles.drawerHandle} />
            
            {/* Logo PAKO */}
            <View style={styles.pakoLogoContainer}>
              <Text style={styles.pakoLogoText}>PAKO</Text>
            </View>
            
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>{t('commande_creee_success')}</Text>
            </View>
            
            <View style={styles.popupContent}>
              <Text style={styles.popupMessage}>
                Votre colis a été ajouté avec succès à la commande. 
                Vous pouvez maintenant valider votre commande ou ajouter un autre colis.
              </Text>
              
              <View style={styles.packageChoiceButtons}>
                <TouchableOpacity 
                  style={styles.packageChoiceButton}
                  onPress={handleValidateOrder}
                >
                  <Text style={styles.packageChoiceButtonText}>🎉 {t('valider_commande')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.packageChoiceButton, styles.packageChoiceButtonSecondary]}
                  onPress={handleAddAnotherPackage}
                >
                  <Text style={[styles.packageChoiceButtonText, styles.packageChoiceButtonTextSecondary]}>
                    📦 {t('ajouter_autre_colis')} ({packageCount + 1})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal de sélection du mode de paiement */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.paymentModalOverlay}>
          <View style={styles.paymentModalContainer}>
            {/* Header */}
            <View style={styles.paymentModalHeader}>
              <Text style={styles.paymentModalTitle}>Mode de paiement</Text>
              <TouchableOpacity 
                style={styles.paymentModalCloseButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.paymentModalContent}>
              {/* Option Espèces */}
              <TouchableOpacity 
                style={[
                  styles.paymentModalOption,
                  orderData.paymentMethod === 'cash' && styles.paymentModalOptionSelected
                ]}
                onPress={() => {
                  setOrderData(prev => ({ ...prev, paymentMethod: 'cash' }));
                  setShowPaymentModal(false);
                }}
              >
                <View style={styles.paymentModalOptionLeft}>
                  <View style={styles.paymentModalIconContainer}>
                    <MaterialCommunityIcons name="cash" size={24} color="#4CAF50" />
                  </View>
                  <View style={styles.paymentModalOptionContent}>
                    <Text style={styles.paymentModalOptionTitle}>Espèces</Text>
                    <Text style={styles.paymentModalOptionDescription}>Paiement à la livraison</Text>
                  </View>
                </View>
                <View style={styles.paymentModalOptionRight}>
                  {orderData.paymentMethod === 'cash' && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Option Wave */}
              <TouchableOpacity 
                style={[
                  styles.paymentModalOption,
                  orderData.paymentMethod === 'wave' && styles.paymentModalOptionSelected
                ]}
                onPress={() => {
                  setOrderData(prev => ({ ...prev, paymentMethod: 'wave' }));
                  setShowPaymentModal(false);
                }}
              >
                <View style={styles.paymentModalOptionLeft}>
                  <View style={styles.paymentModalIconContainer}>
                    <MaterialCommunityIcons name="cellphone" size={24} color="#FF6B35" />
                  </View>
                  <View style={styles.paymentModalOptionContent}>
                    <Text style={styles.paymentModalOptionTitle}>Wave</Text>
                    <Text style={styles.paymentModalOptionDescription}>Paiement mobile Wave</Text>
                  </View>
                </View>
                <View style={styles.paymentModalOptionRight}>
                  {orderData.paymentMethod === 'wave' && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Option Orange Money */}
              <TouchableOpacity 
                style={[
                  styles.paymentModalOption,
                  orderData.paymentMethod === 'orange' && styles.paymentModalOptionSelected
                ]}
                onPress={() => {
                  setOrderData(prev => ({ ...prev, paymentMethod: 'orange' }));
                  setShowPaymentModal(false);
                }}
              >
                <View style={styles.paymentModalOptionLeft}>
                  <View style={styles.paymentModalIconContainer}>
                    <MaterialCommunityIcons name="cellphone-message" size={24} color="#FF8C00" />
                  </View>
                  <View style={styles.paymentModalOptionContent}>
                    <Text style={styles.paymentModalOptionTitle}>Orange Money</Text>
                    <Text style={styles.paymentModalOptionDescription}>Paiement mobile Orange</Text>
                  </View>
                </View>
                <View style={styles.paymentModalOptionRight}>
                  {orderData.paymentMethod === 'orange' && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de sélection des contacts */}
      <Modal
        visible={showContactModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.contactModalOverlay}>
          <View style={styles.contactModalContainer}>
            {/* Header */}
            <View style={styles.contactModalHeader}>
              <Text style={styles.contactModalTitle}>
                Expéditeur
              </Text>
              <TouchableOpacity 
                style={styles.contactModalCloseButton}
                onPress={() => setShowContactModal(false)}
              >
                <MaterialCommunityIcons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Barre de recherche */}
            <View style={styles.contactSearchContainer}>
              <TextInput
                style={styles.contactSearchInput}
                placeholder="Saisissez un nom ou un numéro de téléphone"
                value={contactSearchText}
                onChangeText={setContactSearchText}
                placeholderTextColor="#999"
              />
            </View>

            {/* Liste des contacts */}
            <ScrollView style={styles.contactList}>
              {loadingContacts ? (
                <View style={styles.contactLoadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.contactLoadingText}>Chargement des contacts...</Text>
                </View>
              ) : (
                <>
                  {/* Option "Moi" en haut pour la sélection de destinataire */}
                  {!orderData.isSelectingSenderPhone && (
                    <TouchableOpacity
                      style={[
                        styles.contactItem,
                        orderData.selectedRecipientName === 'Moi' && styles.contactItemSelected
                      ]}
                      onPress={() => {
                        setOrderData(prev => ({
                          ...prev,
                          selectedRecipientName: 'Moi',
                          selectedRecipientPhone: ''
                        }));
                        setShowContactModal(false);
                        setContactSearchText('');
                      }}
                    >
                      <View style={styles.contactAvatar}>
                        <MaterialCommunityIcons name="account" size={24} color="white" />
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={[
                          styles.contactName,
                          orderData.selectedRecipientName === 'Moi' && styles.contactNameSelected
                        ]}>
                          Moi
                        </Text>
                        <Text style={styles.contactPhone}>Vous-même</Text>
                      </View>
                      {orderData.selectedRecipientName === 'Moi' && (
                        <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  )}
                  
                  {/* Liste des contacts */}
                  {filteredContacts.length === 0 ? (
                <View style={styles.contactEmptyContainer}>
                  <Text style={styles.contactEmptyText}>
                    {contactSearchText ? 'Aucun contact trouvé' : 'Aucun contact disponible'}
                  </Text>
                </View>
              ) : (
                filteredContacts.map((contact, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.contactItem}
                  onPress={() => {
                    if (contactModalType === 'sender') {
                      handleContactSelect(contact);
                    } else {
                      handleRecipientSelect(
                        contact.name || contact.firstName || 'Contact',
                        contact.phoneNumbers?.[0]?.number || ''
                      );
                      setShowContactModal(false);
                    }
                  }}
                >
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>
                      {contact.name || contact.firstName || 'Contact'}
                    </Text>
                    <Text style={styles.contactPhone}>
                      {contact.phoneNumbers?.[0]?.number || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.contactRadio}>
                    <View style={styles.radioButton}>
                      {(contactModalType === 'sender' ? 
                        orderData.senderPhone === contact.phoneNumbers?.[0]?.number?.replace(/\D/g, '') :
                        orderData.selectedRecipientPhone === contact.phoneNumbers?.[0]?.number?.replace(/\D/g, '')
                      ) && (
                        <View style={styles.radioButtonSelected} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                ))
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
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
    paddingVertical: 10,
    marginTop: -28,
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
    // Empty style for ScrollView container to avoid flex constraints blocking scroll
  },
  contentContainer: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  stepContainer: {
    paddingVertical: 12,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
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
  stationOptions: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    maxHeight: 300,
    overflow: 'hidden',
  },
  stationCategoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  cityOptions: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    maxHeight: 200,
    overflow: 'hidden',
  },
  cityScrollView: {
    maxHeight: 150,
  },
  cityOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedCity: {
    backgroundColor: COLORS.primary + '20',
  },
  cityOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cityOptionDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  searchBarContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    fontSize: 18,
    color: '#666666',
    marginRight: 12,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  mapButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  mapButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  suggestionsContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 12,
    color: COLORS.primary,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 18,
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  kvLabel: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  kvValue: {
    flex: 1,
    textAlign: 'right',
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  distanceValue: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  kvDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 8,
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
  packageCodeSection: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  packageCodeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  packageCodeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'monospace',
  },
  packageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  packageCode: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  removeLink: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  packageDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeInfo: {
    backgroundColor: COLORS.lightGray,
    borderColor: COLORS.border,
  },
  badgePrimary: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  noteBox: {
    marginTop: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 10,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  modernButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
    gap: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modernPreviousButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modernPreviousButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: 'Rubik-SemiBold',
  },
  modernNextButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  modernNextButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 6,
    fontFamily: 'Rubik-Bold',
  },
  modernDisabledButton: {
    backgroundColor: COLORS.lightGray,
    shadowOpacity: 0,
    elevation: 0,
  },
  modernDisabledButtonText: {
    color: COLORS.textSecondary,
  },
  modernLoadingButton: {
    opacity: 0.8,
    shadowOpacity: 0.2,
  },
  disabledButton: {
    backgroundColor: COLORS.primary,
    opacity: 0.3,
    shadowOpacity: 0.1,
  },
  disabledButtonText: {
    color: COLORS.white,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    marginHorizontal: 0,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mapModalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapModalCloseText: {
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  mapModalSpacer: {
    width: 40,
  },
  addressSelectorIcon: {
    fontSize: 18,
    color: COLORS.primary,
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  // Styles pour l'affichage du prix simplifié
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  pricingValueWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'right',
    marginLeft: 6,
  },
  pricingTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
  },
  pricingTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'right',
  },
  pricingDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  pricingPerPackage: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 6,
  },
  pricingPerPackageText: {
    fontSize: 12,
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: '600',
  },
  // Styles pour le modal de succès
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  successModalBackdrop: {
    flex: 1,
  },
  successModalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '50%',
    alignItems: 'center',
  },
  successModalHeader: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  successModalContent: {
    marginBottom: 30,
    alignItems: 'center',
  },
  successModalMessage: {
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  successModalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    minWidth: 120,
  },
  successModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  // Styles pour les popups séquentiels (drawer du bas vers le haut)
  popupModalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  popupModalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    width: '100%',
    maxHeight: '85%',
    marginTop: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  popupModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 10,
    marginTop: 8,
    alignSelf: 'center',
  },
  pakoLogoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  pakoLogoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  popupHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  popupStep: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  popupContent: {
    width: '100%',
    marginBottom: 24,
  },
  popupInputText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
  },
  abidjanStationOptions: {
    maxHeight: 200,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
  },
  popupPhoneInput: {
    marginTop: 12,
  },
  contactSelectorIcon: {
    marginRight: 10,
  },
  popupSelector: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F8F8F8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  popupSelectorText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
  },
  popupPlaceholderText: {
    color: '#999',
  },
  popupSelectorIcon: {
    fontSize: 16,
    color: '#999',
    marginLeft: 8,
  },
  popupOptionsContainer: {
    marginTop: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  popupOptionsScroll: {
    maxHeight: 200,
  },
  popupOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  popupOptionSelected: {
    backgroundColor: '#F0F8FF',
  },
  popupOptionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  popupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  popupBackButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  popupBackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  popupNextButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  popupNextButtonTextDisabled: {
    color: '#999',
  },
  // Styles pour l'écran d'accueil simplifié
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  // Styles pour le popup de choix après ajout de colis
  popupMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  packageChoiceButtons: {
    width: '100%',
    gap: 12,
  },
  packageChoiceButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageChoiceButtonSecondary: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  packageChoiceButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  packageChoiceButtonTextSecondary: {
    color: COLORS.textPrimary,
  },
  packageChoiceButtonSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // Styles pour le modal des contacts
  contactModalOverlay: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contactModalContainer: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  contactModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  contactModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  contactModalCloseButton: {
    padding: 8,
  },
  contactModalCloseText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  contactModalDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  contactSearchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  contactSearchInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  contactList: {
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactItemSelected: {
    backgroundColor: COLORS.primary + '20',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  contactNameSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  contactPhone: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  contactRadio: {
    marginLeft: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  // Styles pour les options de type de livraison
  deliveryTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  deliveryTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  deliveryTypeOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  deliveryTypeInfo: {
    flex: 1,
  },
  deliveryTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  deliveryTypeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryTypeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  deliveryTypePrice: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  deliveryTypePriceExtra: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  deliveryTypeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  paymentSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  paymentLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paymentNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  paymentDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  paymentRadio: {
    marginLeft: 12,
  },
  paymentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paymentSelectorText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  paymentSelectorTextSelected: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  paymentSelectorTextPlaceholder: {
    color: COLORS.textSecondary,
  },
  // Styles pour le modal de paiement
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentModalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    alignSelf: 'center',
  },
  paymentModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  paymentModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  paymentModalCloseButton: {
    padding: 4,
  },
  paymentModalContent: {
    padding: 20,
  },
  paymentModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentModalOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  paymentModalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentModalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentModalOptionContent: {
    flex: 1,
  },
  paymentModalOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  paymentModalOptionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  paymentModalOptionRight: {
    marginLeft: 12,
  },
  // Styles pour le popup de sélection du destinataire
  popupContactSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  popupContactSelectorText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  popupContactSelectorIcon: {
    fontSize: 18,
    marginLeft: 10,
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  successIcon: {
    marginBottom: 16,
  },
  // Styles pour la liste des colis
  packageListContainer: {
    marginBottom: 20,
  },
  packageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  packageInfo: {
    flex: 1,
  },
  packageTypeLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  removePackageButton: {
    padding: 8,
    marginLeft: 12,
  },
  emptyPackageContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  emptyPackageText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyPackageSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  addPackageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  addPackageButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  contactLoadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  contactEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  contactEmptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  stationCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stationOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popupContentLarge: {
    minHeight: 200,
    paddingVertical: 20,
  },
  popupDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  popupInputLarge: {
    paddingVertical: 20,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  addAnotherPackageButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 0,
  },
  addAnotherPackageButtonText: {
    marginLeft: 8,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  addAnotherPackageButtonTextDisabled: {
    color: '#BDBDBD',
    textShadowColor: 'transparent',
  },
  addAnotherPackageButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  popupHeaderRight: {
    alignItems: 'flex-end',
  },
  packageCounter: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 2,
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  
  // Styles pour les nouveaux popups optimisés
  popupSection: {
    marginBottom: 20,
  },
  popupSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  popupScrollView: {
    maxHeight: 400,
    paddingHorizontal: 5,
  },
  popupSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  
  // Styles pour les sélecteurs
  stationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  stationSelectorText: {
    fontSize: 16,
    flex: 1,
  },
  stationSelectorTextSelected: {
    color: COLORS.textPrimary,
  },
  stationSelectorTextPlaceholder: {
    color: COLORS.textSecondary,
  },
  
  addressSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  addressSelectorText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  addressSelectorTextSelected: {
    color: COLORS.textPrimary,
  },
  addressSelectorTextPlaceholder: {
    color: COLORS.textSecondary,
  },
  
  phoneSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  phoneSelectorText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  phoneSelectorTextSelected: {
    color: COLORS.textPrimary,
  },
  phoneSelectorTextPlaceholder: {
    color: COLORS.textSecondary,
  },
  
  popupInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  
  // Styles pour les options de destinataire
  recipientOptions: {
    gap: 12,
  },
  recipientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  recipientOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  recipientOptionText: {
    fontSize: 16,
    marginLeft: 12,
    color: COLORS.textPrimary,
  },
  recipientOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  recipientOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recipientOptionIcon: {
    marginLeft: 8,
  },
  
  // Styles pour le nouveau sélecteur de destinataire
  recipientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  recipientSelectorText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  recipientSelectorTextSelected: {
    color: COLORS.textPrimary,
  },
  recipientSelectorTextPlaceholder: {
    color: COLORS.textSecondary,
  },
  
  // Styles pour le sélecteur de téléphone expéditeur
  senderPhoneSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  senderPhoneSelectorText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  senderPhoneSelectorTextSelected: {
    color: COLORS.textPrimary,
  },
  senderPhoneSelectorTextPlaceholder: {
    color: COLORS.textSecondary,
  },
  
  // Styles pour le modal de sélection de gare - Design moderne
  stationModalContainer: {
    backgroundColor: COLORS.white,
    margin: 8,
    borderRadius: 20,
    maxHeight: '90%',
    width: '95%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  stationModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  stationModalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stationModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  stationModalCloseButton: {
    padding: 4,
  },
  
  // Barre de recherche
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  
  stationModalContent: {
    maxHeight: 600,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  // Design des cartes de gares
  stationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 18,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stationCardLeft: {
    marginRight: 16,
  },
  stationIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationCardContent: {
    flex: 1,
  },
  stationCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  stationCardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  stationCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stationCardLocation: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  stationCardRight: {
    marginLeft: 12,
  },
  
  // Styles pour les états de chargement et vide
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Styles modernes pour les boutons des popups optimisés
  popupButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    gap: 12,
  },
  popupCancelButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  popupCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  popupNextButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  popupNextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginRight: 8,
  },
  
  // Styles redesignés pour les boutons du popup de détails
  detailsButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    gap: 16,
  },
  detailsPreviousButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  detailsPreviousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  detailsNextButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  detailsNextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginRight: 8,
  },
  
  // Styles pour le sélecteur de ville
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  citySelectorText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  citySelectorTextSelected: {
    color: COLORS.textPrimary,
  },
  citySelectorTextPlaceholder: {
    color: COLORS.textSecondary,
  },
  
  // Styles pour le modal de sélection de ville
  cityModalContainer: {
    backgroundColor: COLORS.white,
    margin: 8,
    borderRadius: 20,
    maxHeight: '90%',
    width: '95%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  cityModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cityModalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  cityModalCloseButton: {
    padding: 4,
  },
  cityModalContent: {
    maxHeight: 600,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  // Design des cartes de villes
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 18,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityCardLeft: {
    marginRight: 16,
  },
  cityIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityCardContent: {
    flex: 1,
  },
  cityCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cityCardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cityCardRight: {
    marginLeft: 12,
  },
});

export default MultiStepPackageRegistrationScreen;