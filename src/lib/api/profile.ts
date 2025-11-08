import apiClient from './client';
import { ApiResponse, User, ProfileUpdateData } from '@/types';

export const profileApi = {
  async get(): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  async update(data: ProfileUpdateData): Promise<ApiResponse<User>> {
    const response = await apiClient.put('/profile', data);
    return response.data;
  },

  async updateSettings(data: {
    email_notifications?: boolean;
    push_notifications?: boolean;
  }): Promise<ApiResponse<User>> {
    const response = await apiClient.put('/profile/settings', data);
    return response.data;
  },

  async getPublicProfile(username: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get(`/profiles/@${username}`);
    return response.data;
  },
};
