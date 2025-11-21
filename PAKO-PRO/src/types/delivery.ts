export type DeliveryStatus = 'pending' | 'in_progress' | 'delivered' | 'issue';

export interface DeliveryAddress {
  label: string;
  details: string;
  contactName?: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
}

export interface DeliveryMission {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  pickupStation: DeliveryAddress;
  dropoffLocation: DeliveryAddress;
  status: DeliveryStatus;
  scheduledAt: string;
  notes?: string;
  photoUrl?: string;
  proofCode?: string;
  totalPrice?: number;
  paymentMethod?: string;
}

export interface DeliveryUpdatePayload {
  status: DeliveryStatus;
  proofCode?: string;
  proofPhotoUri?: string;
  notes?: string;
}
