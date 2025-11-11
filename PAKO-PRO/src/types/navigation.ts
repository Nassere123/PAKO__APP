import type { DeliveryStatus } from './delivery';

export type DriverDeliveriesStackParamList = {
  DriverDeliveriesHome: undefined;
  DriverDeliveryList: {
    title: string;
    statuses: DeliveryStatus[];
  };
};

export type DriverTabParamList = {
  DriverHome: undefined;
  DriverDeliveries: undefined;
  DriverProfile: undefined;
};

export type AgentTabParamList = {
  AgentHome: undefined;
  AgentParcels: undefined;
  AgentProfile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};
