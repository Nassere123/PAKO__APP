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
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { COLORS } from '../constants';
import PhoneInput from '../components/PhoneInput';
import OSMSearchMap from '../components/OSMSearchMap';
import { PricingCalculator, PricingResult } from '../utils/pricingCalculator';

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
  packages: PackageData[];
}

const MultiStepPackageRegistrationScreen: React.FC<MultiStepPackageRegistrationScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [osmStations, setOsmStations] = useState<any[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return orderData.senderName && orderData.senderPhone && orderData.senderCity && 
               orderData.receiverName && orderData.receiverPhone && orderData.deliveryAddress && 
               orderData.destinationStation;
      case 2:
        return orderData.packages.length > 0;
      default:
        return true;
    }
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
    { value: 'gare_nord', label: 'Gare du Nord', description: 'Abidjan - Gare principale' },
    { value: 'gare_lyon', label: 'Gare de Lyon', description: 'Abidjan - Plateau' },
    { value: 'gare_ouest', label: 'Gare de l\'Ouest', description: 'Abidjan - Yopougon' },
    { value: 'gare_sud', label: 'Gare du Sud', description: 'Abidjan - Marcory' },
    { value: 'gare_est', label: 'Gare de l\'Est', description: 'Abidjan - Cocody' },
    { value: 'gare_bouake', label: 'Gare de Bouaké', description: 'Bouaké - Centre ville' },
    { value: 'gare_san_pedro', label: 'Gare de San-Pédro', description: 'San-Pédro - Port' },
    { value: 'gare_korhogo', label: 'Gare de Korhogo', description: 'Korhogo - Nord' },
    { value: 'gare_man', label: 'Gare de Man', description: 'Man - Ouest' },
    { value: 'gare_daloa', label: 'Gare de Daloa', description: 'Daloa - Centre-Ouest' },
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
        { value: 'osm_fallback_1', label: 'Gare de Bassam', description: 'Bassam - Transport interurbain', lat: 5.345317, lon: -4.024429 },
        { value: 'osm_fallback_2', label: 'Gare routière du grand marché', description: 'Abidjan - Transport interurbain', lat: 5.345317, lon: -4.024429 },
        { value: 'osm_fallback_3', label: 'Gare de Cars UTGB', description: 'Abidjan - Transport interurbain', lat: 5.345317, lon: -4.024429 },
        { value: 'osm_fallback_4', label: 'Gare de Wôrô-Wôrô d\'Anoumabo', description: 'Abidjan - Transport interurbain', lat: 5.345317, lon: -4.024429 },
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
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [isTypingAddress, setIsTypingAddress] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [pricingInfo, setPricingInfo] = useState<PricingResult | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const successSlideAnim = useState(new Animated.Value(Dimensions.get('window').height))[0];

  const totalSteps = 3;

  // Recalculer le prix quand la distance ou le nombre de colis change
  useEffect(() => {
    calculateDeliveryPricing();
  }, [orderData.distanceKm, orderData.packages.length]);

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
    if (orderData.distanceKm && orderData.distanceKm > 0 && orderData.packages.length > 0) {
      const pricing = PricingCalculator.calculateDeliveryPrice(
        orderData.distanceKm,
        orderData.packages.length
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

  const handleAddPackage = () => {
    if (!currentPackage.packageCode || !currentPackage.packageDescription || !currentPackage.packageType) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires');
      setShowErrorModal(true);
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
        if (!orderData.senderName || !orderData.senderPhone || !orderData.senderCity || !orderData.receiverName || !orderData.receiverPhone || !orderData.deliveryAddress || !orderData.destinationStation) {
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

  const handleSubmit = () => {
    if (!validateCurrentStep()) return;
    
    setLoading(true);
    
    // Simulation d'enregistrement
    setTimeout(() => {
      setLoading(false);
      showSuccessModalPopup();
    }, 2000);
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

  const renderStep1 = () => (
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
        <Text style={styles.sectionTitle}>Informations destinataire</Text>
        
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
            <Text style={styles.addressSelectorIcon}>📍</Text>
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
              <Text style={styles.stationCategoryTitle}>🚍 Gares Transport National ({osmStations.length})</Text>
              {osmStations.map((station) => (
                <TouchableOpacity
                  key={station.value}
                  style={[
                    styles.stationOption,
                    orderData.destinationStation === station.value && styles.selectedStation
                  ]}
                  onPress={() => handleStationSelect(station.value)}
                >
                  <Text style={styles.stationOptionLabel}>🚍 {station.label}</Text>
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
      <Text style={styles.stepTitle}>Étape 3/3 - Récapitulatif</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informations générales</Text>

        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>Expéditeur</Text>
          <Text style={styles.kvValue}>{orderData.senderName || '-'}</Text>
        </View>
        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>Téléphone expéditeur</Text>
          <Text style={styles.kvValue}>{orderData.senderPhone || '-'}</Text>
        </View>
        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>Ville</Text>
          <Text style={styles.kvValue}>{coteIvoireCities.find(city => city.value === orderData.senderCity)?.label || '-'}</Text>
        </View>
        {!!orderData.senderDistrict && (
          <View style={styles.kvRow}>
            <Text style={styles.kvLabel}>Quartier</Text>
            <Text style={styles.kvValue}>{orderData.senderDistrict}</Text>
          </View>
        )}
        <View style={styles.kvDivider} />
        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>Destinataire</Text>
          <Text style={styles.kvValue}>{orderData.receiverName || '-'}</Text>
        </View>
        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>Téléphone destinataire</Text>
          <Text style={styles.kvValue}>{orderData.receiverPhone || '-'}</Text>
        </View>
        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>Adresse</Text>
          <Text style={styles.kvValue}>{orderData.deliveryAddress || '-'}</Text>
        </View>
        <View style={styles.kvRow}>
          <Text style={styles.kvLabel}>Gare</Text>
          <Text style={styles.kvValue}>{osmStations.find(station => station.value === orderData.destinationStation)?.label || '-'}</Text>
        </View>
        {orderData.distanceKm && (
          <View style={styles.kvRow}>
            <Text style={styles.kvLabel}>Distance gare → livraison</Text>
            <Text style={[styles.kvValue, styles.distanceValue]}>{orderData.distanceKm} km</Text>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Colis ({orderData.packages.length})</Text>

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
                {!!pkg.estimatedValue && (
                  <View style={[styles.badge, styles.badgePrimary]}>
                    <Text style={styles.badgeText}>{`${pkg.estimatedValue} FCFA`}</Text>
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
          <Text style={styles.cardTitle}>💰 Prix de livraison</Text>
          
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Distance</Text>
            <Text style={styles.pricingValue}>{pricingInfo.distanceKm} km</Text>
          </View>
          
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Prix du kilomètre</Text>
            <Text style={styles.pricingValue}>1 KM à 500 FCFA</Text>
          </View>

          <View style={styles.pricingDivider} />
          
          <View style={styles.pricingRow}>
            <Text style={styles.pricingTotalLabel}>Total à payer</Text>
            <Text style={styles.pricingTotalValue}>{PricingCalculator.formatPrice(pricingInfo.totalPrice)}</Text>
          </View>
          
          {pricingInfo.packageCount > 1 && (
            <View style={styles.pricingPerPackage}>
              <Text style={styles.pricingPerPackageText}>
                Soit {PricingCalculator.formatPrice(PricingCalculator.calculatePricePerPackage(pricingInfo.totalPrice, pricingInfo.packageCount))} par colis
              </Text>
            </View>
          )}
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

        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
              <Text style={styles.previousButtonText}>Précédent</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < totalSteps ? (
            <TouchableOpacity 
              style={[
                styles.nextButton, 
                !isStepValid() && styles.disabledButton
              ]} 
              onPress={handleNext}
              disabled={!isStepValid()}
            >
              <Text style={[
                styles.nextButtonText,
                !isStepValid() && styles.disabledButtonText
              ]}>Suivant</Text>
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
              <Text style={styles.mapModalCloseText}>✕</Text>
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
              <Text style={styles.successModalTitle}>🎉 Félicitations !</Text>
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
    maxHeight: 300,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
  citySelector: {
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
  citySelectorText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  previousButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
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
  previousButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nextButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingButton: {
    opacity: 0.7,
    shadowOpacity: 0.1,
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
  addressSelector: {
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
  addressSelectorText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
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
  pricingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'right',
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
});

export default MultiStepPackageRegistrationScreen;