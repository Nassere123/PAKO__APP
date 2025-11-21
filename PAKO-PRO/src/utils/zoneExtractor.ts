/**
 * Fonction utilitaire pour extraire la zone de livraison depuis une adresse
 */

// Zones communes d'Abidjan et autres villes
const COMMON_ZONES = [
  // Abidjan
  'Cocody',
  'Treichville',
  'Plateau',
  'Yopougon',
  'Marcory',
  'Adjamé',
  'Abobo',
  'Koumassi',
  'Attécoubé',
  'Anyama',
  'Bingerville',
  'Port-Bouët',
  'Songon',
  'Dabou',
  // Autres villes
  'Bouaké',
  'Daloa',
  'San-Pédro',
  'Korhogo',
  'Man',
  'Gagnoa',
  'Yamoussoukro',
  'Divo',
  'Abengourou',
  'Bondoukou',
  'Odienné',
  'Séguéla',
  'Touba',
  'Bangolo',
  'Duékoué',
  'Guiglo',
  'Tabou',
  'Soubré',
];

/**
 * Extrait la zone de livraison depuis une adresse
 * @param address - L'adresse complète du destinataire
 * @returns Le nom de la zone ou "Autre" si non trouvée
 */
export const extractZoneFromAddress = (address: string): string => {
  if (!address || typeof address !== 'string') {
    return 'Autre';
  }

  const addressLower = address.toLowerCase();
  
  // Chercher chaque zone dans l'adresse
  for (const zone of COMMON_ZONES) {
    if (addressLower.includes(zone.toLowerCase())) {
      return zone;
    }
  }

  // Si aucune zone connue n'est trouvée, essayer d'extraire le premier mot significatif
  // après une virgule ou un tiret
  const parts = address.split(/[,\-]/);
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1].trim();
    if (lastPart.length > 0) {
      return lastPart;
    }
  }

  return 'Autre';
};

/**
 * Groupe les colis par zone de livraison
 */
export interface ParcelsByZone<T = any> {
  zone: string;
  parcels: T[];
  count: number;
}

export const groupParcelsByZone = <T extends { receiverAddress?: string; deliveryAddress?: string }>(
  parcels: T[]
): ParcelsByZone<T>[] => {
  const zoneMap = new Map<string, T[]>();

  parcels.forEach((parcel) => {
    // Support à la fois receiverAddress (pour les colis) et deliveryAddress (pour les commandes)
    const address = parcel.receiverAddress || parcel.deliveryAddress || '';
    const zone = extractZoneFromAddress(address);
    if (!zoneMap.has(zone)) {
      zoneMap.set(zone, []);
    }
    zoneMap.get(zone)!.push(parcel);
  });

  // Convertir en tableau et trier par nom de zone
  return Array.from(zoneMap.entries())
    .map(([zone, zoneParcels]) => ({
      zone,
      parcels: zoneParcels,
      count: zoneParcels.length,
    }))
    .sort((a, b) => {
      // Trier par ordre alphabétique, mais mettre "Autre" à la fin
      if (a.zone === 'Autre') return 1;
      if (b.zone === 'Autre') return -1;
      return a.zone.localeCompare(b.zone);
    });
};

