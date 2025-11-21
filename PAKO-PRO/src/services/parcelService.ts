import AsyncStorage from '@react-native-async-storage/async-storage';
import { Parcel, ParcelStatus, ParcelVerificationPayload, ParcelAssignmentPayload } from '../types/parcel';
import { packagesService } from '../lib/api/services/packages.service';

const PARCELS_STORAGE_KEY = '@pako_pro:parcels';

// Stockage en mémoire des colis créés depuis les commandes (remplace les données mock)
let MOCK_PARCELS: Parcel[] = [];
let parcelsLoaded = false;

const loadParcelsFromStorage = async () => {
  if (parcelsLoaded) {
    return;
  }

  try {
    const storedParcels = await AsyncStorage.getItem(PARCELS_STORAGE_KEY);
    if (storedParcels) {
      MOCK_PARCELS = JSON.parse(storedParcels);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des colis depuis le stockage:', error);
  } finally {
    parcelsLoaded = true;
  }
};

const persistParcels = async () => {
  try {
    await AsyncStorage.setItem(PARCELS_STORAGE_KEY, JSON.stringify(MOCK_PARCELS));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des colis:', error);
  }
};

export const parcelService = {
  // Récupérer tous les colis de la gare
  getParcelsByStation: async (stationId: string): Promise<Parcel[]> => {
    await loadParcelsFromStorage();
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_PARCELS.filter((parcel) => parcel.stationId === stationId);
  },

  // Récupérer les colis par statut
  getParcelsByStatus: async (status: ParcelStatus, stationId: string): Promise<Parcel[]> => {
    await loadParcelsFromStorage();
    await new Promise((resolve) => setTimeout(resolve, 150));
    return MOCK_PARCELS.filter(
      (parcel) => parcel.status === status && parcel.stationId === stationId
    );
  },

  // Récupérer un colis par ID
  getParcelById: async (id: string): Promise<Parcel | undefined> => {
    await loadParcelsFromStorage();
    await new Promise((resolve) => setTimeout(resolve, 100));
    return MOCK_PARCELS.find((parcel) => parcel.id === id);
  },

  // Vérifier et préparer un colis
  verifyParcel: async (
    id: string,
    payload: ParcelVerificationPayload
  ): Promise<Parcel | undefined> => {
    await loadParcelsFromStorage();
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    if (!payload.verified) {
      throw new Error('Le colis n\'a pas pu être vérifié');
    }

    let updatedParcel: Parcel | undefined;
    MOCK_PARCELS = MOCK_PARCELS.map((parcel) => {
      if (parcel.id !== id) {
        return parcel;
      }

      updatedParcel = {
        ...parcel,
        status: 'verified' as ParcelStatus,
        verifiedAt: new Date().toISOString(),
        notes: payload.notes ?? parcel.notes,
      };

      return updatedParcel;
    });

    await persistParcels();

    return updatedParcel;
  },

  // Marquer un colis comme prêt pour livraison
  markAsReadyForDelivery: async (id: string): Promise<Parcel | undefined> => {
    await loadParcelsFromStorage();
    // Trouver le colis dans la mémoire locale
    const parcel = MOCK_PARCELS.find((p) => p.id === id);
    if (!parcel) {
      throw new Error('Colis non trouvé');
    }

    if (parcel.status !== 'verified') {
      throw new Error('Le colis doit être vérifié avant d\'être marqué comme prêt');
    }

    // Vérifier que trackingNumber est valide
    if (!parcel.trackingNumber || parcel.trackingNumber.trim() === '' || parcel.trackingNumber === 'code') {
      console.error('Colis avec trackingNumber invalide:', {
        parcelId: parcel.id,
        trackingNumber: parcel.trackingNumber,
        parcel: parcel,
      });
      throw new Error(`Code colis invalide (${parcel.trackingNumber || 'non défini'}). Veuillez recharger la liste des colis.`);
    }

    try {
      // Appeler l'API backend pour mettre à jour le statut dans la base de données
      // Le trackingNumber correspond au packageCode dans le backend
      await packagesService.markAsReadyForDelivery(parcel.trackingNumber);
      
      // Mettre à jour le statut localement après confirmation du backend
      let updatedParcel: Parcel | undefined;
      MOCK_PARCELS = MOCK_PARCELS.map((p) => {
        if (p.id !== id) {
          return p;
        }

        updatedParcel = {
          ...p,
          status: 'ready_for_delivery' as ParcelStatus,
        };

        return updatedParcel;
      });

      await persistParcels();

      return updatedParcel;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut en backend:', error);
      throw error;
    }
  },

  // Assigner un colis à un livreur
  assignParcelToDriver: async (
    id: string,
    payload: ParcelAssignmentPayload
  ): Promise<Parcel | undefined> => {
    await loadParcelsFromStorage();
    // Synchroniser avec le backend avant de mettre à jour localement
    try {
      const parcel = MOCK_PARCELS.find((p) => p.id === id);
      if (!parcel) {
        throw new Error('Colis introuvable');
      }
      if (!parcel.trackingNumber) {
        throw new Error('Code colis manquant');
      }
      await packagesService.assignToDriver(parcel.trackingNumber, {
        driverId: payload.driverId,
        driverName: payload.driverName,
      });
    } catch (error) {
      console.error('Erreur lors de l\'assignation sur le backend:', error);
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));

    let updatedParcel: Parcel | undefined;
    MOCK_PARCELS = MOCK_PARCELS.map((parcel) => {
      if (parcel.id !== id) {
        return parcel;
      }

      if (parcel.status !== 'ready_for_delivery') {
        throw new Error('Le colis doit être prêt pour la livraison avant attribution');
      }

      updatedParcel = {
        ...parcel,
        status: 'assigned' as ParcelStatus,
        assignedToDriverId: payload.driverId,
        assignedToDriverName: payload.driverName,
        assignedAt: new Date().toISOString(),
      };

      return updatedParcel;
    });

    await persistParcels();

    return updatedParcel;
  },

  // Ajouter un nouveau colis (simulation d'arrivée)
  addParcel: async (parcel: Omit<Parcel, 'id' | 'arrivedAt' | 'status'>): Promise<Parcel> => {
    await loadParcelsFromStorage();
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const newParcel: Parcel = {
      ...parcel,
      id: `PARC-${String(MOCK_PARCELS.length + 1).padStart(3, '0')}`,
      status: 'arrived',
      arrivedAt: new Date().toISOString(),
    };

    MOCK_PARCELS = [...MOCK_PARCELS, newParcel];
    await persistParcels();
    return newParcel;
  },

  // Créer un colis à partir d'une commande
  createParcelFromOrder: async (order: {
    orderNumber: string;
    senderName: string;
    senderPhone: string;
    receiverName: string;
    receiverPhone: string;
    deliveryAddress: string;
    description?: string;
    stationId: string;
    stationName: string;
    packageCodes?: string[]; // Codes de colis réels de la commande
    orderDate?: string; // Date de création de la commande
  }): Promise<Parcel> => {
    await loadParcelsFromStorage();
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Générer un numéro de suivi basé sur les codes de colis réels ou l'orderNumber
    const parcelId = `PARC-${String(MOCK_PARCELS.length + 1).padStart(3, '0')}`;
    // Utiliser le premier code de colis comme trackingNumber, ou l'orderNumber
    const trackingNumber = order.packageCodes && order.packageCodes.length > 0
      ? order.packageCodes[0]
      : order.orderNumber;

    const newParcel: Parcel = {
      id: parcelId,
      trackingNumber,
      senderName: order.senderName,
      senderPhone: order.senderPhone,
      receiverName: order.receiverName,
      receiverPhone: order.receiverPhone,
      receiverAddress: order.deliveryAddress,
      description: order.description || (order.packageCodes && order.packageCodes.length > 0
        ? `Commande ${order.orderNumber} - Codes: ${order.packageCodes.join(', ')}`
        : `Commande ${order.orderNumber}`),
      status: 'arrived',
      arrivedAt: new Date().toISOString(),
      stationId: order.stationId,
      stationName: order.stationName,
      orderDate: order.orderDate, // Date de création de la commande
    };

    MOCK_PARCELS = [...MOCK_PARCELS, newParcel];
    await persistParcels();
    return newParcel;
  },
};

