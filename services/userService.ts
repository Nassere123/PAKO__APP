import { apiService } from '../lib/api';
import { User, ApiResponse } from '../types';

interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export const UserService = {
  async getProfile(userId: string): Promise<ServiceResult<User>> {
    try {
      const response = await apiService.get<ApiResponse<User>>(`/users/${userId}`);
      return { success: true, data: response.data.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la récupération du profil' 
      };
    }
  },

  async updateProfile(userId: string, userData: Partial<User>): Promise<ServiceResult<User>> {
    try {
      const response = await apiService.put<ApiResponse<User>>(`/users/${userId}`, userData);
      return { success: true, data: response.data.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la mise à jour' 
      };
    }
  },

  async deleteAccount(userId: string): Promise<ServiceResult<void>> {
    try {
      await apiService.delete(`/users/${userId}`);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la suppression' 
      };
    }
  },
};
