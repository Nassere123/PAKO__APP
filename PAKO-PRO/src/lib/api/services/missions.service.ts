import { httpClient } from '../http-client';

export enum MissionStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Mission {
  id: string;
  missionNumber: string;
  status: MissionStatus;
  packageId: string;
  deliveryPersonId?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  package?: any;
  deliveryPerson?: any;
}

class MissionsService {
  // Récupérer les missions d'un livreur
  async findByDriverId(driverId: string, status?: MissionStatus): Promise<Mission[]> {
    const query = status ? `?status=${status}` : '';
    return httpClient.get<Mission[]>(`missions/driver/${driverId}${query}`);
  }

  // Récupérer une mission par ID
  async findOne(id: string): Promise<Mission> {
    return httpClient.get<Mission>(`missions/${id}`);
  }

  // Récupérer la mission d'un colis
  async findByPackageId(packageId: string): Promise<Mission | null> {
    return httpClient.get<Mission | null>(`missions/package/${packageId}`);
  }

  // Mettre à jour le statut d'une mission
  async updateStatus(missionId: string, status: MissionStatus): Promise<Mission> {
    return httpClient.patch<Mission>(`missions/${missionId}/status`, { status });
  }

  // Démarrer une mission (statut -> in_progress)
  async startMission(missionId: string): Promise<Mission> {
    return this.updateStatus(missionId, MissionStatus.IN_PROGRESS);
  }

  // Terminer une mission (statut -> completed)
  async completeMission(missionId: string): Promise<Mission> {
    return this.updateStatus(missionId, MissionStatus.COMPLETED);
  }

  // Annuler une mission (statut -> cancelled)
  async cancelMission(missionId: string): Promise<Mission> {
    return this.updateStatus(missionId, MissionStatus.CANCELLED);
  }
}

export const missionsService = new MissionsService();

