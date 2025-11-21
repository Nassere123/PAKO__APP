import { Driver } from '../types/parcel';
import { deliveryPersonsService, DeliveryPerson, DeliveryPersonStatus, VehicleType } from '../lib/api/services/delivery-persons.service';

// Fonction pour convertir DeliveryPerson (backend) en Driver (frontend)
const convertDeliveryPersonToDriver = (dp: DeliveryPerson): Driver => {
  const fullName = dp.firstName && dp.lastName
    ? `${dp.firstName} ${dp.lastName}`.trim()
    : 'Livreur inconnu';
  
  const phone = dp.phone || 'N/A';
  
  // isAvailable = livreur connecté (isOnline = true) et actif
  const isAvailable = dp.isOnline === true && dp.isActive === true;
  
  // Convertir le type de véhicule depuis le premier véhicule ou par défaut
  let vehicleType = 'Moto';
  if (dp.vehicles && dp.vehicles.length > 0) {
    const firstVehicle = dp.vehicles[0];
    if (firstVehicle.vehicleType === VehicleType.CAR) {
      vehicleType = 'Voiture';
    } else if (firstVehicle.vehicleType === VehicleType.VAN) {
      vehicleType = 'Camionnette';
    } else if (firstVehicle.vehicleType === VehicleType.TRUCK) {
      vehicleType = 'Camion';
    }
  }

  const driver: Driver = {
    id: dp.id,
    name: fullName,
    phone: phone,
    isAvailable: isAvailable, // Basé sur isOnline
    currentDeliveriesCount: 0, // TODO: Calculer depuis les missions assignées
    rating: dp.rating || 0,
    vehicleType: vehicleType,
    userId: dp.id, // Utiliser l'ID du livreur pour les notifications
  };

  // Log pour déboguer
  if (__DEV__) {
    console.log('Livreur converti:', {
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      isAvailable: driver.isAvailable,
      isOnline: dp.isOnline,
      isActive: dp.isActive,
    });
  }

  return driver;
};

export const driverService = {
  // Récupérer tous les livreurs depuis le backend
  getAllDrivers: async (): Promise<Driver[]> => {
    try {
      const deliveryPersons = await deliveryPersonsService.findAll();
      return deliveryPersons.map(convertDeliveryPersonToDriver);
    } catch (error) {
      console.error('Erreur lors de la récupération des livreurs:', error);
      return [];
    }
  },

      // Récupérer les livreurs disponibles depuis le backend
      // Retourner tous les livreurs actifs, mais seuls ceux avec isOnline=true peuvent être assignés
      getAvailableDrivers: async (): Promise<Driver[]> => {
        try {
          console.log('🔄 Début de la récupération des livreurs...');
          // Récupérer tous les livreurs actifs (pour affichage)
          const allDeliveryPersons = await deliveryPersonsService.findAll();
          console.log('📦 Réponse brute de l\'API:', JSON.stringify(allDeliveryPersons, null, 2));
          console.log('📊 Nombre total de livreurs récupérés:', allDeliveryPersons.length);
          
          if (!Array.isArray(allDeliveryPersons)) {
            console.error('❌ La réponse de l\'API n\'est pas un tableau:', typeof allDeliveryPersons);
            return [];
          }
          
          const activeDeliveryPersons = allDeliveryPersons.filter(dp => {
            const isActive = dp.isActive === true;
            console.log(`📋 Livreur ${dp.id}: isActive=${dp.isActive}, isOnline=${dp.isOnline}`);
            return isActive;
          });
          
          console.log('✅ Livreurs actifs filtrés:', activeDeliveryPersons.length);
          activeDeliveryPersons.forEach(dp => {
            console.log(`  - ID: ${dp.id}, Nom: ${dp.firstName} ${dp.lastName}, isOnline: ${dp.isOnline}, isActive: ${dp.isActive}`);
          });
          
          const drivers = activeDeliveryPersons.map(convertDeliveryPersonToDriver);
          
          console.log('🎯 Livreurs convertis pour affichage:', drivers.length);
          drivers.forEach(driver => {
            console.log(`  - ${driver.name} (${driver.phone}) - Connecté: ${driver.isAvailable}`);
          });
          
          return drivers;
        } catch (error) {
          console.error('❌ Erreur lors de la récupération des livreurs:', error);
          if (error instanceof Error) {
            console.error('   Message:', error.message);
            console.error('   Stack:', error.stack);
          }
          return [];
        }
      },

  // Récupérer un livreur par ID depuis le backend
  getDriverById: async (id: string): Promise<Driver | undefined> => {
    try {
      const deliveryPerson = await deliveryPersonsService.findOne(id);
      return convertDeliveryPersonToDriver(deliveryPerson);
    } catch (error) {
      console.error('Erreur lors de la récupération du livreur:', error);
      return undefined;
    }
  },

  // Mettre à jour le statut d'un livreur dans le backend
  updateDriverAvailability: async (
    id: string,
    isAvailable: boolean
  ): Promise<Driver | undefined> => {
    try {
      const status = isAvailable 
        ? DeliveryPersonStatus.AVAILABLE 
        : DeliveryPersonStatus.BUSY;
      const deliveryPerson = await deliveryPersonsService.updateStatus(id, status);
      return convertDeliveryPersonToDriver(deliveryPerson);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du livreur:', error);
      return undefined;
    }
  },

  // Incrémenter le nombre de livraisons d'un livreur
  // Note: Cette fonctionnalité devrait être gérée côté backend via les missions
  incrementDriverDeliveries: async (id: string): Promise<Driver | undefined> => {
    try {
      // Pour l'instant, on met simplement le livreur en BUSY
      const deliveryPerson = await deliveryPersonsService.updateStatus(id, DeliveryPersonStatus.BUSY);
      return convertDeliveryPersonToDriver(deliveryPerson);
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des livraisons:', error);
      return undefined;
    }
  },

  // Mettre à jour le statut en ligne d'un livreur
  updateOnlineStatus: async (id: string, isOnline: boolean): Promise<void> => {
    try {
      await deliveryPersonsService.updateOnlineStatus(id, isOnline);
      if (__DEV__) {
        console.log(`✅ Statut en ligne mis à jour pour ${id}: ${isOnline}`);
      }
    } catch (error: any) {
      // Ne pas logger les erreurs réseau comme des erreurs critiques
      // Ce sont souvent des problèmes temporaires qui se résolvent automatiquement
      if (error?.status === 0 || error?.message?.includes('Serveur accessible')) {
        // Erreur réseau temporaire, ne pas logger comme erreur critique
        if (__DEV__) {
          console.warn(`⚠️ Problème réseau temporaire lors de la mise à jour du statut en ligne (${id}):`, error.message);
        }
      } else {
        // Erreur réelle (404, 500, etc.)
        console.error('Erreur lors de la mise à jour du statut en ligne du livreur:', error);
      }
    }
  },
};

