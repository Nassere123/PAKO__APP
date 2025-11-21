import { httpClient } from '../http-client';

export interface SendOtpDto {
  phone: string;
}

export interface VerifyOtpDto {
  phone: string;
  otpCode: string;
}

export interface LoginDto {
  phone: string;
  otpCode: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    userType: string;
    isVerified: boolean;
  };
}

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  userType: string;
  status: string;
  isVerified: boolean;
  profilePhoto?: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

class AuthService {
  // Envoyer un code OTP
  async sendOtp(data: SendOtpDto) {
    return httpClient.post<{ message: string; expiresIn: number }>('auth/send-otp', data);
  }

  // Vérifier un code OTP
  async verifyOtp(data: VerifyOtpDto) {
    return httpClient.post<{ message: string; user: UserInfo }>('auth/verify-otp', data);
  }

  // Connexion
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('auth/login', data);
    // Sauvegarder le token
    if (response.access_token) {
      await httpClient.setToken(response.access_token);
    }
    return response;
  }

  // Déconnexion (pour les agents de gare)
  async logout(userId: string) {
    const response = await httpClient.post<{ message: string }>('auth/logout', { userId });
    await httpClient.clearToken();
    return response;
  }

  // Déconnexion d'un livreur
  async logoutDriver(driverId: string) {
    const response = await httpClient.post<{ message: string }>(`auth/drivers/${driverId}/logout`);
    await httpClient.clearToken();
    return response;
  }

  // Récupérer les informations utilisateur par téléphone
  async getUserInfo(phone: string) {
    return httpClient.post<{ user: UserInfo }>('auth/user-info', { phone });
  }

  // Récupérer les informations utilisateur par ID
  async getUserById(userId: string) {
    return httpClient.post<{ user: UserInfo }>('auth/user-by-id', { userId });
  }

  // Connexion d'un travailleur avec mot de passe (pour les agents de gare)
  async loginWorker(phone: string, password: string): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('auth/login-worker', { phone, password });
    // Sauvegarder le token
    if (response.access_token) {
      await httpClient.setToken(response.access_token);
    }
    return response;
  }

  // Connexion d'un livreur avec mot de passe
  async loginDriver(phone: string, password: string): Promise<{ access_token: string; driver: any }> {
    const response = await httpClient.post<{ access_token: string; driver: any }>('auth/drivers/login', { phone, password });
    // Sauvegarder le token
    if (response.access_token) {
      await httpClient.setToken(response.access_token);
    }
    return response;
  }
}

export const authService = new AuthService();

