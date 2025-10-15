import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Keyboard, Platform, Animated } from 'react-native';
import MapView, { Marker, UrlTile, Region } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
// import Constants from 'expo-constants';
import * as Location from 'expo-location';

interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
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

  const nominatimUrl = useMemo(() => {
    const encoded = encodeURIComponent(query.trim());
    // Recherche centrée sur Abidjan avec viewbox plus précis
    return `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=10&countrycodes=ci&bounded=1&viewbox=-4.2,5.2,-3.8,5.5&dedupe=1&polygon_geojson=0`;
  }, [query]);

  const performSearchNow = async () => {
    const q = query.trim();
    if (q.length < 1) return;
    try {
      setIsLoading(true);
      const res = await fetch(nominatimUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PAKO-Client/1.0 (Nominatim Search)'
        }
      });
      const json: SearchResult[] = await res.json();
      setResults(json);
      setShowSuggestions(json.length > 0);
      if (json.length > 0) {
        // Centrer sur le premier résultat si l'utilisateur valide la recherche
        handleSelect(json[0]);
      }
    } catch {}
    finally { setIsLoading(false); }
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
        const res = await fetch(nominatimUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'PAKO-Client/1.0 (Nominatim Search)'
          }
        });
        const json: SearchResult[] = await res.json();
        if (!active) return;
        setResults(json);
        setShowSuggestions(json.length > 0);
      } catch (e) {
        // Ignore network errors for now
      } finally {
        if (active) setIsLoading(false);
      }
    };
    const timeout = setTimeout(run, 80); // debounce encore plus rapide
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [nominatimUrl, query]);

  useEffect(() => {
    Animated.timing(searchAnimation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const handleSelect = (item: SearchResult) => {
    const latitude = parseFloat(item.lat);
    const longitude = parseFloat(item.lon);
    setSelected({ latitude, longitude, label: item.display_name });
    setResults([]);
    
    // Afficher l'adresse complète dans la barre de recherche
    setQuery(item.display_name);
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
    
    // Appeler le callback si fourni avec les coordonnées
    if (onLocationSelect) {
      onLocationSelect(item.display_name, parseFloat(item.lat), parseFloat(item.lon));
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
      // Reverse geocoding pour obtenir l'adresse
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'PAKO-Client/1.0 (Reverse Geocoding)'
          }
        }
      );
      const data = await response.json();
      
      const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      
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
      setClickedLocation({
        latitude,
        longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      });
      
      // Afficher les coordonnées dans la barre de recherche
      setQuery(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      
      // Faire disparaître le message après 3 secondes
      setTimeout(() => {
        setClickedLocation(null);
      }, 3000);
      
      // Appeler le callback si fourni avec les coordonnées
      if (onLocationSelect) {
        onLocationSelect(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, latitude, longitude);
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
        
        // Obtenir l'adresse de la position actuelle (sans l'afficher dans la barre de recherche)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`,
            {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'PAKO-Client/1.0 (Reverse Geocoding)'
              }
            }
          );
          const data = await response.json();
          const address = data.display_name || `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
          setCurrentLocationAddress(address);
          // Ne pas afficher l'adresse dans la barre de recherche - laisser vide pour la recherche
        } catch (error) {
          setCurrentLocationAddress(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
          // Ne pas afficher les coordonnées dans la barre de recherche
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
                      const parts = item.display_name.split(',');
                      // Prendre le nom principal (souvent le 2ème ou 3ème élément)
                      if (parts.length >= 3) {
                        return parts[1].trim() || parts[0].trim();
                      }
                      return parts[0].trim();
                    })()}
                  </Text>
                  <Text numberOfLines={1} style={styles.resultSubtitle}>
                    {(() => {
                      const parts = item.display_name.split(',');
                      // Afficher la localisation (ville, région)
                      if (parts.length >= 3) {
                        return parts.slice(2, 4).join(', ').trim();
                      }
                      return parts.slice(1).join(', ').trim();
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
          onRegionChangeComplete={setRegion}
          onPress={handleMapPress}
        >
          <UrlTile
            urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
            zIndex={-1}
          />
          {userLocation && (
            <Marker coordinate={userLocation} title="Ma position">
              <View style={styles.userDotOuter}>
                <View style={styles.userDotInner} />
              </View>
            </Marker>
          )}
          {selected && (
            <Marker coordinate={{ latitude: selected.latitude, longitude: selected.longitude }} title={selected.label} />
          )}
          {clickedLocation && (
            <Marker coordinate={{ latitude: clickedLocation.latitude, longitude: clickedLocation.longitude }} title="Point sélectionné">
              <View style={styles.clickedMarker}>
                <MaterialCommunityIcons name="map-marker" size={18} color={COLORS.white} />
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
            <Text style={styles.yangoLocationAddress} numberOfLines={2}>{currentLocationAddress}</Text>
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
          <Text style={styles.attributionText}>© OpenStreetMap contributors | Tiles by MapTiler/Carto</Text>
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
    height: 240,
    backgroundColor: COLORS.lightGray,
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


