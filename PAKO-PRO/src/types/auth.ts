export type UserRole = 'driver' | 'agent';

export type AuthMode = 'login' | 'register';

export interface AuthUser {
  id: string;
  phone: string;
  fullName: string;
  role: UserRole;
}

export interface Credentials {
  phone: string;
  password: string;
  fullName?: string;
  role: UserRole;
}

