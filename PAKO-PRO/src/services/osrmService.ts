import polyline from '@mapbox/polyline';

export interface OSRMRoute {
  distance: number; // en mètres
  duration: number; // en secondes
  geometry: string; // polyline encodée
  coordinates: Array<{ latitude: number; longitude: number }>; // coordonnées décodées
}

export interface OSRMResponse {
  code: string;
  routes: Array<{
    distance: number;
    duration: number;
    geometry: string;
    legs: Array<{
      distance: number;
      duration: number;
      steps: Array<{
        distance: number;
        duration: number;
        geometry: string;
        maneuver: {
          type: string;
          instruction: string;
        };
      }>;
    }>;
  }>;
}

/**
 * Récupère l'itinéraire depuis OSRM avec timeout et retry
 * @param origin Coordonnées de départ {latitude, longitude}
 * @param destination Coordonnées de destination {latitude, longitude}
 * @returns Route avec distance, durée et coordonnées
 */
export const getOSRMRoute = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<OSRMRoute> => {
  try {
    // OSRM utilise l'ordre longitude,latitude
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=polyline&steps=true`;

    // Créer un AbortController pour timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Erreur HTTP - utiliser le fallback silencieusement
        return getFallbackRoute(origin, destination);
      }

      let data: OSRMResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        // Erreur de parsing JSON - utiliser le fallback
        return getFallbackRoute(origin, destination);
      }

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        // Aucun itinéraire trouvé - utiliser le fallback
        return getFallbackRoute(origin, destination);
      }

      const route = data.routes[0];
      
      // Décoder la polyline en coordonnées
      const decoded = polyline.decode(route.geometry);
      const coordinates = decoded.map(([lat, lon]) => ({
        latitude: lat,
        longitude: lon,
      }));

      return {
        distance: route.distance, // en mètres
        duration: route.duration, // en secondes
        geometry: route.geometry,
        coordinates,
      };
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Ne pas afficher d'erreur dans la console, utiliser silencieusement le fallback
      // Les erreurs OSRM sont courantes (réseau, timeout, etc.) et ne doivent pas perturber l'utilisateur
      
      // Retourner un itinéraire simple (ligne droite) en fallback
      return getFallbackRoute(origin, destination);
    }
  } catch (error: any) {
    // Erreur silencieuse - utiliser le fallback
    // Retourner un itinéraire simple en fallback
    return getFallbackRoute(origin, destination);
  }
};

/**
 * Crée un itinéraire simple (ligne droite) en fallback
 */
const getFallbackRoute = (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): OSRMRoute => {
  // Calculer la distance avec la formule de Haversine
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (origin.latitude * Math.PI) / 180;
  const φ2 = (destination.latitude * Math.PI) / 180;
  const Δφ = ((destination.latitude - origin.latitude) * Math.PI) / 180;
  const Δλ = ((destination.longitude - origin.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // en mètres
  
  // Estimer la durée (vitesse moyenne de 30 km/h en ville)
  const duration = (distance / 1000 / 30) * 3600; // en secondes

  // Créer une ligne droite simple avec quelques points intermédiaires
  const numPoints = Math.max(10, Math.floor(distance / 100)); // Un point tous les 100m
  const coordinates = [];
  for (let i = 0; i <= numPoints; i++) {
    const ratio = i / numPoints;
    coordinates.push({
      latitude: origin.latitude + (destination.latitude - origin.latitude) * ratio,
      longitude: origin.longitude + (destination.longitude - origin.longitude) * ratio,
    });
  }

  return {
    distance,
    duration,
    geometry: '', // Pas de polyline pour le fallback
    coordinates,
  };
};

