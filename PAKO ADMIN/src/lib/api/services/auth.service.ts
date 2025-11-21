import { httpClient } from '../http-client';

export interface LoginDto {
  phone: string;
  otpCode: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  userType: 'customer' | 'delivery_person' | 'station_agent' | 'admin';
}

export interface SendOtpDto {
  phone: string;
}

export interface VerifyOtpDto {
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

  // Inscription
  async register(data: RegisterDto) {
    return httpClient.post<{ message: string; user: UserInfo }>('auth/register', data);
  }

  // Connexion
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('auth/login', data);
    // Sauvegarder le token
    if (response.access_token) {
      httpClient.setToken(response.access_token);
    }
    return response;
  }

  // Déconnexion
  async logout(userId: string) {
    const response = await httpClient.post<{ message: string }>('auth/logout', { userId });
    httpClient.clearToken();
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

  // Obtenir le statut de tous les utilisateurs
  async getUsersStatus() {
    return httpClient.get<{
      connectedUsers: UserInfo[];
      disconnectedUsers: UserInfo[];
      stats: {
        totalUsers: number;
        connectedCount: number;
        disconnectedCount: number;
      };
    }>('auth/users-status');
  }
}

export const authService = new AuthService();

