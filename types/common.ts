// Types communs pour l'application
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  status: string;
  timestamp: Date;
}

export interface ApiError {
  message: string;
  status: number;
  type: 'network_error' | 'validation_error' | 'auth_error' | 'server_error';
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: Address;
  type: UserType;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export enum UserType {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  DRIVER = 'driver',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export interface AuthCredentials {
  phone: string; // Numéro complet avec indicatif (+225XXXXXXXX)
}

export interface RegisterData extends AuthCredentials {
  firstName: string;
  lastName: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface PhoneVerification {
  phone: string;
  code: string;
  verificationId: string;
}

export interface VerificationResult {
  success: boolean;
  message?: string;
  error?: string;
}
