import { httpClient } from '../http-client';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  userType: 'customer' | 'delivery_person' | 'station_agent' | 'admin';
  status: string;
  isVerified: boolean;
  profilePhoto?: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  profilePhoto?: string;
}

class UsersService {
  // Récupérer tous les utilisateurs
  async findAll(): Promise<User[]> {
    return httpClient.get<User[]>('users');
  }

  // Récupérer un utilisateur par ID
  async findOne(id: string): Promise<User> {
    return httpClient.get<User>(`users/${id}`);
  }

  // Mettre à jour un utilisateur
  async update(id: string, data: UpdateUserDto): Promise<User> {
    return httpClient.patch<User>(`users/${id}`, data);
  }

  // Supprimer un utilisateur
  async remove(id: string): Promise<void> {
    return httpClient.delete<void>(`users/${id}`);
  }
}

export const usersService = new UsersService();

