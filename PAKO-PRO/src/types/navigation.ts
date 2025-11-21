import type { DeliveryStatus } from './delivery';
import type { ParcelStatus } from './parcel';

export type DriverDeliveriesStackParamList = {
  DriverDeliveriesHome: undefined;
  DriverDeliveryList: {
    title: string;
    statuses: DeliveryStatus[];
  };
  DriverNavigation: {
    missionId: string;
  };
  DriverSignature: {
    missionId: string;
  };
};

export type DriverTabParamList = {
  DriverHome: undefined;
  DriverDeliveries: undefined;
  DriverProfile: undefined;
};

export type AgentParcelsStackParamList = {
  AgentParcelsHome: undefined;
  AgentParcelList: {
    title: string;
    status: ParcelStatus;
  };
};

export type AgentTabParamList = {
  AgentHome: undefined;
  AgentOrders: undefined;
  AgentParcels: undefined;
  AgentProfile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};
