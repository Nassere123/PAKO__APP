export type ParcelStatus = 'arrived' | 'verified' | 'ready_for_delivery' | 'assigned' | 'delivered';

export interface Parcel {
  id: string;
  trackingNumber: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  description?: string;
  status: ParcelStatus;
  arrivedAt: string;
  verifiedAt?: string;
  assignedToDriverId?: string;
  assignedToDriverName?: string;
  assignedAt?: string;
  notes?: string;
  stationId: string;
  stationName: string;
  orderDate?: string; // Date de création de la commande
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  isAvailable: boolean;
  currentDeliveriesCount: number;
  rating?: number;
  vehicleType?: string;
  userId?: string; // ID de l'utilisateur pour les notifications
}

export interface ParcelVerificationPayload {
  verified: boolean;
  notes?: string;
}

export interface ParcelAssignmentPayload {
  driverId: string;
  driverName: string;
}

