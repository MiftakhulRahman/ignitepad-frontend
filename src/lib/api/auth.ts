import apiClient from './client';
import { ApiResponse, LoginFormData, RegisterFormData, User } from '@/types';

export const authApi = {
  async register(data: RegisterFormData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginFormData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  async logout(): Promise<ApiResponse<null>> {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  async me(): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  async checkUsername(username: string): Promise<ApiResponse<{ available: boolean }>> {
    const response = await apiClient.post('/auth/check-username', { username });
    return response.data;
  },
};
