import { DeliveryMission, DeliveryUpdatePayload } from '../types/delivery';
import { notificationService } from './notificationService';

type DeliveryEventType = 'refresh' | 'update' | 'new';

type DeliveryListener = (event: {
  missions: DeliveryMission[];
  type: DeliveryEventType;
  mission?: DeliveryMission;
}) => void;

let MOCK_DELIVERIES: DeliveryMission[] = [];

const listeners = new Set<DeliveryListener>();

const mockQueue: DeliveryMission[] = [
  {
    id: 'DEL-2025-003',
    code: '319742',
    customerName: 'Salif Traoré',
    customerPhone: '+2250587654321',
    pickupStation: {
      label: 'Gare d’Abobo',
      details: 'Point relais 2',
    },
    dropoffLocation: {
      label: 'Clinique Danga',
      details: 'Accueil principal - Cocody',
      contactName: 'Service logistique',
      contactPhone: '+2250177889900',
    },
    status: 'pending',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'DEL-2025-004',
    code: '904517',
    customerName: 'Kouadio Essi',
    customerPhone: '+2250744332211',
    pickupStation: {
      label: 'Gare de Treichville',
      details: 'Entrepôt principal',
    },
    dropoffLocation: {
      label: 'Immeuble Alpha, Plateau',
      details: '5e étage, service accueil',
      contactName: 'Kouadio Essi',
      contactPhone: '+2250744332211',
    },
    status: 'pending',
    scheduledAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
  },
];

let mockTimer: ReturnType<typeof setTimeout> | null = null;

const notifyListeners = (type: DeliveryEventType, mission?: DeliveryMission) => {
  const snapshot = [...MOCK_DELIVERIES];
  listeners.forEach((listener) => listener({ missions: snapshot, type, mission }));

  if (type === 'new' && mission) {
    notificationService.push({
      id: mission.id,
      title: 'Nouvelle mission assignée',
      message: `${mission.customerName} - ${mission.dropoffLocation.label}`,
      type: 'mission',
      timestamp: Date.now(),
    });
  }
};

const scheduleNextMockMission = () => {
  if (mockTimer) {
    clearTimeout(mockTimer);
    mockTimer = null;
  }

  if (listeners.size === 0 || mockQueue.length === 0) {
    return;
  }

  mockTimer = setTimeout(() => {
    const mission = mockQueue.shift();
    if (!mission) {
      scheduleNextMockMission();
      return;
    }

    MOCK_DELIVERIES = [...MOCK_DELIVERIES, mission];
    notifyListeners('new', mission);
    scheduleNextMockMission();
  }, 20000);
};

export const deliveryService = {
  listAssignedDeliveries: async (): Promise<DeliveryMission[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return MOCK_DELIVERIES;
  },

  getDeliveryById: async (id: string): Promise<DeliveryMission | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return MOCK_DELIVERIES.find((mission) => mission.id === id);
  },

  updateDelivery: async (
    id: string,
    payload: DeliveryUpdatePayload,
  ): Promise<DeliveryMission | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    let updatedMission: DeliveryMission | undefined;
    MOCK_DELIVERIES = MOCK_DELIVERIES.map((mission) => {
      if (mission.id !== id) {
        return mission;
      }

      updatedMission = {
        ...mission,
        status: payload.status,
        notes: payload.notes ?? mission.notes,
        photoUrl: payload.proofPhotoUri ?? mission.photoUrl,
        proofCode: payload.proofCode ?? mission.proofCode,
      };

      return updatedMission;
    });

    if (updatedMission) {
      notifyListeners('update', updatedMission);
    }

    return updatedMission;
  },

  subscribe: (listener: DeliveryListener) => {
    listeners.add(listener);
    listener({ missions: [...MOCK_DELIVERIES], type: 'refresh' });
    scheduleNextMockMission();
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && mockTimer) {
        clearTimeout(mockTimer);
        mockTimer = null;
      }
    };
  },

  reset: () => {
    MOCK_DELIVERIES = [...MOCK_DELIVERIES];
    notifyListeners('refresh');
  },
};
