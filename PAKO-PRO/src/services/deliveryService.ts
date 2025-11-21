import { DeliveryMission, DeliveryStatus, DeliveryUpdatePayload } from '../types/delivery';
import { packagesService, ApiPackageStatus, Package } from '../lib/api/services/packages.service';
import { missionsService, MissionStatus } from '../lib/api/services/missions.service';

const mapPackageStatusToDeliveryStatus = (status: ApiPackageStatus): DeliveryStatus => {
  switch (status) {
    case ApiPackageStatus.IN_DELIVERY:
      return 'in_progress';
    case ApiPackageStatus.DELIVERED:
      return 'delivered';
    case ApiPackageStatus.CANCELLED:
      return 'issue';
    case ApiPackageStatus.ASSIGNED:
    case ApiPackageStatus.READY_FOR_DELIVERY:
    case ApiPackageStatus.RECEIVED:
    case ApiPackageStatus.VERIFIED:
    default:
      return 'pending';
  }
};

const mapDeliveryStatusToPackageStatuses = (status: DeliveryStatus): ApiPackageStatus[] => {
  switch (status) {
    case 'in_progress':
      return [ApiPackageStatus.IN_DELIVERY];
    case 'delivered':
      return [ApiPackageStatus.DELIVERED];
    case 'issue':
      return [ApiPackageStatus.CANCELLED];
    case 'pending':
    default:
      return [
        ApiPackageStatus.ASSIGNED,
        ApiPackageStatus.READY_FOR_DELIVERY,
        ApiPackageStatus.VERIFIED,
        ApiPackageStatus.RECEIVED,
      ];
  }
};

const mapDeliveryStatusToPackageStatus = (status: DeliveryStatus): ApiPackageStatus => {
  switch (status) {
    case 'in_progress':
      return ApiPackageStatus.IN_DELIVERY;
    case 'delivered':
      return ApiPackageStatus.DELIVERED;
    case 'issue':
      return ApiPackageStatus.CANCELLED;
    case 'pending':
    default:
      return ApiPackageStatus.ASSIGNED;
  }
};

const mapPackageToMission = (pkg: Package): DeliveryMission => {
  const order = pkg.order;
  const pickupLabel = order?.destinationStation || 'Gare de destination';
  const pickupDetails = order?.pickupAddress || 'Lieu de prise inconnu';
  const dropoffLabel = order?.deliveryAddress || 'Adresse destinataire inconnue';

  // Mapper la méthode de paiement pour l'affichage
  const getPaymentMethodLabel = (method?: string): string => {
    switch (method) {
      case 'cash':
        return 'Espèces';
      case 'wave':
        return 'Wave';
      case 'orange':
        return 'Orange Money';
      default:
        return method || 'Non spécifié';
    }
  };

  return {
    id: pkg.id,
    code: pkg.packageCode,
    customerName: order?.receiverName || order?.customerName || 'Client PAKO',
    customerPhone: order?.receiverPhone || order?.senderPhone || '',
    pickupStation: {
      label: pickupLabel,
      details: pickupDetails,
    },
    dropoffLocation: {
      label: dropoffLabel,
      details: order?.deliveryAddress || '',
      contactName: order?.receiverName || order?.customerName,
      contactPhone: order?.receiverPhone,
      latitude: order?.deliveryLatitude ? Number(order.deliveryLatitude) : undefined,
      longitude: order?.deliveryLongitude ? Number(order.deliveryLongitude) : undefined,
    },
    status: mapPackageStatusToDeliveryStatus(pkg.status),
    scheduledAt: pkg.assignedAt || pkg.updatedAt || pkg.createdAt,
    notes: order?.deliveryAddress,
    proofCode: undefined,
    totalPrice: order?.totalPrice,
    paymentMethod: getPaymentMethodLabel(order?.paymentMethod),
  };
};

export const deliveryService = {
  listAssignedDeliveries: async (
    driverId: string,
    statuses?: DeliveryStatus[],
  ): Promise<DeliveryMission[]> => {
    if (!driverId) {
      return [];
    }

    let apiStatuses: ApiPackageStatus[] | undefined;
    if (statuses && statuses.length > 0) {
      apiStatuses = statuses.flatMap(mapDeliveryStatusToPackageStatuses);
    }

    const packages = await packagesService.findByDriverId(driverId, apiStatuses);
    return packages.map(mapPackageToMission);
  },

  getDeliveryById: async (driverId: string, id: string): Promise<DeliveryMission | undefined> => {
    const missions = await deliveryService.listAssignedDeliveries(driverId);
    return missions.find((mission) => mission.id === id);
  },

  updateDelivery: async (
    packageId: string,
    payload: DeliveryUpdatePayload,
  ): Promise<DeliveryMission | undefined> => {
    try {
      console.log('updateDelivery appelé avec packageId:', packageId, 'payload:', payload);
      
      // 1. Mettre à jour le statut du colis
      const newStatus = mapDeliveryStatusToPackageStatus(payload.status);
      console.log('Mise à jour du statut du colis:', packageId, '->', newStatus);
      
      const pkg = await packagesService.updateStatus(packageId, newStatus);
      console.log('Colis mis à jour avec succès:', pkg);

      // 2. Mettre à jour le statut de la mission associée
      try {
        const mission = await missionsService.findByPackageId(packageId);
        console.log('Mission trouvée:', mission);
        
        if (mission) {
          let missionStatus: MissionStatus;
          switch (payload.status) {
            case 'in_progress':
              missionStatus = MissionStatus.IN_PROGRESS;
              break;
            case 'delivered':
              missionStatus = MissionStatus.COMPLETED;
              break;
            case 'issue':
              missionStatus = MissionStatus.CANCELLED;
              break;
            default:
              missionStatus = MissionStatus.ASSIGNED;
          }
          console.log('Mise à jour du statut de la mission:', mission.id, '->', missionStatus);
          await missionsService.updateStatus(mission.id, missionStatus);
          console.log('Mission mise à jour avec succès');
        } else {
          console.warn('Aucune mission trouvée pour le colis:', packageId);
        }
      } catch (missionError) {
        console.error('Erreur lors de la mise à jour de la mission:', missionError);
        // Ne pas bloquer la mise à jour du colis si la mission échoue
        // Mais on continue quand même
      }

      return mapPackageToMission(pkg);
    } catch (error: any) {
      console.error('Erreur dans updateDelivery:', error);
      console.error('Type d\'erreur:', typeof error);
      console.error('Erreur complète:', JSON.stringify(error, null, 2));
      
      // Extraire le message d'erreur de différentes façons possibles
      let errorMessage = 'Erreur inconnue';
      
      // Gérer les erreurs ApiError du httpClient
      if (error?.message) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.status) {
        errorMessage = `Erreur HTTP ${error.status}: ${error.message || 'Erreur serveur'}`;
      } else if (error?.response?.status) {
        errorMessage = `Erreur HTTP ${error.response.status}: ${error.response.statusText || 'Erreur serveur'}`;
      }
      
      console.error('Message d\'erreur extrait:', errorMessage);
      throw new Error(`Impossible de mettre à jour la livraison: ${errorMessage}`);
    }
  },
};
