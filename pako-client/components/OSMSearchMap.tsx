import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Keyboard, Platform, Animated } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { GOOGLE_MAPS_API_KEY } from '../constants/api';
// import Constants from 'expo-constants';
import * as Location from 'expo-location';

interface SearchResult {
  place_id: string;
  description: string;
  formatted_address?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  // Pour compatibilité avec l'ancien format
  display_name?: string;
  lat?: string;
  lon?: string;
}

interface OSMSearchMapProps {
  initialRegion?: Region;
  fullscreen?: boolean; // occupe tout l'écran disponible du parent
  onLocationSelect?: (address: string, latitude?: number, longitude?: number) => void; // callback pour sélection d'adresse avec coordonnées
  showLocationCards?: boolean; // afficher les cartes d'information de position
}

const DEFAULT_REGION: Region = {
  latitude: 5.345317, // Abidjan centre
  longitude: -4.024429,
  latitudeDelta: 0.03, // Zoom plus serré sur Abidjan
  longitudeDelta: 0.03,
};

const OSMSearchMap: React.FC<OSMSearchMapProps> = ({ initialRegion, fullscreen = false, onLocationSelect, showLocationCards = false }) => {
  const mapRef = useRef<MapView | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [region, setRegion] = useState<Region>(initialRegion || DEFAULT_REGION);
  const [selected, setSelected] = useState<{ latitude: number; longitude: number; label: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const [clickedLocation, setClickedLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [currentLocationAddress, setCurrentLocationAddress] = useState<string>('');

  // Utiliser Google Places API pour la recherche d'adresses
  const googlePlacesUrl = useMemo(() => {
    const encoded = encodeURIComponent(query.trim());
    // Recherche centrée sur Abidjan, Côte d'Ivoire
    return `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encoded}&key=${GOOGLE_MAPS_API_KEY}&components=country:ci&location=5.345317,-4.024429&radius=50000&language=fr`;
  }, [query]);

  // Obtenir les détails d'un lieu depuis Google Places
  const getPlaceDetails = async (placeId: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&language=fr&fields=geometry,formatted_address,name`
      );
      const data = await response.json();
      if (data.result) {
        return {
          latitude: data.result.geometry.location.lat,
          longitude: data.result.geometry.location.lng,
          address: data.result.formatted_address || data.result.name,
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du lieu:', error);
    }
    return null;
  };

  // Gérer la sélection depuis Google Places
  const handleSelectFromGoogle = async (item: { place_id: string; description: string; latitude: number; longitude: number; address: string }) => {
    setSelected({ latitude: item.latitude, longitude: item.longitude, label: item.address });
    setResults([]);
    
    // Afficher l'adresse complète dans la barre de recherche
    setQuery(item.address);
    setShowSuggestions(false);
    setIsFocused(false);
    Keyboard.dismiss();
    const nextRegion: Region = {
      latitude: item.latitude,
      longitude: item.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 400);
    
    // Appeler le callback si fourni avec les coordonnées
    if (onLocationSelect) {
      onLocationSelect(item.address, item.latitude, item.longitude);
    }
  };

  const performSearchNow = async () => {
    const q = query.trim();
    if (q.length < 1) return;
    try {
      setIsLoading(true);
      const res = await fetch(googlePlacesUrl);
      const json = await res.json();
      
      if (json.predictions) {
        // Convertir les résultats Google Places au format attendu
        const formattedResults: SearchResult[] = json.predictions.map((prediction: any) => ({
          place_id: prediction.place_id,
          description: prediction.description,
          formatted_address: prediction.description,
          display_name: prediction.description,
        }));
        setResults(formattedResults);
        setShowSuggestions(formattedResults.length > 0);
        if (formattedResults.length > 0) {
          // Obtenir les détails du premier résultat et centrer la carte
          const details = await getPlaceDetails(formattedResults[0].place_id);
          if (details) {
            handleSelectFromGoogle({
              place_id: formattedResults[0].place_id,
              description: formattedResults[0].description,
              latitude: details.latitude,
              longitude: details.longitude,
              address: details.address,
            });
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (query.trim().length < 1) {
        setResults([]);
        setShowSuggestions(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await fetch(googlePlacesUrl);
        const json = await res.json();
        if (!active) return;
        
        console.log('Google Places API Response:', json);
        
        if (json.predictions && json.predictions.length > 0) {
          // Convertir les résultats Google Places au format attendu
          const formattedResults: SearchResult[] = json.predictions.map((prediction: any) => ({
            place_id: prediction.place_id,
            description: prediction.description,
            formatted_address: prediction.description,
            display_name: prediction.description,
          }));
          console.log('Résultats formatés:', formattedResults.length);
          setResults(formattedResults);
          setShowSuggestions(formattedResults.length > 0);
        } else if (json.error_message) {
          console.error('Erreur Google Places API:', json.error_message);
          setResults([]);
          setShowSuggestions(false);
        } else {
          console.log('Aucune prédiction trouvée pour:', query);
          setResults([]);
          setShowSuggestions(false);
        }
      } catch (e: any) {
        console.error('Erreur recherche Google Places:', e);
        console.error('URL utilisée:', googlePlacesUrl);
        console.error('Erreur détaillée:', e.message);
        setResults([]);
        setShowSuggestions(false);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    const timeout = setTimeout(run, 300); // Debounce pour Google Places API
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [googlePlacesUrl, query]);

  useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const handleSelect = async (item: SearchResult) => {
    // Si on a déjà les coordonnées (ancien format OSM)
    if (item.lat && item.lon) {
      const latitude = parseFloat(item.lat);
      const longitude = parseFloat(item.lon);
      setSelected({ latitude, longitude, label: item.display_name || item.description });
      setResults([]);
      
      setQuery(item.display_name || item.description);
      setShowSuggestions(false);
      setIsFocused(false);
      Keyboard.dismiss();
      const nextRegion: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setRegion(nextRegion);
      mapRef.current?.animateToRegion(nextRegion, 400);
      
      if (onLocationSelect) {
        onLocationSelect(item.display_name || item.description, latitude, longitude);
      }
    } else {
      // Nouveau format Google Places - obtenir les détails
      const details = await getPlaceDetails(item.place_id);
      if (details) {
        handleSelectFromGoogle({
          place_id: item.place_id,
          description: item.description,
          latitude: details.latitude,
          longitude: details.longitude,
          address: details.address,
        });
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (query.length >= 1 && results.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Délai pour permettre la sélection
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 150);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowSuggestions(false);
    setSelected(null);
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    try {
      // Reverse geocoding avec Google Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=fr`
      );
      const data = await response.json();
      
      let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      if (data.results && data.results.length > 0) {
        address = data.results[0].formatted_address;
      }
      
      setClickedLocation({
        latitude,
        longitude,
        address
      });
      
      // Afficher l'adresse complète dans la barre de recherche
      setQuery(address);
      
      // Centrer la carte sur le point cliqué
      const newRegion: Region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 300);
      
      // Faire disparaître le message après 3 secondes
      setTimeout(() => {
        setClickedLocation(null);
      }, 3000);
      
      // Appeler le callback si fourni avec les coordonnées
      if (onLocationSelect) {
        onLocationSelect(address, latitude, longitude);
      }
      
    } catch (error) {
      // En cas d'erreur, afficher quand même les coordonnées
      const coordsAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      setClickedLocation({
        latitude,
        longitude,
        address: coordsAddress
      });
      
      // Afficher les coordonnées dans la barre de recherche
      setQuery(coordsAddress);
      
      // Faire disparaître le message après 3 secondes
      setTimeout(() => {
        setClickedLocation(null);
      }, 3000);
      
      // Appeler le callback si fourni avec les coordonnées
      if (onLocationSelect) {
        onLocationSelect(coordsAddress, latitude, longitude);
      }
    }
  };

  const centerOnUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setUserLocation(coords);
      
      // Zoom serré pour bien voir la position
      const zoomedRegion: Region = { 
        latitude: coords.latitude, 
        longitude: coords.longitude, 
        latitudeDelta: 0.005, // Zoom plus serré
        longitudeDelta: 0.005 
      };
      setRegion(zoomedRegion);
      mapRef.current?.animateToRegion(zoomedRegion, 600);

      // Démarre/arrête le suivi en temps réel (toggle)
      if (!isWatching) {
        watchRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 3000,
            distanceInterval: 10,
          },
          (update) => {
            const c = { latitude: update.coords.latitude, longitude: update.coords.longitude };
            setUserLocation(c);
            // Recentrer la carte si suivi actif avec zoom serré
            mapRef.current?.animateToRegion({
              latitude: c.latitude,
              longitude: c.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }, 300);
          }
        );
        setIsWatching(true);
      } else {
        watchRef.current?.remove();
        watchRef.current = null;
        setIsWatching(false);
      }
    } catch {}
  };

  // Obtenir la position actuelle au chargement (sans afficher dans la barre de recherche)
  useEffect(() => {
    const getCurrentLocationOnLoad = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setUserLocation(coords);
        
        // Obtenir l'adresse de la position actuelle avec Google Geocoding API
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_MAPS_API_KEY}&language=fr`
          );
          const data = await response.json();
      let address = '';
      if (data.results && data.results.length > 0) {
        // Utiliser l'adresse formatée de Google (nom de l'adresse) - ne jamais utiliser les coordonnées
        address = data.results[0].formatted_address;
      } else {
        // Si pas d'adresse trouvée, essayer une deuxième fois avec une requête différente
        console.log('⚠️ Aucune adresse trouvée, nouvelle tentative...');
        address = 'Position actuelle'; // Texte par défaut au lieu de coordonnées
      }
      setCurrentLocationAddress(address);
      console.log('📍 Adresse trouvée:', address);
          // Ne pas afficher l'adresse dans la barre de recherche - laisser vide pour la recherche
        } catch (error) {
          console.error('❌ Erreur reverse geocoding:', error);
          // En cas d'erreur, afficher les coordonnées comme fallback
          setCurrentLocationAddress(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
        }
        
        // Centrer la carte sur la position actuelle
        const newRegion: Region = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 400);
        
      } catch (error) {
        console.log('Erreur lors de la récupération de la position');
      }
    };
    
    getCurrentLocationOnLoad();
  }, []);

  // Nettoyage à l'unmount
  useEffect(() => {
    return () => {
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, []);

  return (
    <View style={[styles.container, fullscreen && styles.containerFullscreen]}>
      <View style={[styles.searchBar, fullscreen && styles.searchBarOverlay]}>
        <TouchableOpacity onPress={performSearchNow} activeOpacity={0.8}>
        <Animated.View style={[
          styles.searchIconContainer,
          {
            transform: [{
              scale: searchAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1],
              })
            }]
          }
        ]}>
          <MaterialCommunityIcons name="magnify" size={18} color={COLORS.primary} />
        </Animated.View>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une adresse de livraison..."
          placeholderTextColor={COLORS.textSecondary}
          value={query}
          onChangeText={setQuery}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          onSubmitEditing={performSearchNow}
        />
        {!!query && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <MaterialCommunityIcons name="close" size={14} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && results.length > 0 && (
        <View style={[styles.resultsContainer, fullscreen && styles.resultsOverlay]}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={results}
            keyExtractor={(it) => it.place_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
                <View style={styles.resultIcon}>
                  <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.primary} />
                </View>
                <View style={styles.resultContent}>
                  <Text numberOfLines={1} style={styles.resultTitle}>
                    {(() => {
                      const address = item.description || item.display_name || item.formatted_address || '';
                      const parts = address.split(',');
                      // Prendre le nom principal (souvent le 1er ou 2ème élément)
                      if (parts.length >= 2) {
                        return parts[0].trim();
                      }
                      return address;
                    })()}
                  </Text>
                  <Text numberOfLines={1} style={styles.resultSubtitle}>
                    {(() => {
                      const address = item.description || item.display_name || item.formatted_address || '';
                      const parts = address.split(',');
                      // Afficher la localisation (ville, région)
                      if (parts.length >= 2) {
                        return parts.slice(1, 3).join(', ').trim();
                      }
                      return address;
                    })()}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListFooterComponent={isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Recherche en cours...</Text>
              </View>
            ) : null}
          />
        </View>
      )}

      <View style={[styles.mapWrapper, fullscreen && styles.mapWrapperFullscreen]}>
        <MapView
          ref={ref => (mapRef.current = ref)}
          style={styles.map}
          initialRegion={region}
          region={region}
          onRegionChangeComplete={setRegion}
          provider={Platform.OS === 'android' ? 'google' : 'google'}
          toolbarEnabled={false}
          showsMyLocationButton={true}
          showsUserLocation={true}
          mapType="standard"
          loadingEnabled={true}
          showsBuildings={true}
          showsTraffic={false}
          showsIndoors={false}
          rotateEnabled={true}
          pitchEnabled={false}
          scrollEnabled={true}
          zoomEnabled={true}
          onPress={(e) => {
            handleMapPress(e);
            e.stopPropagation();
          }}
        >
          {userLocation && (
            <Marker 
              coordinate={userLocation} 
              title="Ma position"
              tracksViewChanges={false}
            >
              <View style={styles.userDotOuter}>
                <View style={styles.userDotInner} />
              </View>
            </Marker>
          )}
          {selected && (
            <Marker 
              coordinate={{ latitude: selected.latitude, longitude: selected.longitude }} 
              title={selected.label}
              tracksViewChanges={false}
            >
              <View style={styles.clickedMarker}>
                <MaterialCommunityIcons name="map-marker" size={24} color={COLORS.white} />
              </View>
            </Marker>
          )}
          {clickedLocation && (
            <Marker 
              coordinate={{ latitude: clickedLocation.latitude, longitude: clickedLocation.longitude }} 
              title="Point sélectionné"
              tracksViewChanges={false}
            >
              <View style={styles.clickedMarker}>
                <MaterialCommunityIcons name="map-marker" size={24} color={COLORS.white} />
              </View>
            </Marker>
          )}
        </MapView>
        <TouchableOpacity style={[styles.myLocationButton, isWatching && styles.myLocationButtonActive]} onPress={centerOnUserLocation}>
          <MaterialCommunityIcons 
            name={isWatching ? "crosshairs-gps" : "map-marker"} 
            size={20} 
            color={isWatching ? COLORS.white : COLORS.textPrimary} 
          />
        </TouchableOpacity>
        {showLocationCards && clickedLocation && (
          <View style={styles.yangoLocationCard}>
            <View style={styles.yangoLocationHeader}>
              <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
              <Text style={styles.yangoLocationTitle}>Adresse sélectionnée</Text>
            </View>
            <Text style={styles.yangoLocationAddress} numberOfLines={2}>{clickedLocation.address}</Text>
            <TouchableOpacity 
              style={styles.yangoConfirmButton}
              onPress={() => {
                if (onLocationSelect) {
                  onLocationSelect(clickedLocation.address, clickedLocation.latitude, clickedLocation.longitude);
                }
              }}
            >
              <Text style={styles.yangoConfirmButtonText}>Confirmer cette adresse</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.yangoCancelButton}
              onPress={() => {
                setClickedLocation(null);
              }}
            >
              <Text style={styles.yangoCancelButtonText}>Choisir une autre adresse</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {showLocationCards && !clickedLocation && currentLocationAddress && (
            <View style={styles.yangoLocationCard}>
            <View style={styles.yangoLocationHeader}>
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color={COLORS.primary} />
              <Text style={styles.yangoLocationTitle}>Votre position</Text>
            </View>
            <Text style={styles.yangoLocationAddress} numberOfLines={2}>
              {currentLocationAddress || (userLocation ? `${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}` : 'Chargement...')}
            </Text>
            <TouchableOpacity 
              style={styles.yangoConfirmButton}
              onPress={() => {
                if (onLocationSelect && userLocation) {
                  onLocationSelect(currentLocationAddress, userLocation.latitude, userLocation.longitude);
                }
              }}
            >
              <Text style={styles.yangoConfirmButtonText}>Confirmer cette adresse</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.yangoCancelButton}
              onPress={() => {
                setCurrentLocationAddress('');
                setUserLocation(null);
              }}
            >
              <Text style={styles.yangoCancelButtonText}>Choisir une autre adresse</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.attribution} pointerEvents="none">
          <Text style={styles.attributionText}>© Google Maps</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  containerFullscreen: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 0,
    marginBottom: 0,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBarOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  searchIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '400',
  },
  clearButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    maxHeight: 280,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  resultsOverlay: {
    position: 'absolute',
    top: 70,
    left: 12,
    right: 12,
    zIndex: 9,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  resultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  mapWrapper: {
    height: 400,
    backgroundColor: COLORS.lightGray,
    minHeight: 400,
  },
  mapWrapperFullscreen: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 56,
    right: 12,
    backgroundColor: COLORS.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  myLocationButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  userDotOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1E90FF33',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E90FF55',
  },
  userDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E90FF',
  },
  clickedMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  clickedLocationInfo: {
    position: 'absolute',
    bottom: 60,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  clickedLocationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  clickedLocationAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  clickedLocationCoords: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  currentLocationInfo: {
    position: 'absolute',
    bottom: 60,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  currentLocationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  currentLocationAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  attribution: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  attributionText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  closeLocationButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  // Styles Yango
  yangoLocationCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  yangoLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  yangoLocationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  yangoLocationAddress: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  yangoConfirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  yangoConfirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  yangoCancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  yangoCancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default OSMSearchMap;


