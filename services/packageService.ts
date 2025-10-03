import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PackageData {
  id: string;
  trackingNumber: string;
  status: 'pending' | 'in_transit' | 'arrived' | 'delivered' | 'cancelled';
  description: string;
  sender: string;
  estimatedArrival?: string;
  actualArrival?: string;
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
  canCancel: boolean;
}

const PACKAGES_KEY = '@pako_packages';

export class PackageService {
  // Récupérer tous les colis de l'utilisateur
  static async getUserPackages(): Promise<PackageData[]> {
    try {
      const packagesString = await AsyncStorage.getItem(PACKAGES_KEY);
      if (packagesString) {
        const packages = JSON.parse(packagesString);
        // Mettre à jour le statut canCancel pour chaque colis
        return packages.map((pkg: PackageData) => ({
          ...pkg,
          canCancel: this.canCancelPackage(pkg.status)
        }));
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des colis:', error);
      return [];
    }
  }

  // Vérifier si un colis peut être annulé
  static canCancelPackage(status: string): boolean {
    return status === 'pending' || status === 'in_transit';
  }

  // Annuler un colis
  static async cancelPackage(packageId: string): Promise<boolean> {
    try {
      const packages = await this.getUserPackages();
      const packageIndex = packages.findIndex(pkg => pkg.id === packageId);
      
      if (packageIndex === -1) {
        throw new Error('Colis non trouvé');
      }

      const packageToCancel = packages[packageIndex];
      
      // Vérifier si le colis peut être annulé
      if (!this.canCancelPackage(packageToCancel.status)) {
        throw new Error('Ce colis ne peut plus être annulé');
      }

      // Mettre à jour le statut
      packages[packageIndex] = {
        ...packageToCancel,
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
        canCancel: false
      };

      // Sauvegarder
      await AsyncStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'annulation du colis:', error);
      throw error;
    }
  }

  // Créer un nouveau colis (pour les tests)
  static async createPackage(packageData: Omit<PackageData, 'id' | 'createdAt' | 'updatedAt' | 'canCancel'>): Promise<PackageData> {
    try {
      const packages = await this.getUserPackages();
      const newPackage: PackageData = {
        ...packageData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        canCancel: this.canCancelPackage(packageData.status)
      };

      packages.push(newPackage);
      await AsyncStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
      return newPackage;
    } catch (error) {
      console.error('Erreur lors de la création du colis:', error);
      throw error;
    }
  }

  // Mettre à jour le statut d'un colis (simulation de l'agent de gare)
  static async updatePackageStatus(packageId: string, newStatus: PackageData['status']): Promise<boolean> {
    try {
      const packages = await this.getUserPackages();
      const packageIndex = packages.findIndex(pkg => pkg.id === packageId);
      
      if (packageIndex === -1) {
        throw new Error('Colis non trouvé');
      }

      packages[packageIndex] = {
        ...packages[packageIndex],
        status: newStatus,
        updatedAt: new Date().toISOString(),
        canCancel: this.canCancelPackage(newStatus),
        ...(newStatus === 'arrived' && { actualArrival: new Date().toISOString() }),
        ...(newStatus === 'delivered' && { deliveryDate: new Date().toISOString() })
      };

      await AsyncStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  // Obtenir les colis par statut
  static async getPackagesByStatus(status: PackageData['status']): Promise<PackageData[]> {
    try {
      const packages = await this.getUserPackages();
      return packages.filter(pkg => pkg.status === status);
    } catch (error) {
      console.error('Erreur lors de la récupération des colis par statut:', error);
      return [];
    }
  }

  // Obtenir les colis en cours de livraison (qui peuvent être annulés)
  static async getActivePackages(): Promise<PackageData[]> {
    try {
      const packages = await this.getUserPackages();
      return packages.filter(pkg => pkg.canCancel);
    } catch (error) {
      console.error('Erreur lors de la récupération des colis actifs:', error);
      return [];
    }
  }

  // Créer des données de test
  static async createTestData(): Promise<void> {
    try {
      const testPackages: Omit<PackageData, 'id' | 'createdAt' | 'updatedAt' | 'canCancel'>[] = [
        {
          trackingNumber: 'PK001',
          status: 'pending',
          description: 'Livre commandé sur Amazon',
          sender: 'Amazon',
          estimatedArrival: '2024-01-15'
        },
        {
          trackingNumber: 'PK002',
          status: 'in_transit',
          description: 'Vêtements - Zalando',
          sender: 'Zalando',
          estimatedArrival: '2024-01-16'
        },
        {
          trackingNumber: 'PK003',
          status: 'arrived',
          description: 'Électronique - Boulanger',
          sender: 'Boulanger',
          estimatedArrival: '2024-01-14',
          actualArrival: '2024-01-14'
        },
        {
          trackingNumber: 'PK004',
          status: 'delivered',
          description: 'Livres - Fnac',
          sender: 'Fnac',
          estimatedArrival: '2024-01-10',
          actualArrival: '2024-01-10',
          deliveryDate: '2024-01-11'
        }
      ];

      for (const pkg of testPackages) {
        await this.createPackage(pkg);
      }
    } catch (error) {
      console.error('Erreur lors de la création des données de test:', error);
    }
  }
}
