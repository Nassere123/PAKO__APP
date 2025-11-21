import { Parcel } from '../types/parcel';

export interface AgentStatistics {
  totalVerified: number;
  totalAssigned: number;
  totalReady: number;
  totalArrived: number;
  thisMonthVerified: number;
  thisMonthAssigned: number;
}

export interface CommissionRecord {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: 'verification' | 'assignment' | 'bonus';
  parcelId?: string;
  parcelTrackingNumber?: string;
}

export interface CommissionSummary {
  total: number;
  thisMonth: number;
  lastMonth: number;
  pending: number;
  records: CommissionRecord[];
}

// Taux de commission (en FCFA)
const COMMISSION_RATES = {
  verification: 500, // 500 FCFA par colis vérifié
  assignment: 1000, // 1000 FCFA par colis assigné
  bonus: 2000, // Bonus mensuel si objectif atteint
};

const MOCK_COMMISSIONS: CommissionRecord[] = [
  {
    id: 'COMM-001',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 500,
    description: 'Vérification colis TRK-2025-002',
    type: 'verification',
    parcelId: 'PARC-002',
    parcelTrackingNumber: 'TRK-2025-002',
  },
  {
    id: 'COMM-002',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 1000,
    description: 'Assignation colis TRK-2025-004',
    type: 'assignment',
    parcelId: 'PARC-004',
    parcelTrackingNumber: 'TRK-2025-004',
  },
  {
    id: 'COMM-003',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 500,
    description: 'Vérification colis TRK-2025-006',
    type: 'verification',
    parcelId: 'PARC-006',
    parcelTrackingNumber: 'TRK-2025-006',
  },
  {
    id: 'COMM-004',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 2000,
    description: 'Bonus mensuel - Objectif atteint',
    type: 'bonus',
  },
];

export const agentStatsService = {
  // Calculer les statistiques de l'agent
  getStatistics: async (stationId: string, parcels: Parcel[]): Promise<AgentStatistics> => {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const stationParcels = parcels.filter((p) => p.stationId === stationId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalVerified = stationParcels.filter((p) => p.status === 'verified' || p.verifiedAt).length;
    const totalAssigned = stationParcels.filter((p) => p.status === 'assigned').length;
    const totalReady = stationParcels.filter((p) => p.status === 'ready_for_delivery').length;
    const totalArrived = stationParcels.filter((p) => p.status === 'arrived').length;

    const thisMonthVerified = stationParcels.filter(
      (p) => p.verifiedAt && new Date(p.verifiedAt) >= startOfMonth
    ).length;

    const thisMonthAssigned = stationParcels.filter(
      (p) => p.assignedAt && new Date(p.assignedAt) >= startOfMonth
    ).length;

    return {
      totalVerified,
      totalAssigned,
      totalReady,
      totalArrived,
      thisMonthVerified,
      thisMonthAssigned,
    };
  },

  // Récupérer le résumé des commissions
  getCommissionSummary: async (agentId: string): Promise<CommissionSummary> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const allRecords = MOCK_COMMISSIONS;
    const total = allRecords.reduce((sum, r) => sum + r.amount, 0);

    const thisMonth = allRecords
      .filter((r) => new Date(r.date) >= startOfMonth)
      .reduce((sum, r) => sum + r.amount, 0);

    const lastMonth = allRecords
      .filter((r) => {
        const recordDate = new Date(r.date);
        return recordDate >= startOfLastMonth && recordDate <= endOfLastMonth;
      })
      .reduce((sum, r) => sum + r.amount, 0);

    // Commissions en attente (non payées)
    const pending = allRecords
      .filter((r) => {
        const recordDate = new Date(r.date);
        const daysDiff = Math.floor((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
        // Considérer comme en attente si moins de 7 jours
        return daysDiff < 7;
      })
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      total,
      thisMonth,
      lastMonth,
      pending,
      records: allRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  },

  // Calculer la commission pour une action
  calculateCommission: (type: 'verification' | 'assignment' | 'bonus'): number => {
    return COMMISSION_RATES[type];
  },
};

